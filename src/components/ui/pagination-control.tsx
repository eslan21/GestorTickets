// src/components/ui/pagination-control.tsx
"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage?: number;
  label?: string; // e.g. "áreas", "tickets", "colaboradores"
  className?: string;
  compact?: boolean;
}

export function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 5,
  label = "elementos",
  className = "",
  compact = false,
}: PaginationControlProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generar números de página con elipsis si hay muchas páginas
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 ${className}`}
    >
      <span className="text-[11px] sm:text-xs">
        Mostrando <strong className="text-stone-800 dark:text-stone-200 font-semibold">{startItem}</strong> a{" "}
        <strong className="text-stone-800 dark:text-stone-200 font-semibold">{endItem}</strong> de{" "}
        <strong className="text-stone-800 dark:text-stone-200 font-semibold">{totalItems}</strong> {label}
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-2.5 py-1 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed text-xs font-medium"
            title="Página anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className={compact ? "hidden sm:inline" : "inline"}>Anterior</span>
          </button>

          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`dots-${idx}`} className="px-1.5 py-1 text-stone-400 dark:text-stone-500 select-none text-xs">
                  …
                </span>
              );
            }
            const pageNum = p as number;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[28px] h-7 px-2 flex items-center justify-center text-xs font-semibold rounded-md transition-all ${
                  isActive
                    ? "bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 font-bold border border-[#FDE0D4] dark:border-orange-900/50 shadow-2xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-2.5 py-1 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed text-xs font-medium"
            title="Página siguiente"
          >
            <span className={compact ? "hidden sm:inline" : "inline"}>Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
