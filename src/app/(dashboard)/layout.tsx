// src/app/(dashboard)/layout.tsx
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Comprobar directamente en la base de datos si el usuario sigue activo
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true },
  });

  if (!dbUser || !dbUser.isActive) {
    redirect("/login?error=inactive");
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] dark:bg-stone-950 flex text-stone-900 dark:text-stone-100 font-sans antialiased">
      {/* Barra Lateral Colapsable */}
      <AppSidebar userRole={session.user.role} />

      {/* Área Principal con Cabecera y Contenido */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AppHeader user={session.user} />

        <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
