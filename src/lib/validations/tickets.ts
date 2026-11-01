// src/lib/validations/tickets.ts
import { z } from "zod";
import { TicketPriority, TicketStatus } from "@prisma/client";

export const createTicketSchema = z.object({
  title: z.string().min(5, "El título debe contener al menos 5 caracteres").max(120),
  description: z.string().min(10, "La descripción debe contener al menos 10 caracteres"),
  priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
  groupId: z.string().min(1, "Debe seleccionar un grupo responsable"),
});

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().min(1, "ID de ticket requerido"),
  status: z.nativeEnum(TicketStatus),
});

export const deriveTicketSchema = z.object({
  ticketId: z.string().min(1, "ID de ticket requerido"),
  targetGroupId: z.string().min(1, "Debe seleccionar el grupo destino"),
  reason: z.string().min(5, "Indique el motivo de la derivación"),
});

export const sendChatMessageSchema = z.object({
  ticketId: z.string().min(1, "ID de ticket requerido"),
  content: z.string().max(2000).optional().default(""),
  imageUrl: z.string().optional().nullable(),
}).refine((data) => (data.content && data.content.trim().length > 0) || !!data.imageUrl, {
  message: "Debes enviar un mensaje o adjuntar una imagen",
  path: ["content"],
});

export const assignTicketSchema = z.object({
  ticketId: z.string().min(1, "ID de ticket requerido"),
  assignedToId: z.string().nullable(),
});
