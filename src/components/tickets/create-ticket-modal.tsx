// src/components/tickets/create-ticket-modal.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTicketAction } from "@/server/actions/tickets";
import { Plus, X, AlertCircle } from "lucide-react";
import { TicketPriority } from "@prisma/client";

interface GroupOption {
  id: string;
  name: string;
}

interface CreateTicketModalProps {
  userGroups: GroupOption[];
}

export function CreateTicketModal({ userGroups }: CreateTicketModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [groupId, setGroupId] = useState(userGroups[0]?.id || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createTicketAction({
        title,
        description,
        priority,
        groupId,
      });

      if (!result.success) {
        setError(
          typeof result.error === "string" ? result.error : "Error de validación al crear ticket"
        );
      } else {
        setIsOpen(false);
        setTitle("");
        setDescription("");
        router.refresh();
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#B4461B] hover:bg-[#9A3412] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Ticket</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-stone-900 mb-1">Crear Nuevo Ticket</h3>
            <p className="text-xs text-stone-500 mb-4">
              Registra una nueva incidencia o solicitud para derivarla al área correspondiente.
            </p>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Título del Problema
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Caída de servicio en base de datos secundaria"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Área / Grupo Responsable
                </label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
                >
                  {userGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Prioridad</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
                >
                  <option value={TicketPriority.LOW}>Baja</option>
                  <option value={TicketPriority.MEDIUM}>Media</option>
                  <option value={TicketPriority.HIGH}>Alta</option>
                  <option value={TicketPriority.CRITICAL}>Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Descripción Detallada
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe los pasos para reproducir o detalles del incidente..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#B4461B] hover:bg-[#9A3412] text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-xs"
                >
                  {isPending ? "Creando..." : "Crear Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
