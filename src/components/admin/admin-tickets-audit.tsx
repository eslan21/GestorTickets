// src/components/admin/admin-tickets-audit.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, Ticket } from "lucide-react";
import { TicketStatus } from "@prisma/client";
import { TicketStatusBadge } from "@/components/tickets/ticket-badges";
import { PaginationControl } from "@/components/ui/pagination-control";

interface AuditTicket {
  id: string;
  title: string;
  status: TicketStatus;
  group: { name: string };
  assignedTo: { name: string } | null;
  createdBy: { name: string };
  updatedAt: Date | string;
}

interface AdminTicketsAuditProps {
  tickets: AuditTicket[];
}

const ITEMS_PER_PAGE = 5;

export function AdminTicketsAudit({ tickets }: AdminTicketsAuditProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(tickets.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  if (safeCurrentPage !== currentPage && totalPages > 0) {
    setCurrentPage(safeCurrentPage);
  }

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentTickets = tickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="bg-white border border-[#F0E7E1] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C2410C]" />
            <span>Auditoría Global de Tickets</span>
          </h2>
          <Link
            href="/admin/auditoria"
            className="text-xs font-semibold text-[#C2410C] hover:text-[#9A3412] transition-colors"
          >
            Ver auditoría completa →
          </Link>
        </div>

        {/* Lista de tickets (Máximo 5 por página) */}
        <div className="divide-y divide-stone-100 mt-1 min-h-[295px]">
          {tickets.length === 0 ? (
            <p className="text-xs text-stone-400 py-10 text-center">No hay tickets registrados aún.</p>
          ) : (
            currentTickets.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF1EB] text-[#C2410C] flex items-center justify-center shrink-0 mt-0.5">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <Link
                      href={`/dashboard/tickets/${t.id}`}
                      className="text-xs sm:text-sm font-bold text-stone-800 hover:text-[#C2410C] transition-colors line-clamp-1"
                    >
                      {t.title}
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span>{t.group.name}</span>
                      <span>•</span>
                      <span>{t.assignedTo ? `👤 ${t.assignedTo.name}` : "Sin asignar"}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <TicketStatusBadge status={t.status} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Control de paginación */}
        <PaginationControl
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={tickets.length}
          itemsPerPage={ITEMS_PER_PAGE}
          label="tickets"
          compact
        />
      </div>

      {/* Pie de tarjeta */}
      <div className="pt-3.5 mt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
        <span className="flex items-center gap-1.5 font-medium text-stone-600">
          <span className="w-2 h-2 rounded-full bg-[#C2410C] animate-pulse" />
          Escucha de eventos en tiempo real
        </span>
        <span>{tickets.length} eventos hoy</span>
      </div>
    </div>
  );
}
