// src/app/(dashboard)/admin/grupos/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Layers, ChevronRight, Users, Ticket, ArrowLeft } from "lucide-react";
import { AdminGroupsCard } from "@/components/admin/admin-groups-card";

export default async function AdminGruposPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard/tickets");
  }

  const groups = await prisma.group.findMany({
    include: {
      _count: {
        select: { members: true, tickets: true },
      },
      members: {
        select: { id: true, name: true, email: true, role: true },
        take: 5,
      },
    },
    orderBy: { name: "asc" },
  });

  const totalMembers = groups.reduce((acc, g) => acc + g._count.members, 0);
  const totalGroupTickets = groups.reduce((acc, g) => acc + g._count.tickets, 0);

  return (
    <div className="space-y-6">
      {/* Navegación y Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1">
            <Link href="/admin" className="hover:text-[#C2410C] dark:hover:text-orange-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Panel Global</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
            <span className="font-semibold text-stone-800 dark:text-stone-200">Grupos y Áreas</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Grupos y Áreas de Soporte
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                Organización de departamentos, niveles de escalamiento y distribución de incidencias.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/usuarios"
            className="bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs flex items-center gap-2 transition-colors"
          >
            <Users className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <span>Ver Asignación de Roles</span>
          </Link>
        </div>
      </div>

      {/* Métricas de Grupos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 p-5 rounded-2xl shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Áreas Configuradas
            </span>
            <div className="p-2 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-2">{groups.length}</div>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">departamentos operativos</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 p-5 rounded-2xl shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Miembros Vinculados
            </span>
            <div className="p-2 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-2">{totalMembers}</div>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">asignaciones registradas</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 p-5 rounded-2xl shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Tickets Gestionados
            </span>
            <div className="p-2 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-2">{totalGroupTickets}</div>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">en cola histórica de áreas</span>
        </div>
      </div>

      {/* Componente Principal de Gestión de Grupos */}
      <div className="w-full">
        <AdminGroupsCard groups={groups} />
      </div>
    </div>
  );
}
