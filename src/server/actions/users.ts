// src/server/actions/users.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  createUserSchema,
  adminUpdateUserSchema,
  updateSelfProfileSchema,
} from "@/lib/validations/users";
import { Role } from "@prisma/client";

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

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw new Error("Acceso denegado: Tu cuenta ha sido desactivada");
  }

  return session.user;
}

// 1. Crear nuevo usuario (Solo Administradores)
export async function createUserAction(formData: unknown) {
  try {
    await requireAdmin();

    const parsed = createUserSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] || "Datos inválidos";
      return { success: false, error: firstError };
    }

    const { name, email, password, role, groupIds, isActive } = parsed.data;

    // Verificar si ya existe un usuario con este email
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return {
        success: false,
        error: "Ya existe un usuario registrado con este correo electrónico",
      };
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario y asociar a grupos si se especificaron
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
        isActive: isActive ?? true,
        groups: groupIds && groupIds.length > 0
          ? {
              connect: groupIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        groups: { select: { id: true, name: true } },
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/grupos");
    return { success: true, user: newUser };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al crear usuario" };
  }
}

// 2. Administrador edita perfil/permisos de un usuario existente
export async function adminUpdateUserAction(formData: unknown) {
  try {
    const adminUser = await requireAdmin();

    const parsed = adminUpdateUserSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] || "Datos inválidos";
      return { success: false, error: firstError };
    }

    const { userId, name, email, role, isActive, groupIds, password } = parsed.data;

    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Si se modifica el email, asegurar que no esté en uso por otro
    if (email !== userToUpdate.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email },
      });
      if (emailInUse && emailInUse.id !== userId) {
        return { success: false, error: "El correo electrónico ya pertenece a otro usuario" };
      }
    }

    // Regla de seguridad: Si el admin se está editando a sí mismo, no puede quitarse el rol ADMIN o desactivarse si es el único
    if (adminUser.id === userId && (role !== "ADMIN" || !isActive)) {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN", isActive: true },
      });
      if (adminCount <= 1) {
        return {
          success: false,
          error: "No puedes degradar o desactivar al único Administrador activo del sistema.",
        };
      }
    }

    // Datos a actualizar
    const updateData: any = {
      name,
      email,
      role: role as Role,
      isActive,
      groups: {
        set: groupIds.map((id) => ({ id })),
      },
    };

    // Si se especificó una nueva contraseña
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres" };
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        groups: { select: { id: true, name: true } },
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/grupos");
    revalidatePath("/", "layout");
    return { success: true, user: updatedUser };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al actualizar usuario" };
  }
}

// 3. Usuario edita su propio perfil (Nombre, Email, Contraseña)
export async function updateSelfProfileAction(formData: unknown) {
  try {
    const sessionUser = await requireAuth();

    const parsed = updateSelfProfileSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] || "Datos inválidos";
      return { success: false, error: firstError };
    }

    const { name, email, currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Verificar email único si lo cambió
    if (email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      if (existing && existing.id !== user.id) {
        return { success: false, error: "El correo electrónico ya está registrado por otro usuario" };
      }
    }

    const updateData: any = {
      name,
      email,
    };

    // Si intenta cambiar la contraseña
    if (newPassword && newPassword.trim().length > 0) {
      if (!currentPassword) {
        return { success: false, error: "Debes ingresar tu contraseña actual para establecer una nueva" };
      }

      if (newPassword.length < 6) {
        return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres" };
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return { success: false, error: "La contraseña actual es incorrecta" };
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    revalidatePath("/", "layout");
    return {
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al actualizar perfil" };
  }
}

// 4. Cambiar estado rápido de usuario (Activar / Desactivar)
export async function toggleUserStatusAction(userId: string) {
  try {
    const adminUser = await requireAdmin();

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    if (adminUser.id === userId && targetUser.isActive) {
      return { success: false, error: "No puedes desactivar tu propia cuenta de Administrador" };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !targetUser.isActive },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/usuarios");
    revalidatePath("/", "layout");
    return { success: true, isActive: updated.isActive };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al alternar estado" };
  }
}
