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
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-stone-900 dark:text-stone-100">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">Crear Nuevo Ticket</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              Registra una nueva incidencia o solicitud para derivarla al área correspondiente.
            </p>

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Título del Problema
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Caída de servicio en base de datos secundaria"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white dark:focus:bg-stone-800 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Área / Grupo Responsable
                </label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white dark:focus:bg-stone-800 transition-colors"
                >
                  {userGroups.map((g) => (
                    <option key={g.id} value={g.id} className="dark:bg-stone-900">
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">Prioridad</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white dark:focus:bg-stone-800 transition-colors"
                >
                  <option value={TicketPriority.LOW} className="dark:bg-stone-900">Baja</option>
                  <option value={TicketPriority.MEDIUM} className="dark:bg-stone-900">Media</option>
                  <option value={TicketPriority.HIGH} className="dark:bg-stone-900">Alta</option>
                  <option value={TicketPriority.CRITICAL} className="dark:bg-stone-900">Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Descripción Detallada
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe los pasos para reproducir o detalles del incidente..."
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white dark:focus:bg-stone-800 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#B4461B] hover:bg-[#9A3412] text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-xs transition-colors"
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
