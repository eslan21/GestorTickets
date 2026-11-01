// src/components/layout/sidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ticket,
  Shield,
  ChevronLeft,
  ChevronRight,
  Layers,
  Clock,
  Users,
} from "lucide-react";

interface SidebarProps {
  userRole: string;
}

export function AppSidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = userRole === "ADMIN";

  return (
    <aside
      className={`relative flex flex-col shrink-0 bg-[#FFFDFB] border-r border-[#F0E7E1] transition-all duration-300 ease-in-out z-30 select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Botón Flotante para Colapsar/Expandir la Barra Lateral */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-40 bg-white border border-[#E7DDD6] rounded-full p-1 text-stone-500 hover:text-[#C2410C] hover:border-[#C2410C] shadow-xs transition-all"
        title={isCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Header del Logo */}
      <div className="h-16 px-5 flex items-center border-b border-[#F0E7E1]/70">
        <Link href="/dashboard/tickets" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] flex items-center justify-center text-white shadow-xs shrink-0">
            <Ticket className="w-5 h-5 rotate-[-10deg]" />
          </div>
          {!isCollapsed && (
            <div className="flex items-center tracking-tight font-bold text-lg text-stone-900 truncate">
              <span>Ticket</span>
              <span className="text-[#C2410C]">Hub</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navegación con Rutas Activas */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
        {/* SECCIÓN: GESTIÓN */}
        <div>
          {!isCollapsed ? (
            <h4 className="px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
              Gestión
            </h4>
          ) : (
            <div className="h-px bg-stone-200/70 my-2" />
          )}

          <nav className="space-y-1">
            <Link
              href="/dashboard/tickets"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                pathname.startsWith("/dashboard/tickets")
                  ? "bg-[#FFF1EB] text-[#C2410C] font-bold border border-[#FDE0D4]"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
              }`}
              title="Mis Tickets"
            >
              <Ticket className="w-4 h-4 shrink-0 text-[#C2410C]" />
              {!isCollapsed && <span>Mis Tickets</span>}
            </Link>
          </nav>
        </div>

        {/* SECCIÓN: ADMINISTRACIÓN (Solo visible para rol ADMIN) */}
        {isAdmin && (
          <div>
            {!isCollapsed ? (
              <h4 className="px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                Administración
              </h4>
            ) : (
              <div className="h-px bg-stone-200/70 my-2" />
            )}

            <nav className="space-y-1">
              {/* Panel Global */}
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-2xs ${
                  pathname === "/admin"
                    ? "bg-[#B4461B] text-white font-bold hover:bg-[#9A3412]"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
                }`}
                title="Panel de Administración (RBAC)"
              >
                <Shield className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Panel Global RBAC</span>}
              </Link>

              {/* Grupos y Áreas de Soporte */}
              <Link
                href="/admin/grupos"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.startsWith("/admin/grupos")
                    ? "bg-[#FFF1EB] text-[#C2410C] font-bold border border-[#FDE0D4]"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
                }`}
                title="Grupos y Áreas de Soporte"
              >
                <Layers className="w-4 h-4 shrink-0 text-[#C2410C]" />
                {!isCollapsed && <span>Grupos y Áreas</span>}
              </Link>

              {/* Auditoría Global de Tickets */}
              <Link
                href="/admin/auditoria"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.startsWith("/admin/auditoria")
                    ? "bg-[#FFF1EB] text-[#C2410C] font-bold border border-[#FDE0D4]"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
                }`}
                title="Auditoría Global de Tickets"
              >
                <Clock className="w-4 h-4 shrink-0 text-[#C2410C]" />
                {!isCollapsed && <span>Auditoría de Tickets</span>}
              </Link>

              {/* Usuarios y Asignación de Roles */}
              <Link
                href="/admin/usuarios"
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname.startsWith("/admin/usuarios")
                    ? "bg-[#FFF1EB] text-[#C2410C] font-bold border border-[#FDE0D4]"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
                }`}
                title="Usuarios y Asignación de Roles"
              >
                <Users className="w-4 h-4 shrink-0 text-[#C2410C]" />
                {!isCollapsed && <span>Usuarios y Roles</span>}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}
