// src/server/actions/tickets.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createTicketSchema,
  updateTicketStatusSchema,
  deriveTicketSchema,
  sendChatMessageSchema,
  assignTicketSchema,
} from "@/lib/validations/tickets";
import { TicketStatus, MessageType, Prisma } from "@prisma/client";

// Guard de autenticación interno con verificación de cuenta activa
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado: Debe iniciar sesión");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isActive: true, groups: { select: { id: true } } },
  });

  if (!user || !user.isActive) {
    throw new Error("Acceso denegado: Tu cuenta ha sido desactivada por el administrador");
  }

  return {
    ...session.user,
    role: user.role,
    isActive: user.isActive,
    groupIds: user.groups.map((g) => g.id),
  };
}

// 1. Obtención de Tickets con filtrado RBAC
export async function getTicketsAction(filters?: {
  groupId?: string;
  status?: TicketStatus;
}) {
  const user = await requireAuth();

  const whereClause: Prisma.TicketWhereInput = {};

  // Restricción RBAC: USER solo ve tickets de sus grupos
  if (user.role === "USER") {
    if (filters?.groupId) {
      if (!user.groupIds.includes(filters.groupId)) {
        throw new Error("Acceso denegado: No perteneces a este grupo");
      }
      whereClause.groupId = filters.groupId;
    } else {
      whereClause.groupId = { in: user.groupIds };
    }
  } else if (user.role === "ADMIN" && filters?.groupId) {
    whereClause.groupId = filters.groupId;
  }

  if (filters?.status) {
    whereClause.status = filters.status;
  }

  return await prisma.ticket.findMany({
    where: whereClause,
    include: {
      group: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// 2. Creación de Ticket
export async function createTicketAction(formData: unknown) {
  const user = await requireAuth();
  const parsed = createTicketSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { title, description, priority, groupId } = parsed.data;

  // Si no es ADMIN, verificar que el usuario pertenezca al grupo destino
  if (user.role !== "ADMIN" && !user.groupIds.includes(groupId)) {
    return { success: false, error: "Solo puedes crear tickets en grupos a los que perteneces" };
  }

  const ticket = await prisma.$transaction(async (tx) => {
    const newTicket = await tx.ticket.create({
      data: {
        title,
        description,
        priority,
        groupId,
        createdById: user.id,
      },
    });

    // Mensaje de sistema inicial
    await tx.ticketMessage.create({
      data: {
        ticketId: newTicket.id,
        senderId: user.id,
        type: MessageType.SYSTEM,
        content: `Ticket creado por ${user.name || "Usuario"}`,
      },
    });

    return newTicket;
  });

  revalidatePath("/dashboard/tickets");
  return { success: true, ticketId: ticket.id };
}

// 3. Actualización de Estado (con registro de auditoría en chat)
export async function updateTicketStatusAction(formData: unknown) {
  const user = await requireAuth();
  const parsed = updateTicketStatusSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: "Datos de estado inválidos" };
  }

  const { ticketId, status } = parsed.data;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return { success: false, error: "Ticket no encontrado" };
  }

  // Verificación RBAC: ADMIN o miembro del grupo del ticket
  if (user.role !== "ADMIN" && !user.groupIds.includes(ticket.groupId)) {
    return { success: false, error: "Permiso denegado para modificar este ticket" };
  }

  await prisma.$transaction(async (tx) => {
    const isResolving = status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED;

    await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        resolvedAt: isResolving ? new Date() : null,
      },
    });

    await tx.ticketMessage.create({
      data: {
        ticketId,
        senderId: user.id,
        type: MessageType.SYSTEM,
        content: `El estado del ticket fue actualizado a ${status} por ${user.name || "Usuario"}`,
      },
    });
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  revalidatePath("/dashboard/tickets");
  return { success: true };
}

// 4. Derivación de Ticket a otro Grupo (con desasignación y log inmutable)
export async function deriveTicketAction(formData: unknown) {
  const user = await requireAuth();
  const parsed = deriveTicketSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: "Parámetros de derivación inválidos" };
  }

  const { ticketId, targetGroupId, reason } = parsed.data;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { group: true },
  });

  if (!ticket) {
    return { success: false, error: "Ticket no encontrado" };
  }

  // Comprobar pertenencia al grupo actual o rol ADMIN
  if (user.role !== "ADMIN" && !user.groupIds.includes(ticket.groupId)) {
    return { success: false, error: "No tienes permiso para derivar este ticket" };
  }

  if (ticket.groupId === targetGroupId) {
    return { success: false, error: "El ticket ya pertenece al grupo seleccionado" };
  }

  const targetGroup = await prisma.group.findUnique({
    where: { id: targetGroupId },
  });

  if (!targetGroup) {
    return { success: false, error: "Grupo destino inexistente" };
  }

  await prisma.$transaction(async (tx) => {
    // Al derivar, se transfiere el grupo y se resetea el técnico asignado
    await tx.ticket.update({
      where: { id: ticketId },
      data: {
        groupId: targetGroupId,
        assignedToId: null,
      },
    });

    // Mensaje de auditoría automático en el chat
    await tx.ticketMessage.create({
      data: {
        ticketId,
        senderId: user.id,
        type: MessageType.SYSTEM,
        content: `El ticket fue derivado del Grupo "${ticket.group.name}" al Grupo "${targetGroup.name}" por ${user.name || "Usuario"}. Motivo: ${reason}`,
      },
    });
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  revalidatePath("/dashboard/tickets");
  return { success: true };
}

// 5. Autoasignación de Ticket
export async function assignTicketToSelfAction(ticketId: string) {
  const user = await requireAuth();

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return { success: false, error: "Ticket no encontrado" };
  }

  // Debe pertenecer al grupo del ticket o ser ADMIN
  if (user.role !== "ADMIN" && !user.groupIds.includes(ticket.groupId)) {
    return { success: false, error: "Solo miembros del grupo responsable pueden asignarse el ticket" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticketId },
      data: { assignedToId: user.id },
    });

    await tx.ticketMessage.create({
      data: {
        ticketId,
        senderId: user.id,
        type: MessageType.SYSTEM,
        content: `${user.name || "Usuario"} se ha asignado este ticket`,
      },
    });
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  return { success: true };
}

// 6. Asignación de Ticket a una persona en específico (Admin o responsable)
export async function assignTicketToUserAction(formData: unknown) {
  const user = await requireAuth();
  const parsed = assignTicketSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: "Datos de asignación inválidos" };
  }

  const { ticketId, assignedToId } = parsed.data;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return { success: false, error: "Ticket no encontrado" };
  }

  // Comprobar rol ADMIN o pertenencia al grupo
  if (user.role !== "ADMIN" && !user.groupIds.includes(ticket.groupId)) {
    return { success: false, error: "No tienes permisos para reasignar este ticket" };
  }

  let assignedUser = null;
  if (assignedToId) {
    assignedUser = await prisma.user.findUnique({
      where: { id: assignedToId },
      select: { id: true, name: true },
    });
    if (!assignedUser) {
      return { success: false, error: "Usuario asignado no encontrado" };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticketId },
      data: { assignedToId },
    });

    const actionText = assignedUser
      ? `El ticket fue asignado a ${assignedUser.name} por ${user.name || "Usuario"}`
      : `El ticket fue desasignado por ${user.name || "Usuario"}`;

    await tx.ticketMessage.create({
      data: {
        ticketId,
        senderId: user.id,
        type: MessageType.SYSTEM,
        content: actionText,
      },
    });
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  revalidatePath("/dashboard/tickets");
  return { success: true };
}

// 7. Envío de Mensaje de Chat Interno (con soporte para imágenes)
export async function sendChatMessageAction(formData: unknown) {
  const user = await requireAuth();
  const parsed = sendChatMessageSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: "Mensaje inválido" };
  }

  const { ticketId, content, imageUrl } = parsed.data;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { groupId: true },
  });

  if (!ticket) {
    return { success: false, error: "Ticket no encontrado" };
  }

  if (user.role !== "ADMIN" && !user.groupIds.includes(ticket.groupId)) {
    return { success: false, error: "No tienes acceso para comentar en este ticket" };
  }

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId,
      senderId: user.id,
      content: content || "",
      imageUrl: imageUrl || null,
      type: MessageType.USER,
    },
    include: {
      sender: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  return { success: true, message };
}
