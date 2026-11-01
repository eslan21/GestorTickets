// src/components/tickets/tickets-list.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TicketStatus, TicketPriority } from "@prisma/client";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/ticket-badges";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Users, Clock, ArrowRight, Ticket as TicketIcon } from "lucide-react";

export interface TicketListItem {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  updatedAt: Date | string;
  group: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface TicketsListProps {
  tickets: TicketListItem[];
}

const ITEMS_PER_PAGE = 5;

export function TicketsList({ tickets }: TicketsListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reiniciar a página 1 cuando cambia la lista de tickets (filtros aplicados)
  useEffect(() => {
    setCurrentPage(1);
  }, [tickets]);

  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-[#F0E7E1] rounded-2xl p-12 text-center shadow-2xs">
        <TicketIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
        <p className="text-stone-700 text-sm font-semibold">
          No se encontraron tickets con los filtros seleccionados.
        </p>
        <p className="text-stone-400 text-xs mt-1">
          Crea un nuevo ticket o selecciona otro grupo.
        </p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(tickets.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentTickets = tickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Lista de Tickets (Máximo 5 por página) */}
      <div className="grid grid-cols-1 gap-3.5">
        {currentTickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/dashboard/tickets/${ticket.id}`}
            className="group bg-white border border-[#F0E7E1] hover:border-[#F9C3B0] p-5 rounded-2xl transition-all duration-150 hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#FFF1EB] text-[#C2410C] border border-[#FDE0D4]">
                  {ticket.group.name}
                </span>
                <TicketStatusBadge status={ticket.status} />
                <TicketPriorityBadge priority={ticket.priority} />
              </div>

              <h3 className="text-base font-bold text-stone-900 group-hover:text-[#C2410C] transition-colors">
                {ticket.title}
              </h3>

              <p className="text-xs text-stone-500 line-clamp-1 max-w-3xl leading-relaxed">
                {ticket.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-stone-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span>Asignado:</span>
                  <strong className="text-stone-700 font-semibold">
                    {ticket.assignedTo?.name || "Sin asignar"}
                  </strong>
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  {new Date(ticket.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 sm:self-center">
              <span className="text-xs font-semibold text-stone-600 group-hover:text-[#C2410C] flex items-center gap-1">
                Ver detalle
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Tarjeta de Paginación */}
      <div className="bg-white border border-[#F0E7E1] px-5 py-3 rounded-2xl shadow-2xs">
        <PaginationControl
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={tickets.length}
          itemsPerPage={ITEMS_PER_PAGE}
          label="tickets"
          className="border-t-0 pt-0"
        />
      </div>
    </div>
  );
}
