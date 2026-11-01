// src/lib/validations/users.ts
import { z } from "zod";
import { Role } from "@prisma/client";

export const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Correo electrónico inválido").toLowerCase(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: "Debes seleccionar un rol válido (ADMIN o USER)" }),
  }),
  groupIds: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export const adminUpdateUserSchema = z.object({
  userId: z.string().min(1, "ID de usuario requerido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Correo electrónico inválido").toLowerCase(),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: "Debes seleccionar un rol válido (ADMIN o USER)" }),
  }),
  isActive: z.boolean(),
  groupIds: z.array(z.string()).optional().default([]),
  password: z.string().optional().or(z.literal("")),
});

export const updateSelfProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Correo electrónico inválido").toLowerCase(),
  currentPassword: z.string().optional().or(z.literal("")),
  newPassword: z.string().optional().or(z.literal("")),
});
