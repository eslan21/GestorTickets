// src/lib/validations/groups.ts
import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(2, "El nombre del grupo debe tener al menos 2 caracteres").max(50),
  description: z.string().max(255).optional(),
});

export const updateGroupMembersSchema = z.object({
  groupId: z.string().min(1, "ID de grupo requerido"),
  userIds: z.array(z.string()),
});
