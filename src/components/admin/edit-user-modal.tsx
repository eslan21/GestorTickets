// src/components/admin/edit-user-modal.tsx
"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateUserAction } from "@/server/actions/users";
import { X, AlertCircle, Shield, User, Check, Loader2, KeyRound } from "lucide-react";
import { Role } from "@prisma/client";

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

interface EditUserModalProps {
  user: UserItem | null;
  availableGroups: { id: string; name: string }[];
  isOpen: boolean;
  onClose: () => void;
}

export function EditUserModal({
  user,
  availableGroups,
  isOpen,
  onClose,
}: EditUserModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>(Role.USER);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setSelectedGroups(user.groups.map((g) => g.id));
      setIsActive(user.isActive);
      setPassword("");
      setError(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.trim().length > 0 && password.trim().length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    startTransition(async () => {
      const result = await adminUpdateUserAction({
        userId: user.id,
        name,
        email,
        role,
        isActive,
        groupIds: selectedGroups,
        password: password.trim() ? password : "",
      });

      if (!result.success) {
        setError(result.error || "Error al actualizar usuario");
      } else {
        onClose();
        router.refresh();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] text-[#C2410C] flex items-center justify-center font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Editar Usuario y Permisos</h3>
            <p className="text-xs text-stone-500">
              Modifica los privilegios RBAC, estado y áreas operativas asignadas.
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
          {/* Selección de Rol */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Rol del Usuario *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole(Role.USER)}
                className={`text-left border-2 rounded-xl p-3 flex flex-col gap-1 transition-all ${
                  role === Role.USER
                    ? "border-[#C2410C] bg-[#FFF1EB]/50"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        role === Role.USER
                          ? "bg-[#C2410C] text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-stone-900">Usuario</span>
                  </div>
                  {role === Role.USER && <Check className="w-4 h-4 text-[#C2410C]" />}
                </div>
                <span className="text-[10px] text-stone-500">
                  Técnico operativo en grupos asignados.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole(Role.ADMIN)}
                className={`text-left border-2 rounded-xl p-3 flex flex-col gap-1 transition-all ${
                  role === Role.ADMIN
                    ? "border-[#B4461B] bg-[#FFF1EB]/50"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        role === Role.ADMIN
                          ? "bg-[#B4461B] text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-stone-900">Administrador</span>
                  </div>
                  {role === Role.ADMIN && <Check className="w-4 h-4 text-[#B4461B]" />}
                </div>
                <span className="text-[10px] text-stone-500">
                  Acceso total global (RBAC y auditoría).
                </span>
              </button>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
            />
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
            />
          </div>

          {/* Restablecer Contraseña (Opcional) */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1">
              <KeyRound className="w-3.5 h-3.5 text-stone-400" />
              <span>Restablecer Contraseña (opcional)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Dejar en blanco para mantener la contraseña actual (mín. 6 caracteres)"
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white"
            />
            {password.trim().length > 0 && password.trim().length < 6 && (
              <p className="text-[11px] text-amber-600 mt-1">
                La nueva contraseña debe tener al menos 6 caracteres.
              </p>
            )}
          </div>

          {/* Áreas Asignadas */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Áreas / Grupos de Soporte Vinculados
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
              {availableGroups.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No hay grupos disponibles.</p>
              ) : (
                availableGroups.map((group) => {
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
                })
              )}
            </div>
          </div>

          {/* Estado Activo / Inactivo */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-xs font-semibold text-stone-800 block">
                Estado del Usuario
              </span>
              <span className="text-[11px] text-stone-400">
                {isActive ? "Usuario activo con acceso al sistema" : "Usuario suspendido"}
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

          {/* Botones de acción */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
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
                <span>Guardar Cambios</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
