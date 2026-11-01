"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Check } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Evitar desajustes de hidratación (hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors flex items-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C2410C]/40"
        title="Cambiar tema (Claro / Oscuro / Sistema)"
        aria-label="Cambiar tema"
        aria-expanded={isOpen}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          {theme === "system" ? (
            <Laptop className="w-4 h-4 text-stone-500 dark:text-stone-400 group-hover:text-[#C2410C] dark:group-hover:text-orange-400 transition-colors" />
          ) : isDark ? (
            <Moon className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
          ) : (
            <Sun className="w-4 h-4 text-amber-600 group-hover:text-[#C2410C] transition-colors" />
          )}
        </div>

        {showLabel && (
          <span className="text-xs font-medium text-stone-700 dark:text-stone-300 capitalize">
            {theme === "system" ? "Sistema" : theme === "dark" ? "Oscuro" : "Claro"}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Tema de interfaz
          </div>

          <button
            type="button"
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              theme === "light"
                ? "bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 font-bold"
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Claro</span>
            </div>
            {theme === "light" && <Check className="w-3.5 h-3.5 text-[#C2410C] dark:text-orange-400" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              theme === "dark"
                ? "bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 font-bold"
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>Oscuro</span>
            </div>
            {theme === "dark" && <Check className="w-3.5 h-3.5 text-[#C2410C] dark:text-orange-400" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              theme === "system"
                ? "bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 font-bold"
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>Sistema</span>
            </div>
            {theme === "system" && <Check className="w-3.5 h-3.5 text-[#C2410C] dark:text-orange-400" />}
          </button>
        </div>
      )}
    </div>
  );
}
