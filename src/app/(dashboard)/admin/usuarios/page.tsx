// src/app/(dashboard)/admin/usuarios/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, ChevronRight, ArrowLeft, Shield, UserCheck, Layers } from "lucide-react";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { CreateUserModal } from "@/components/admin/create-user-modal";

export default async function AdminUsuariosPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard/tickets");
  }

  const [users, groups] = await Promise.all([
    prisma.user.findMany({
      include: {
        groups: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.group.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalStandardUsers = users.filter((u) => u.role === "USER").length;
  const totalActive = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Navegación y Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <Link href="/admin" className="hover:text-[#C2410C] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Panel Global</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-semibold text-stone-800">Usuarios y Asignación de Roles</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] text-[#C2410C] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                Usuarios y Asignación de Roles
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                Control de acceso basado en roles (RBAC), credenciales y asignación a áreas operativas.
              </p>
            </div>
          </div>
        </div>

        {/* Botón Agregar Usuario Exclusivo para Perfil Administrador */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/grupos"
            className="bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2 transition-colors"
          >
            <Layers className="w-4 h-4 text-stone-500" />
            <span>Gestionar Áreas</span>
          </Link>
          <CreateUserModal availableGroups={groups} />
        </div>
      </div>

      {/* Métricas de Usuarios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#F0E7E1] p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Total Colaboradores
            </span>
            <div className="p-2 rounded-xl bg-[#FFF1EB] text-[#C2410C]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2">{users.length}</div>
          <span className="text-xs text-stone-500 mt-0.5 block">registrados en la plataforma</span>
        </div>

        <div className="bg-white border border-[#F0E7E1] p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Administradores (ADMIN)
            </span>
            <div className="p-2 rounded-xl bg-[#FFF1EB] text-[#C2410C]">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#C2410C] mt-2">{totalAdmins}</div>
          <span className="text-xs text-stone-500 mt-0.5 block">con privilegios globales</span>
        </div>

        <div className="bg-white border border-[#F0E7E1] p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Usuarios / Técnicos (USER)
            </span>
            <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-800 mt-2">{totalStandardUsers}</div>
          <span className="text-xs text-stone-500 mt-0.5 block">operadores de soporte</span>
        </div>

        <div className="bg-white border border-[#F0E7E1] p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Cuentas Activas
            </span>
            <div className="p-2 rounded-xl bg-[#ECFDF5] text-emerald-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">{totalActive}</div>
          <span className="text-xs text-stone-500 mt-0.5 block">con acceso habilitado</span>
        </div>
      </div>

      {/* Tabla Completa de Colaboradores con Edición y Creación */}
      <AdminUsersTable
        users={users}
        availableGroups={groups}
        showCreateButton={false}
      />
    </div>
  );
}
