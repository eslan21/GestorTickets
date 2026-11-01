// src/components/tickets/ticket-badges.tsx
import React from "react";
import { TicketPriority, TicketStatus } from "@prisma/client";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  switch (status) {
    case TicketStatus.OPEN:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 border border-[#FDE0D4] dark:border-orange-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C] dark:bg-orange-400" />
          Abierto
        </span>
      );
    case TicketStatus.IN_PROGRESS:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-400 border border-[#FDE68A] dark:border-amber-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] dark:bg-amber-400" />
          En Progreso
        </span>
      );
    case TicketStatus.RESOLVED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#047857] dark:text-emerald-400 border border-[#A7F3D0] dark:border-emerald-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-emerald-400" />
          Resuelto
        </span>
      );
    case TicketStatus.CLOSED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-500" />
          Cerrado
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
          {status}
        </span>
      );
  }
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  switch (priority) {
    case TicketPriority.LOW:
      return (
        <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-stone-400 dark:bg-stone-500" />
          Baja
        </span>
      );
    case TicketPriority.MEDIUM:
      return (
        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
          Media
        </span>
      );
    case TicketPriority.HIGH:
      return (
        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
          Alta
        </span>
      );
    case TicketPriority.CRITICAL:
      return (
        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400 animate-pulse" />
          Crítica
        </span>
      );
    default:
      return <span>{priority}</span>;
  }
}
