// src/app/(dashboard)/admin/auditoria/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Clock, ChevronRight, ArrowLeft, Ticket, CheckCircle2, AlertTriangle } from "lucide-react";
import { AdminAuditTable } from "@/components/admin/admin-audit-table";

export default async function AdminAuditoriaPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard/tickets");
  }

  const [tickets, totalTickets, openTickets, inProgressTickets, resolvedTickets] =
    await Promise.all([
      prisma.ticket.findMany({
        include: {
          group: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "OPEN" } }),
      prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    ]);

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
            <span className="font-semibold text-stone-800 dark:text-stone-200">Auditoría Global de Tickets</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Auditoría Global de Tickets
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                Registro inmutable de trazabilidad de incidencias, estados y asignaciones en toda la empresa.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/tickets"
            className="bg-[#B4461B] hover:bg-[#9A3412] text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-colors"
          >
            <Ticket className="w-4 h-4" />
            <span>Ver Mis Tickets</span>
          </Link>
        </div>
      </div>

      {/* Métricas de Auditoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 p-5 rounded-2xl shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Tickets Auditados
            </span>
            <div className="p-2 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-2">{totalTickets}</div>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">total acumulado</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 p-5 rounded-2xl shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Abiertos / Pendientes
            </span>
            <div className="p-2 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#C2410C] dark:text-orange-400 mt-2">{openTickets}</div>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">requieren asignación</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 p-5 rounded-2xl shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              En Progreso
            </span>
            <div className="p-2 rounded-xl bg-[#FEF3C7] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#B45309] dark:text-amber-400 mt-2">{inProgressTickets}</div>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">en atención por técnicos</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 p-5 rounded-2xl shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Resueltos / Cerrados
            </span>
            <div className="p-2 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">{resolvedTickets}</div>
          <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">casos concluidos</span>
        </div>
      </div>

      {/* Tabla Completa de Auditoría */}
      <AdminAuditTable tickets={tickets} />
    </div>
  );
}
