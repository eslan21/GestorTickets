// src/components/tickets/ticket-badges.tsx
import React from "react";
import { TicketPriority, TicketStatus } from "@prisma/client";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  switch (status) {
    case TicketStatus.OPEN:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF1EB] text-[#C2410C] border border-[#FDE0D4]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" />
          Abierto
        </span>
      );
    case TicketStatus.IN_PROGRESS:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
          En Progreso
        </span>
      );
    case TicketStatus.RESOLVED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          Resuelto
        </span>
      );
    case TicketStatus.CLOSED:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
          Cerrado
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
          {status}
        </span>
      );
  }
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  switch (priority) {
    case TicketPriority.LOW:
      return (
        <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-stone-400" />
          Baja
        </span>
      );
    case TicketPriority.MEDIUM:
      return (
        <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Media
        </span>
      );
    case TicketPriority.HIGH:
      return (
        <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Alta
        </span>
      );
    case TicketPriority.CRITICAL:
      return (
        <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Crítica
        </span>
      );
    default:
      return <span>{priority}</span>;
  }
}
