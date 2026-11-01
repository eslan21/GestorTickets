// src/components/layout/header.tsx
import React from "react";
import { signOut } from "@/lib/auth";
import { Search, Bell, LogOut } from "lucide-react";
import { UserHeaderProfile } from "@/components/layout/user-header-profile";

interface HeaderProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function AppHeader({ user }: HeaderProps) {
  return (
    <header className="h-16 px-6 bg-white border-b border-[#F0E7E1] flex items-center justify-between sticky top-0 z-20">
      {/* Buscador Superior */}
      <div className="w-full max-w-md relative hidden sm:block">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar tickets, áreas, usuarios..."
          className="w-full bg-[#FAF8F6] border border-[#EBE3DC] rounded-xl pl-10 pr-4 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white transition-all"
        />
      </div>

      {/* Acciones y Perfil de Usuario */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notificaciones */}
        <button
          className="relative p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C2410C]" />
        </button>

        <div className="h-5 w-px bg-stone-200" />

        {/* Datos y Modal de Edición de Perfil de Usuario */}
        <UserHeaderProfile user={user} />

        {/* Botón Cerrar Sesión */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
