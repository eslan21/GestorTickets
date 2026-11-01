// src/server/actions/groups.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createGroupSchema, updateGroupMembersSchema } from "@/lib/validations/groups";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Acceso denegado: Se requiere rol de Administrador");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isActive: true },
  });

  if (!user || !user.isActive || user.role !== "ADMIN") {
    throw new Error("Acceso denegado: Cuenta desactivada o sin privilegios de Administrador");
  }

  return session.user;
}

export async function createGroupAction(data: z.infer<typeof createGroupSchema>) {
  await requireAdmin();
  const parsed = createGroupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Datos del grupo inválidos" };
  }

  const group = await prisma.group.create({
    data: parsed.data,
  });

  revalidatePath("/admin/grupos");
  revalidatePath("/admin/groups");
  revalidatePath("/admin");
  return { success: true, group };
}

export async function updateGroupMembersAction(data: z.infer<typeof updateGroupMembersSchema>) {
  await requireAdmin();
  const parsed = updateGroupMembersSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Datos de miembros inválidos" };
  }

  const { groupId, userIds } = parsed.data;

  // Sincronización de miembros muchos-a-muchos
  const group = await prisma.group.update({
    where: { id: groupId },
    data: {
      members: {
        set: userIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/admin/grupos");
  revalidatePath("/admin/groups");
  revalidatePath("/admin");
  return { success: true, group };
}

export async function deleteGroupAction(groupId: string) {
  try {
    await requireAdmin();

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: { tickets: true, members: true },
        },
      },
    });

    if (!group) {
      return { success: false, error: "El grupo especificado no existe." };
    }

    if (group._count.tickets > 0) {
      return {
        success: false,
        error: `No se puede eliminar el área "${group.name}" porque tiene ${group._count.tickets} ticket(s) asociado(s). Reasigne o derive los tickets a otra área antes de eliminarla.`,
      };
    }

    await prisma.$transaction(async (tx) => {
      // Desvincular miembros
      await tx.group.update({
        where: { id: groupId },
        data: {
          members: { set: [] },
        },
      });

      // Eliminar el grupo
      await tx.group.delete({
        where: { id: groupId },
      });
    });

    revalidatePath("/admin/grupos");
    revalidatePath("/admin/groups");
    revalidatePath("/admin");
    revalidatePath("/dashboard/tickets");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al eliminar el grupo" };
  }
}

export async function getAllGroupsAction() {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");

  return await prisma.group.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { members: true, tickets: true },
      },
    },
  });
}
