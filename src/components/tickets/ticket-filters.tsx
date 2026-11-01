// src/components/tickets/ticket-filters.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TicketStatus } from "@prisma/client";
import {
  Filter,
  Users,
  Activity,
  ChevronDown,
  Check,
  X,
  Search,
  RotateCcw,
} from "lucide-react";

interface GroupOption {
  id: string;
  name: string;
}

interface TicketFiltersProps {
  userGroups: GroupOption[];
  currentGroupId?: string;
  currentStatus?: TicketStatus;
}

const STATUS_OPTIONS: { key: TicketStatus; label: string; dotColor: string }[] = [
  { key: TicketStatus.OPEN, label: "Abiertos", dotColor: "bg-[#C2410C] dark:bg-orange-400" },
  { key: TicketStatus.IN_PROGRESS, label: "En Progreso", dotColor: "bg-[#D97706] dark:bg-amber-400" },
  { key: TicketStatus.RESOLVED, label: "Resueltos", dotColor: "bg-[#059669] dark:bg-emerald-400" },
  { key: TicketStatus.CLOSED, label: "Cerrados", dotColor: "bg-stone-400 dark:bg-stone-500" },
];

export function TicketFilters({
  userGroups,
  currentGroupId,
  currentStatus,
}: TicketFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [groupOpen, setGroupOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");

  const groupDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(event.target as Node)
      ) {
        setGroupOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setGroupOpen(false);
        setStatusOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Actualizar filtros en la URL manteniendo los existentes
  const applyFilter = (key: "groupId" | "status", value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (!value || value === "ALL") {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const query = current.toString() ? `?${current.toString()}` : "";
    router.push(`/dashboard/tickets${query}`);
  };

  const clearAllFilters = () => {
    router.push("/dashboard/tickets");
  };

  // Filtrado de grupos por búsqueda
  const filteredGroups = useMemo(() => {
    if (!groupSearch.trim()) return userGroups;
    return userGroups.filter((g) =>
      g.name.toLowerCase().includes(groupSearch.toLowerCase())
    );
  }, [userGroups, groupSearch]);

  const selectedGroup = userGroups.find((g) => g.id === currentGroupId);
  const selectedStatus = STATUS_OPTIONS.find((s) => s.key === currentStatus);
  const hasActiveFilters = Boolean(currentGroupId || currentStatus);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 p-3 rounded-2xl shadow-2xs transition-colors">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Etiqueta de Filtros */}
        <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 mr-1 shrink-0">
          <Filter className="w-4 h-4 text-[#C2410C] dark:text-orange-400" />
          <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
            Filtros:
          </span>
        </div>

        {/* Input Desplegable de Grupo con Height Limitado */}
        <div className="relative" ref={groupDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setGroupOpen(!groupOpen);
              setStatusOpen(false);
            }}
            className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2.5 transition-all w-52 sm:w-60 ${
              selectedGroup
                ? "bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 border-[#FDE0D4] dark:border-orange-900/50 shadow-2xs"
                : "bg-stone-50 dark:bg-stone-800 hover:bg-stone-100/80 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
            }`}
            aria-expanded={groupOpen}
            aria-haspopup="listbox"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Users className="w-3.5 h-3.5 shrink-0 text-stone-400 dark:text-stone-500" />
              <span className="truncate">
                {selectedGroup ? selectedGroup.name : "Todos mis grupos"}
              </span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 text-stone-400 dark:text-stone-500 transition-transform duration-200 ${
                groupOpen ? "rotate-180 text-[#C2410C] dark:text-orange-400" : ""
              }`}
            />
          </button>

          {/* Menú Desplegable con Height Limitado y Scroll */}
          {groupOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 sm:w-72 bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 rounded-xl shadow-lg p-1.5 z-40">
              {/* Buscador interno si hay varios grupos */}
              {userGroups.length > 4 && (
                <div className="relative mb-1 px-1 pt-1">
                  <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    placeholder="Buscar área o grupo..."
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
                    autoFocus
                  />
                </div>
              )}

              {/* Lista con Height Limitado */}
              <div
                className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5"
                style={{ maxHeight: "13rem" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    applyFilter("groupId", null);
                    setGroupOpen(false);
                    setGroupSearch("");
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    !currentGroupId
                      ? "bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 font-semibold"
                      : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                  }`}
                >
                  <span className="truncate">Todos mis grupos</span>
                  {!currentGroupId && <Check className="w-3.5 h-3.5 text-[#C2410C] dark:text-orange-400" />}
                </button>

                {filteredGroups.length === 0 ? (
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 py-3 text-center">
                    No se encontraron grupos
                  </p>
                ) : (
                  filteredGroups.map((group) => {
                    const isSelected = currentGroupId === group.id;
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          applyFilter("groupId", group.id);
                          setGroupOpen(false);
                          setGroupSearch("");
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 font-semibold"
                            : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                        }`}
                      >
                        <span className="truncate">{group.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#C2410C] dark:text-orange-400" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Desplegable de Estado con Height Limitado */}
        <div className="relative" ref={statusDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setStatusOpen(!statusOpen);
              setGroupOpen(false);
            }}
            className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2.5 transition-all w-44 sm:w-48 ${
              selectedStatus
                ? "bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 border-[#FDE0D4] dark:border-orange-900/50 shadow-2xs"
                : "bg-stone-50 dark:bg-stone-800 hover:bg-stone-100/80 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700"
            }`}
            aria-expanded={statusOpen}
            aria-haspopup="listbox"
          >
            <span className="flex items-center gap-1.5 truncate">
              {selectedStatus ? (
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedStatus.dotColor}`}
                />
              ) : (
                <Activity className="w-3.5 h-3.5 shrink-0 text-stone-400 dark:text-stone-500" />
              )}
              <span className="truncate">
                {selectedStatus ? selectedStatus.label : "Todos los estados"}
              </span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 text-stone-400 dark:text-stone-500 transition-transform duration-200 ${
                statusOpen ? "rotate-180 text-[#C2410C] dark:text-orange-400" : ""
              }`}
            />
          </button>

          {/* Menú Desplegable con Height Limitado y Scroll */}
          {statusOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-48 sm:w-52 bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 rounded-xl shadow-lg p-1.5 z-40">
              <div
                className="max-h-52 overflow-y-auto space-y-0.5"
                style={{ maxHeight: "13rem" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    applyFilter("status", null);
                    setStatusOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    !currentStatus
                      ? "bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 font-semibold"
                      : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                  }`}
                >
                  <span>Todos los estados</span>
                  {!currentStatus && <Check className="w-3.5 h-3.5 text-[#C2410C] dark:text-orange-400" />}
                </button>

                {STATUS_OPTIONS.map((st) => {
                  const isSelected = currentStatus === st.key;
                  return (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => {
                        applyFilter("status", st.key);
                        setStatusOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 font-semibold"
                          : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dotColor}`}
                        />
                        <span>{st.label}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#C2410C] dark:text-orange-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Botón para Limpiar Filtros cuando alguno está activo */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="h-9 px-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all"
            title="Restablecer todos los filtros"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
            <span className="hidden sm:inline">Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Indicador de estado activo */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#C2410C] dark:text-orange-400 bg-[#FFF1EB] dark:bg-orange-950/40 border border-[#FDE0D4] dark:border-orange-900/50 px-2.5 py-1 rounded-lg font-medium self-center">
          <span>Filtro activo</span>
          <button
            type="button"
            onClick={clearAllFilters}
            className="hover:text-stone-900 dark:hover:text-stone-100 ml-0.5"
            title="Quitar filtros"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
