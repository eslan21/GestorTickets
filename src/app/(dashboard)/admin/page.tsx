// src/app/(dashboard)/admin/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Shield,
  Users,
  CheckCircle2,
  Ticket,
  Share2,
} from "lucide-react";
import {
  AdminDashboardCharts,
  DailyTicketMetric,
} from "@/components/admin/admin-dashboard-charts";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard/tickets");
  }

  // Cargar estadísticas y entidades para analítica
  const [
    totalTickets,
    totalUsers,
    totalGroups,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    tickets,
    groups,
  ] = await Promise.all([
    prisma.ticket.count(),
    prisma.user.count(),
    prisma.group.count(),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.ticket.findMany({
      select: {
        id: true,
        createdAt: true,
        resolvedAt: true,
        status: true,
        priority: true,
        groupId: true,
      },
    }),
    prisma.group.findMany({
      include: {
        _count: { select: { tickets: true, members: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Generar datos agrupados día a día para los últimos 30 días
  const now = new Date();
  const dailyData: DailyTicketMetric[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });

    // Tickets creados en este día
    const createdCount = tickets.filter(
      (t) => t.createdAt.toISOString().slice(0, 10) === dateStr
    ).length;

    // Tickets resueltos en este día
    const resolvedCount = tickets.filter(
      (t) => t.resolvedAt && t.resolvedAt.toISOString().slice(0, 10) === dateStr
    ).length;

    dailyData.push({
      date: dateStr,
      label: dayLabel,
      created: createdCount,
      resolved: resolvedCount,
    });
  }

  // Métricas por grupo
  const groupMetrics = groups.map((g) => {
    const groupTickets = tickets.filter((t) => t.groupId === g.id);
    const resolvedInGroup = groupTickets.filter(
      (t) => t.status === "RESOLVED" || t.status === "CLOSED"
    ).length;
    return {
      name: g.name,
      total: g._count.tickets,
      resolved: resolvedInGroup,
    };
  });

  // Distribuciones
  const statusDistribution = {
    open: openTickets,
    inProgress: inProgressTickets,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    closed: tickets.filter((t) => t.status === "CLOSED").length,
  };

  const priorityDistribution = {
    low: tickets.filter((t) => t.priority === "LOW").length,
    medium: tickets.filter((t) => t.priority === "MEDIUM").length,
    high: tickets.filter((t) => t.priority === "HIGH").length,
    critical: tickets.filter((t) => t.priority === "CRITICAL").length,
  };

  return (
    <div className="space-y-6">
      {/* 1. Banner Superior: Panel de Administración Global (RBAC) sin botones */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#B4461B] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Shield className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Panel de Administración Global (RBAC)
              </h1>
              <span className="bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#FDE0D4] dark:border-orange-900/50">
                NIVEL 0 - ROOT
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Supervisión ejecutiva, analítica de rendimiento y métricas de soporte en toda la organización.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas Métricas (4 Columnas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Métricas 1: Tickets Totales */}
        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 p-5 rounded-2xl shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
                Tickets Totales
              </span>
              <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1.5">{totalTickets}</div>
              <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">en cola actual</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C] dark:bg-orange-400" />
              {openTickets} Abiertos
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] dark:bg-amber-400" />
              {inProgressTickets} En Curso
            </span>
          </div>
        </div>

        {/* Métricas 2: Tickets Resueltos */}
        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 p-5 rounded-2xl shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
                Tickets Resueltos
              </span>
              <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1.5">{resolvedTickets}</div>
              <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">ciclo actual</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FEF3C7] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-400">
              ✓ Tasa de resolución activa
            </span>
          </div>
        </div>

        {/* Métricas 3: Usuarios Registrados */}
        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 p-5 rounded-2xl shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
                Usuarios Registrados
              </span>
              <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1.5">{totalUsers}</div>
              <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">colaboradores</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400">
              ● Técnicos y Administradores
            </span>
          </div>
        </div>

        {/* Métricas 4: Grupos / Áreas */}
        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 p-5 rounded-2xl shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
                Grupos / Áreas
              </span>
              <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1.5">{totalGroups}</div>
              <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">departamentos</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-400">
              ✓ Equipos operativos
            </span>
          </div>
        </div>
      </div>

      {/* 3. Gráficas Relevantes: Creados vs Resueltos por Día y Distribución por Área */}
      <AdminDashboardCharts
        dailyData={dailyData}
        groupMetrics={groupMetrics}
        statusDistribution={statusDistribution}
        priorityDistribution={priorityDistribution}
      />
    </div>
  );
}
