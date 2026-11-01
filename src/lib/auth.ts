// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);
        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: {
            groups: {
              select: { id: true },
            },
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // Si el usuario no está activo, rechazar inmediatamente
        if (!user.isActive) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          groupIds: user.groups.map((g) => g.id),
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (token?.id) {
        // Consultar el estado activo en tiempo real desde la base de datos
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, role: true, isActive: true, groups: { select: { id: true } } },
        });

        if (!dbUser || !dbUser.isActive) {
          return {
            ...session,
            user: {
              ...session.user,
              id: token.id as string,
              isActive: false,
              role: (dbUser?.role || "USER") as any,
              groupIds: [],
            },
          };
        }

        session.user.id = dbUser.id;
        session.user.role = dbUser.role;
        session.user.groupIds = dbUser.groups.map((g) => g.id);
        session.user.isActive = dbUser.isActive;
      }
      return session;
    },
  },
});
