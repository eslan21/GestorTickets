// src/components/admin/create-user-modal.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUserAction } from "@/server/actions/users";
import { UserPlus, X, AlertCircle, Shield, User, Check, Loader2 } from "lucide-react";
import { Role } from "@prisma/client";

interface GroupOption {
  id: string;
  name: string;
}

interface CreateUserModalProps {
  availableGroups: GroupOption[];
  buttonText?: string;
  className?: string;
}

export function CreateUserModal({
  availableGroups,
  buttonText = "Nuevo Usuario",
  className,
}: CreateUserModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.USER);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole(Role.USER);
    setSelectedGroups([]);
    setIsActive(true);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createUserAction({
        name,
        email,
        password,
        role,
        groupIds: selectedGroups,
        isActive,
      });

      if (!result.success) {
        setError(result.error || "Error al crear usuario");
      } else {
        handleReset();
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <button
        onClick={() => {
          handleReset();
          setIsOpen(true);
        }}
        className={
          className ||
          "bg-[#B4461B] hover:bg-[#9A3412] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-colors shrink-0"
        }
      >
        <UserPlus className="w-4 h-4" />
        <span>{buttonText}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] text-[#C2410C] flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Agregar Nuevo Usuario</h3>
                <p className="text-xs text-stone-500">
                  Crea un nuevo colaborador y define su nivel de privilegios y grupos de soporte.
                </p>
              </div>
            </div>

            {error && (
              <div className="my-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Selección de Rol Requerida: ADMIN o USER */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Tipo de Perfil / Rol del Usuario *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Opción USUARIO */}
                  <label
                    onClick={() => setRole(Role.USER)}
                    className={`cursor-pointer border-2 rounded-xl p-3.5 flex flex-col gap-1 transition-all ${
                      role === Role.USER
                        ? "border-[#C2410C] bg-[#FFF1EB]/50"
                        : "border-stone-200 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            role === Role.USER
                              ? "bg-[#C2410C] text-white"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-stone-900">Usuario</span>
                      </div>
                      {role === Role.USER && (
                        <Check className="w-4 h-4 text-[#C2410C] font-bold" />
                      )}
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1">
                      Técnico operativo. Gestiona tickets en sus grupos asignados.
                    </span>
                  </label>

                  {/* Opción ADMIN */}
                  <label
                    onClick={() => setRole(Role.ADMIN)}
                    className={`cursor-pointer border-2 rounded-xl p-3.5 flex flex-col gap-1 transition-all ${
                      role === Role.ADMIN
                        ? "border-[#B4461B] bg-[#FFF1EB]/50"
                        : "border-stone-200 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            role === Role.ADMIN
                              ? "bg-[#B4461B] text-white"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-stone-900">Administrador</span>
                      </div>
                      {role === Role.ADMIN && (
                        <Check className="w-4 h-4 text-[#B4461B] font-bold" />
                      )}
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1">
                      Acceso total (RBAC), auditoría global, gestión de áreas y usuarios.
                    </span>
                  </label>
                </div>
              </div>

              {/* Nombre Completo */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Sofia Mendoza"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
                />
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Correo Electrónico (Login) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
                />
              </div>

              {/* Contraseña Inicial */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Contraseña Inicial *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
                />
              </div>

              {/* Grupos / Áreas de Soporte vinculadas */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Áreas / Grupos de Soporte Asignados
                </label>
                <p className="text-[11px] text-stone-400 mb-2">
                  Selecciona los grupos en los que este colaborador atenderá tickets:
                </p>

                {availableGroups.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No hay grupos creados aún.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
                    {availableGroups.map((group) => {
                      const isChecked = selectedGroups.includes(group.id);
                      return (
                        <label
                          key={group.id}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                            isChecked
                              ? "bg-[#FFF1EB] border-[#FDE0D4] text-[#9A3412] font-semibold"
                              : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100/60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleGroupToggle(group.id)}
                            className="rounded border-stone-300 text-[#C2410C] focus:ring-[#C2410C]"
                          />
                          <span className="truncate">{group.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Estado de Cuenta */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs font-semibold text-stone-800 block">
                    Estado de la Cuenta
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {isActive ? "Permitir acceso inmediato al sistema" : "Cuenta temporalmente bloqueada"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isActive ? "bg-emerald-600" : "bg-stone-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#B4461B] hover:bg-[#9A3412] text-white px-5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 shadow-xs flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Crear Usuario</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
