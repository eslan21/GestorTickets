// src/components/admin/admin-audit-table.tsx
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Clock, Search, Download, Ticket, ArrowUpRight } from "lucide-react";
import { TicketStatus, TicketPriority } from "@prisma/client";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/ticket-badges";
import { PaginationControl } from "@/components/ui/pagination-control";

interface AuditTicketItem {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  group: { id: string; name: string };
  assignedTo: { id: string; name: string; email: string } | null;
  createdBy: { id: string; name: string; email: string };
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface AdminAuditTableProps {
  tickets: AuditTicketItem[];
}

const ITEMS_PER_PAGE = 8;

export function AdminAuditTable({ tickets }: AdminAuditTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const filteredTickets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tickets.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;

      if (!q) return true;
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchGroup = t.group.name.toLowerCase().includes(q);
      const matchCreator = t.createdBy.name.toLowerCase().includes(q);
      const matchAssignee = t.assignedTo?.name.toLowerCase().includes(q) || false;
      return matchTitle || matchGroup || matchCreator || matchAssignee;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  if (safeCurrentPage !== currentPage && totalPages > 0) {
    setCurrentPage(safeCurrentPage);
  }

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentTickets = filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Titulo",
      "Estado",
      "Prioridad",
      "Area Responsable",
      "Tecnico Asignado",
      "Creado Por",
      "Fecha Creacion",
      "Ultima Actualizacion",
    ];
    const rows = filteredTickets.map((t) => [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      `"${t.group.name.replace(/"/g, '""')}"`,
      `"${t.assignedTo ? t.assignedTo.name.replace(/"/g, '""') : "Sin asignar"}"`,
      `"${t.createdBy.name.replace(/"/g, '""')}"`,
      `"${new Date(t.createdAt).toISOString()}"`,
      `"${new Date(t.updatedAt).toISOString()}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `auditoria_tickets_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 rounded-2xl p-5 shadow-2xs space-y-4 transition-colors">
      {/* Cabecera y Barra de Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Registro de Auditoría de Tickets</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Trazabilidad cronológica completa de todas las incidencias y transferencias en el sistema.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por título, área, técnico..."
              className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white dark:focus:bg-stone-800 transition-all w-52 sm:w-64"
            />
          </div>

          {/* Filtro Estado */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#C2410C]"
          >
            <option value="ALL" className="dark:bg-stone-900">Todos los Estados</option>
            <option value="OPEN" className="dark:bg-stone-900">Abierto</option>
            <option value="IN_PROGRESS" className="dark:bg-stone-900">En Progreso</option>
            <option value="RESOLVED" className="dark:bg-stone-900">Resuelto</option>
            <option value="CLOSED" className="dark:bg-stone-900">Cerrado</option>
          </select>

          {/* Filtro Prioridad */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#C2410C]"
          >
            <option value="ALL" className="dark:bg-stone-900">Todas las Prioridades</option>
            <option value="LOW" className="dark:bg-stone-900">Baja</option>
            <option value="MEDIUM" className="dark:bg-stone-900">Media</option>
            <option value="HIGH" className="dark:bg-stone-900">Alta</option>
            <option value="CRITICAL" className="dark:bg-stone-900">Crítica</option>
          </select>

          {/* Exportar */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-2xs transition-colors"
            title="Exportar auditoría a CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabla Completa de Auditoría */}
      <div className="overflow-x-auto min-h-[360px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F6] dark:bg-stone-800/70 text-stone-500 dark:text-stone-400 uppercase text-[10px] font-bold tracking-wider border-b border-stone-100 dark:border-stone-800">
            <tr>
              <th className="px-4 py-3">Ticket / Incidencia</th>
              <th className="px-4 py-3">Área Responsable</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Prioridad</th>
              <th className="px-4 py-3">Técnico Asignado</th>
              <th className="px-4 py-3">Creador</th>
              <th className="px-4 py-3">Actualización</th>
              <th className="px-4 py-3 text-right">Ver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
            {currentTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-xs text-stone-400 dark:text-stone-500">
                  No se encontraron tickets con los filtros aplicados.
                </td>
              </tr>
            ) : (
              currentTickets.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors">
                  <td className="px-4 py-3.5 max-w-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 flex items-center justify-center shrink-0">
                        <Ticket className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <Link
                          href={`/dashboard/tickets/${t.id}`}
                          className="font-bold text-stone-900 dark:text-stone-100 hover:text-[#C2410C] dark:hover:text-orange-400 transition-colors truncate block"
                        >
                          {t.title}
                        </Link>
                        <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono truncate block">
                          ID: #{t.id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 font-medium text-stone-800 dark:text-stone-200">
                    <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md text-[11px] border border-stone-200 dark:border-stone-700">
                      {t.group.name}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <TicketStatusBadge status={t.status} />
                  </td>

                  <td className="px-4 py-3.5">
                    <TicketPriorityBadge priority={t.priority} />
                  </td>

                  <td className="px-4 py-3.5">
                    {t.assignedTo ? (
                      <span className="text-stone-800 dark:text-stone-200 font-medium">👤 {t.assignedTo.name}</span>
                    ) : (
                      <span className="text-stone-400 dark:text-stone-500 italic">Sin asignar</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-stone-600 dark:text-stone-400">
                    {t.createdBy.name}
                  </td>

                  <td className="px-4 py-3.5 text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                    {new Date(t.updatedAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/dashboard/tickets/${t.id}`}
                      className="p-1.5 inline-flex items-center text-stone-400 hover:text-[#C2410C] hover:bg-[#FFF1EB] dark:hover:bg-orange-950/40 dark:hover:text-orange-400 rounded-lg transition-colors"
                      title="Ver detalles del ticket"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <PaginationControl
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredTickets.length}
        itemsPerPage={ITEMS_PER_PAGE}
        label="tickets auditados"
      />
    </div>
  );
}
