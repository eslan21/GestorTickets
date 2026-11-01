// src/components/layout/edit-profile-modal.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSelfProfileAction } from "@/server/actions/users";
import { User, X, AlertCircle, CheckCircle2, Lock, Loader2, Mail } from "lucide-react";

interface EditProfileModalProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ user, isOpen, onClose }: EditProfileModalProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (showPasswordSection && newPassword) {
      if (newPassword.length < 6) {
        setError("La nueva contraseña debe tener al menos 6 caracteres");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Las nuevas contraseñas no coinciden");
        return;
      }
      if (!currentPassword) {
        setError("Debes ingresar tu contraseña actual para establecer una nueva");
        return;
      }
    }

    startTransition(async () => {
      const result = await updateSelfProfileAction({
        name,
        email,
        currentPassword: showPasswordSection ? currentPassword : "",
        newPassword: showPasswordSection ? newPassword : "",
      });

      if (!result.success) {
        setError(result.error || "Error al actualizar perfil");
      } else {
        setSuccess("Perfil actualizado con éxito");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordSection(false);
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1200);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative my-8 text-stone-900 dark:text-stone-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera */}
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFE7DE] to-[#FCD8CA] dark:from-stone-800 dark:to-stone-700 border border-[#F9C3B0] dark:border-stone-600 flex items-center justify-center text-[#9A3412] dark:text-orange-400 font-bold text-sm shrink-0">
            {name.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Editar Perfil de Usuario</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Gestiona tu información personal y credenciales de acceso.
            </p>
          </div>
        </div>

        {/* Indicador de Rol */}
        <div className="flex items-center gap-2 my-3 p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-750 text-xs">
          <span className="text-stone-500 dark:text-stone-400">Rol asignado:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              user.role === "ADMIN"
                ? "bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 border border-[#FDE0D4] dark:border-orange-900/50"
                : "bg-stone-200/80 dark:bg-stone-700 text-stone-800 dark:text-stone-200"
            }`}
          >
            {user.role}
          </span>
          <span className="text-[11px] text-stone-400 dark:text-stone-500 ml-auto">(Configurado por admin)</span>
        </div>

        {/* Mensajes de Alerta */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white dark:focus:bg-stone-800 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white dark:focus:bg-stone-800 transition-colors"
              />
            </div>
          </div>

          {/* Toggle Cambiar Contraseña */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="text-xs font-semibold text-[#C2410C] dark:text-orange-400 hover:text-[#9A3412] dark:hover:text-orange-300 flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {showPasswordSection ? "Ocultar cambio de contraseña" : "¿Deseas cambiar tu contraseña?"}
              </span>
            </button>
          </div>

          {showPasswordSection && (
            <div className="space-y-3 pt-2 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Contraseña Actual *
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                  className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#C2410C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Nueva Contraseña (mínimo 6 caracteres) *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#C2410C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#C2410C]"
                />
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#B4461B] hover:bg-[#9A3412] text-white px-5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 shadow-xs flex items-center gap-2 transition-colors"
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
