// src/components/admin/admin-groups-card.tsx
"use client";

import React, { useState, useTransition, useRef } from "react";
import { Layers, Code, Server, Users, Loader2, Trash2, AlertCircle, AlertTriangle, X } from "lucide-react";
import { createGroupAction, deleteGroupAction } from "@/server/actions/groups";
import Link from "next/link";
import { PaginationControl } from "@/components/ui/pagination-control";

interface GroupItem {
  id: string;
  name: string;
  description: string | null;
  _count: {
    members: number;
    tickets: number;
  };
}

interface AdminGroupsCardProps {
  groups: GroupItem[];
  allowDelete?: boolean;
}

const ITEMS_PER_PAGE = 5;

export function AdminGroupsCard({ groups, allowDelete = true }: AdminGroupsCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [groupToDelete, setGroupToDelete] = useState<GroupItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const totalPages = Math.max(1, Math.ceil(groups.length / ITEMS_PER_PAGE));

  const safeCurrentPage = Math.min(currentPage, totalPages);
  if (safeCurrentPage !== currentPage && totalPages > 0) {
    setCurrentPage(safeCurrentPage);
  }

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentGroups = groups.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCreateGroup = (formData: FormData) => {
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    setActionError(null);

    if (!name) return;

    startTransition(async () => {
      const res = await createGroupAction({ name, description });
      if (res.success) {
        formRef.current?.reset();
      } else {
        setActionError(res.error || "Error al crear grupo");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!groupToDelete) return;
    setActionError(null);

    startTransition(async () => {
      const res = await deleteGroupAction(groupToDelete.id);
      if (!res.success) {
        setActionError(res.error || "Error al eliminar el grupo");
      } else {
        setGroupToDelete(null);
      }
    });
  };

  return (
    <div id="groups" className="bg-white border border-[#F0E7E1] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Cabecera de la sección */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C2410C]" />
            <span>Grupos y Áreas de Soporte</span>
          </h2>
          <span className="bg-stone-100 text-stone-600 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {groups.length} configuradas
          </span>
        </div>

        {/* Mensaje de error general si ocurre */}
        {actionError && (
          <div className="my-3 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Formulario rápido para agregar área */}
        <form ref={formRef} action={handleCreateGroup} className="flex gap-2 my-3">
          <input
            type="text"
            name="name"
            required
            placeholder="Nombre de nueva área..."
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
          />
          <input
            type="text"
            name="description"
            placeholder="Descripción breve..."
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#B4461B] hover:bg-[#9A3412] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 shadow-2xs disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>+ Agregar Área</span>
            )}
          </button>
        </form>

        {/* Lista de Grupos */}
        <div className="divide-y divide-stone-100 min-h-[260px]">
          {groups.length === 0 ? (
            <p className="text-xs text-stone-400 py-8 text-center">No hay áreas configuradas aún.</p>
          ) : (
            currentGroups.map((g) => {
              const isDev = g.name.toLowerCase().includes("desarrollo");
              const isInfra =
                g.name.toLowerCase().includes("servidor") ||
                g.name.toLowerCase().includes("infra");

              const hasTickets = g._count.tickets > 0;

              return (
                <div key={g.id} className="py-2.5 flex items-center justify-between gap-3 group/item">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF1EB] text-[#C2410C] flex items-center justify-center shrink-0">
                      {isDev ? (
                        <Code className="w-4 h-4" />
                      ) : isInfra ? (
                        <Server className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs sm:text-sm font-bold text-stone-800 truncate">{g.name}</h4>
                      <p className="text-[11px] text-stone-500 line-clamp-1">
                        {g.description || "Área operativa de soporte"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-[#FFF1EB] text-[#C2410C] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {g._count.members} miembros
                    </span>
                    <span className="bg-[#FFF1EB] text-[#C2410C] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {g._count.tickets} tickets
                    </span>

                    {/* Botón Eliminar Grupo */}
                    {allowDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setActionError(null);
                          setGroupToDelete(g);
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title={
                          hasTickets
                            ? `Tiene ${g._count.tickets} ticket(s) asociados`
                            : "Eliminar este grupo"
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Control de paginación */}
        <PaginationControl
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={groups.length}
          itemsPerPage={ITEMS_PER_PAGE}
          label="áreas"
          compact
        />
      </div>

      {/* Pie de tarjeta */}
      <div className="pt-3.5 mt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
        <span>Áreas operativas con enrutamiento automático activo</span>
        <Link href="/admin/grupos" className="text-[#C2410C] font-semibold hover:underline">
          Administrar áreas completas →
        </Link>
      </div>

      {/* Modal de Confirmación para Eliminar Grupo */}
      {groupToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setGroupToDelete(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">¿Eliminar Área de Soporte?</h3>
                <p className="text-xs text-stone-500">
                  Esta acción desvinculará a sus miembros registrados.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 my-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Área seleccionada:</span>
                <span className="font-bold text-stone-800">{groupToDelete.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Miembros asociados:</span>
                <span className="font-semibold text-stone-700">{groupToDelete._count.members} colaboradores</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Tickets vigentes:</span>
                <span
                  className={`font-bold ${
                    groupToDelete._count.tickets > 0 ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {groupToDelete._count.tickets} tickets
                </span>
              </div>
            </div>

            {groupToDelete._count.tickets > 0 && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Aviso de restricción:</strong> Esta área contiene tickets asignados. La base de datos no permitirá eliminarla hasta que los tickets sean derivados o reasignados a otra área.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setGroupToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending || groupToDelete._count.tickets > 0}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 shadow-xs flex items-center gap-1.5 transition-colors"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Sí, Eliminar Área</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
