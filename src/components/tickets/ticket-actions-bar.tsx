// src/components/tickets/ticket-actions-bar.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateTicketStatusAction,
  deriveTicketAction,
  assignTicketToSelfAction,
  assignTicketToUserAction,
} from "@/server/actions/tickets";
import { TicketStatus } from "@prisma/client";
import {
  ArrowRightLeft,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
  UserPlus,
  Users,
} from "lucide-react";

interface GroupOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TicketActionsBarProps {
  ticketId: string;
  currentStatus: TicketStatus;
  currentGroupId: string;
  assignedToId: string | null;
  currentUserId: string;
  isAdmin: boolean;
  allGroups: GroupOption[];
  allUsers: UserOption[];
}

export function TicketActionsBar({
  ticketId,
  currentStatus,
  currentGroupId,
  assignedToId,
  currentUserId,
  isAdmin,
  allGroups,
  allUsers,
}: TicketActionsBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modal Derivación
  const [showDeriveModal, setShowDeriveModal] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState("");
  const [deriveReason, setDeriveReason] = useState("");
  const [deriveError, setDeriveError] = useState<string | null>(null);

  // Modal Asignación de Técnico Específico (Admin/Líder)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(assignedToId || "");
  const [assignError, setAssignError] = useState<string | null>(null);

  const availableTargetGroups = allGroups.filter((g) => g.id !== currentGroupId);

  const handleStatusChange = (newStatus: TicketStatus) => {
    startTransition(async () => {
      const res = await updateTicketStatusAction({
        ticketId,
        status: newStatus,
      });
      if (!res.success) {
        alert(res.error || "Error al actualizar estado");
      } else {
        router.refresh();
      }
    });
  };

  const handleAssignToSelf = () => {
    startTransition(async () => {
      const res = await assignTicketToSelfAction(ticketId);
      if (!res.success) {
        alert(res.error || "Error al autoasignarse el ticket");
      } else {
        router.refresh();
      }
    });
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError(null);

    startTransition(async () => {
      const res = await assignTicketToUserAction({
        ticketId,
        assignedToId: selectedUserId || null,
      });

      if (!res.success) {
        setAssignError(res.error || "Error al reasignar ticket");
      } else {
        setShowAssignModal(false);
        router.refresh();
      }
    });
  };

  const handleDeriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGroupId || !deriveReason.trim()) return;

    startTransition(async () => {
      const res = await deriveTicketAction({
        ticketId,
        targetGroupId,
        reason: deriveReason.trim(),
      });

      if (!res.success) {
        setDeriveError(res.error || "Error al derivar ticket");
      } else {
        setShowDeriveModal(false);
        setDeriveReason("");
        router.refresh();
      }
    });
  };

  const assignedUserName = allUsers.find((u) => u.id === assignedToId)?.name || "Sin asignar";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Botón de Asignación Específica por Administrador */}
      {isAdmin ? (
        <button
          onClick={() => {
            setSelectedUserId(assignedToId || "");
            setShowAssignModal(true);
          }}
          disabled={isPending}
          className="bg-white hover:bg-stone-50 text-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-stone-300 shadow-2xs transition-colors disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4 text-[#C2410C]" />
          <span>Asignar Técnico</span>
          <span className="text-[11px] text-stone-500 font-normal">({assignedUserName})</span>
        </button>
      ) : (
        /* Si no es Admin pero pertenece al grupo y no está asignado a él */
        assignedToId !== currentUserId && (
          <button
            onClick={handleAssignToSelf}
            disabled={isPending}
            className="bg-white hover:bg-stone-50 text-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border border-stone-300 shadow-2xs transition-colors disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Asignármelo a mí</span>
          </button>
        )
      )}

      {/* Selector de Estado */}
      <div className="flex items-center gap-1 bg-stone-100/90 border border-stone-200/90 rounded-xl p-1">
        {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as TicketStatus[]).map((st) => (
          <button
            key={st}
            disabled={isPending}
            onClick={() => handleStatusChange(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentStatus === st
                ? "bg-white text-stone-900 shadow-2xs border border-stone-200"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {st === "OPEN"
              ? "Abierto"
              : st === "IN_PROGRESS"
              ? "En Progreso"
              : st === "RESOLVED"
              ? "Resuelto"
              : "Cerrado"}
          </button>
        ))}
      </div>

      {/* Botón para Derivar a otro Grupo */}
      <button
        onClick={() => {
          if (availableTargetGroups.length > 0) {
            setTargetGroupId(availableTargetGroups[0].id);
          }
          setShowDeriveModal(true);
        }}
        disabled={isPending}
        className="bg-[#FFF1EB] hover:bg-[#FEE4D6] text-[#C2410C] border border-[#FDE0D4] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-2xs"
      >
        <ArrowRightLeft className="w-4 h-4 text-[#C2410C]" />
        <span>Derivar Área</span>
      </button>

      {/* Modal de Asignación a Técnico Específico (ADMIN) */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-[#C2410C]" />
              Asignar Ticket a un Colaborador
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Selecciona al técnico responsable para este ticket. Esta acción quedará auditada en el chat.
            </p>

            {assignError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Técnico Responsable
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
                >
                  <option value="">-- Sin asignar --</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role === "ADMIN" ? "Admin" : "Técnico"}) - {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-xs"
                >
                  {isPending ? "Guardando..." : "Guardar Asignación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Derivación */}
      {showDeriveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowDeriveModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 mb-1">
              <ArrowRightLeft className="w-5 h-5 text-[#C2410C]" />
              Derivar Ticket a otra Área
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Esta acción transferirá la responsabilidad del ticket y dejará un registro inmutable en el chat interno.
            </p>

            {deriveError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deriveError}</span>
              </div>
            )}

            <form onSubmit={handleDeriveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Grupo / Área Destino
                </label>
                <select
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
                >
                  {availableTargetGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Motivo de la Derivación (Requerido)
                </label>
                <textarea
                  required
                  rows={3}
                  value={deriveReason}
                  onChange={(e) => setDeriveReason(e.target.value)}
                  placeholder="Explica detalladamente por qué se transfiere el ticket a este grupo..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeriveModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || !deriveReason.trim()}
                  className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-xs"
                >
                  {isPending ? "Derivando..." : "Confirmar Derivación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
