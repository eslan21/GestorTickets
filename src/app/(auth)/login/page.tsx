// src/app/(auth)/login/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, AlertCircle, ArrowRight, Ticket, ShieldAlert } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInactiveParam = searchParams.get("error") === "inactive";

  const [showInactiveAlert, setShowInactiveAlert] = useState(isInactiveParam);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Si se redirigió por cuenta inactiva, limpiar la sesión previa del navegador
  useEffect(() => {
    if (isInactiveParam) {
      signOut({ redirect: false });
    }
  }, [isInactiveParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setShowInactiveAlert(false);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard/tickets",
      });

      if (res?.error) {
        setError("Credenciales inválidas o cuenta desactivada. Verifica tu correo y contraseña.");
      } else {
        window.location.href = "/dashboard/tickets";
      }
    } catch {
      setError("Ocurrió un error inesperado al intentar iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white border border-[#F0E7E1] p-8 rounded-3xl shadow-xs">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm">
          <Ticket className="h-7 w-7 rotate-[-10deg]" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">
          Ticket<span className="text-[#C2410C]">Hub</span>
        </h2>
        <p className="mt-1.5 text-xs text-stone-500">
          Portal Corporativo de Soporte & Gestión Multiequipo (RBAC)
        </p>
      </div>

      {showInactiveAlert && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-800 text-xs">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-bold block">Acceso denegado</span>
            <span>Tu cuenta ha sido desactivada por un Administrador. Has perdido el acceso al sistema.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3 text-red-600 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@empresa.com"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">Contraseña</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C2410C] focus:bg-white transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#B4461B] hover:bg-[#9A3412] text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <span className="inline-block animate-spin mr-2">⟳</span>
          ) : (
            <>
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="border-t border-stone-100 pt-4 text-center">
        <p className="text-[11px] text-stone-400">
          Control granular de accesos por roles y áreas • Auth.js v5
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F5] px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-xs text-stone-400">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
