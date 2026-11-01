// src/lib/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const isUserActive = auth?.user?.isActive;

      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      // Si la cuenta está desactivada, denegar acceso inmediatamente
      if (isLoggedIn && !isUserActive) {
        return false;
      }

      // Proteger panel de administración (exclusivo para ADMIN)
      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        return userRole === "ADMIN";
      }

      // Proteger dashboards operativos
      if (isOnDashboard) {
        return isLoggedIn;
      }

      // Redirigir fuera de login si ya está autenticado (a menos que traiga un error como error=inactive)
      if (isOnLogin && isLoggedIn) {
        if (nextUrl.searchParams.has("error")) {
          return true;
        }
        return Response.redirect(new URL("/dashboard/tickets", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.groupIds = user.groupIds;
        token.isActive = user.isActive;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || session.user.id;
        session.user.role = token.role as any;
        session.user.groupIds = (token.groupIds as string[]) || [];
        session.user.isActive = token.isActive !== undefined ? Boolean(token.isActive) : true;
      }
      return session;
    },
  },
  providers: [], // Los proveedores se definen en auth.ts (Node Runtime)
};
