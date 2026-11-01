// src/components/admin/admin-users-table.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Users, Search, Download, Pencil, Shield, User, Power, Loader2 } from "lucide-react";
import { Role } from "@prisma/client";
import { PaginationControl } from "@/components/ui/pagination-control";
import { EditUserModal } from "@/components/admin/edit-user-modal";
import { CreateUserModal } from "@/components/admin/create-user-modal";
import { toggleUserStatusAction } from "@/server/actions/users";

interface UserGroup {
  id: string;
  name: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  groups: UserGroup[];
}

interface AdminUsersTableProps {
  users: UserItem[];
  availableGroups?: { id: string; name: string }[];
  showCreateButton?: boolean;
}

const ITEMS_PER_PAGE = 5;

export function AdminUsersTable({
  users,
  availableGroups = [],
  showCreateButton = true,
}: AdminUsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Derivar grupos únicos disponibles si no fueron pasados explícitamente
  const allGroups = useMemo(() => {
    if (availableGroups.length > 0) return availableGroups;
    const map = new Map<string, string>();
    users.forEach((u) => u.groups.forEach((g) => map.set(g.id, g.name)));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [users, availableGroups]);

  // Filtrado de usuarios en tiempo real (por texto y por rol)
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      // Filtro de rol
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;

      // Filtro de texto
      if (!q) return true;
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchRole = u.role.toLowerCase().includes(q);
      const matchGroups = u.groups.some((g) => g.name.toLowerCase().includes(q));
      return matchName || matchEmail || matchRole || matchGroups;
    });
  }, [users, searchQuery, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  if (safeCurrentPage !== currentPage && totalPages > 0) {
    setCurrentPage(safeCurrentPage);
  }

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleEditClick = (user: UserItem) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      const actionText = targetUser.isActive ? "desactivar/suspender" : "activar";
      const confirmed = window.confirm(
        `¿Confirmas que deseas ${actionText} la cuenta de "${targetUser.name}" (${targetUser.email})?`
      );
      if (!confirmed) return;
    }

    setTogglingUserId(userId);
    try {
      const res = await toggleUserStatusAction(userId);
      if (!res.success && res.error) {
        alert(res.error);
      }
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Nombre", "Email", "Rol", "Estado", "Grupos"];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      u.role,
      u.isActive ? "Activo" : "Inactivo",
      `"${u.groups.map((g) => g.name).join(", ")}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `usuarios_roles_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="users" className="bg-white border border-[#F0E7E1] rounded-2xl p-5 shadow-2xs space-y-4">
      {/* Cabecera y Barra de Acciones */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] text-[#C2410C] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">Usuarios y Asignación de Roles</h2>
            <p className="text-xs text-stone-500">
              Gestión de credenciales, privilegios RBAC y equipos operativos de soporte.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de filtro por Rol */}
          <div className="flex items-center bg-stone-100/80 p-0.5 rounded-xl text-xs font-medium">
            <button
              onClick={() => {
                setRoleFilter("ALL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                roleFilter === "ALL"
                  ? "bg-white text-stone-900 font-bold shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => {
                setRoleFilter("ADMIN");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                roleFilter === "ADMIN"
                  ? "bg-[#FFF1EB] text-[#C2410C] font-bold shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Admins</span>
            </button>
            <button
              onClick={() => {
                setRoleFilter("USER");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                roleFilter === "USER"
                  ? "bg-white text-stone-900 font-bold shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <User className="w-3 h-3" />
              <span>Usuarios</span>
            </button>
          </div>

          {/* Barra de Búsqueda */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar colaborador o área..."
              className="bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white transition-all w-44 sm:w-56"
            />
          </div>

          {/* Botón Exportar CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2 border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-50 shadow-2xs transition-colors"
            title="Exportar usuarios a CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Botón Agregar Usuario (Solo Administrador) */}
          {showCreateButton && (
            <CreateUserModal availableGroups={allGroups} />
          )}
        </div>
      </div>

      {/* Tabla Estilizada de Colaboradores (Máximo 5 por página) */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F6] text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-stone-100">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol RBAC</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Grupos Vinculados</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-xs text-stone-400">
                  {searchQuery || roleFilter !== "ALL"
                    ? "No se encontraron colaboradores que coincidan con los filtros aplicados."
                    : "No hay colaboradores registrados."}
                </td>
              </tr>
            ) : (
              currentUsers.map((u) => {
                const initials = u.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                const isToggling = togglingUserId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Nombre y Avatar */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FFE7DE] text-[#9A3412] font-bold text-xs flex items-center justify-center shrink-0 border border-[#F9C3B0]">
                          {initials}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 block leading-tight">
                            {u.name}
                          </span>
                          <span className="text-[11px] text-stone-400 block leading-tight">
                            {u.role === "ADMIN" ? "Super Admin / Nivel 0" : "Técnico Especialista"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5 text-stone-500 font-mono text-[11px]">{u.email}</td>

                    {/* Rol */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "ADMIN"
                            ? "bg-[#B4461B] text-white"
                            : "bg-stone-100 text-stone-700 border border-stone-200"
                        }`}
                      >
                        {u.role === "ADMIN" ? (
                          <>
                            <Shield className="w-3 h-3" />
                            <span>ADMIN</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-stone-400" />
                            <span>USER</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u.id)}
                        disabled={isToggling}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
                        title={u.isActive ? "Clic para suspender cuenta" : "Clic para activar cuenta"}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin text-stone-400" />
                        ) : (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              u.isActive ? "bg-emerald-500" : "bg-stone-400"
                            }`}
                          />
                        )}
                        <span className={u.isActive ? "text-emerald-700" : "text-stone-500 line-through"}>
                          {u.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </button>
                    </td>

                    {/* Grupos Vinculados */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {u.groups.length === 0 ? (
                          <span className="text-stone-400 italic text-[11px]">Sin asignaciones</span>
                        ) : (
                          u.groups.map((grp) => (
                            <span
                              key={grp.id}
                              className="bg-[#FFF1EB] text-[#C2410C] font-semibold text-[11px] px-2 py-0.5 rounded-md border border-[#FDE0D4]"
                            >
                              {grp.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-stone-400">
                        <button
                          type="button"
                          onClick={() => handleEditClick(u)}
                          className="p-1.5 text-stone-600 hover:text-[#C2410C] hover:bg-[#FFF1EB] rounded-lg transition-colors border border-transparent hover:border-[#FDE0D4]"
                          title="Editar perfil y permisos"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.isActive
                              ? "hover:text-red-600 hover:bg-red-50"
                              : "hover:text-emerald-600 hover:bg-emerald-50 text-stone-300"
                          }`}
                          title={u.isActive ? "Desactivar usuario" : "Activar usuario"}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación Inferior Funcional */}
      <PaginationControl
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredUsers.length}
        itemsPerPage={ITEMS_PER_PAGE}
        label="colaboradores con políticas RBAC aplicadas"
      />

      {/* Modal para Editar Perfil y Roles de Usuario */}
      <EditUserModal
        user={editingUser}
        availableGroups={allGroups}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
      />
    </div>
  );
}
