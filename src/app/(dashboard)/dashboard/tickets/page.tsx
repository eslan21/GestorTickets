// src/app/(dashboard)/dashboard/tickets/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTicketsAction } from "@/server/actions/tickets";
import { CreateTicketModal } from "@/components/tickets/create-ticket-modal";
import { TicketsList } from "@/components/tickets/tickets-list";
import { TicketFilters } from "@/components/tickets/ticket-filters";
import { TicketStatus } from "@prisma/client";

interface TicketsPageProps {
  searchParams: Promise<{
    groupId?: string;
    status?: TicketStatus;
  }>;
}

export default async function TicketsDashboardPage({ searchParams }: TicketsPageProps) {
  const session = await auth();
  const params = await searchParams;

  // Obtener grupos a los que pertenece el usuario (o todos si es ADMIN)
  const userGroups = await prisma.group.findMany({
    where: session?.user?.role === "ADMIN" ? {} : { id: { in: session?.user?.groupIds || [] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const tickets = await getTicketsAction({
    groupId: params.groupId,
    status: params.status,
  });

  return (
    <div className="space-y-6">
      {/* Header y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Tickets de Soporte
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {session?.user?.role === "ADMIN"
              ? "Vista global de administración y auditoría de incidencias"
              : "Vista unificada de tickets asignados a tus áreas operativas"}
          </p>
        </div>

        <CreateTicketModal userGroups={userGroups} />
      </div>

      {/* Barra de Filtros con Desplegables de Altura Limitada */}
      <TicketFilters
        userGroups={userGroups}
        currentGroupId={params.groupId}
        currentStatus={params.status}
      />

      {/* Lista de Tickets con Paginación (Máximo 5 por página) */}
      <TicketsList tickets={tickets} />
    </div>
  );
}
