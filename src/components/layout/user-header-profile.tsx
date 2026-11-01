// src/components/layout/user-header-profile.tsx
"use client";

import React, { useState } from "react";
import { User, Settings, ChevronDown } from "lucide-react";
import { EditProfileModal } from "@/components/layout/edit-profile-modal";

interface UserHeaderProfileProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function UserHeaderProfile({ user }: UserHeaderProfileProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdmin = user.role === "ADMIN";

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-3 p-1.5 -mr-1.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left group cursor-pointer"
        title="Ver y editar perfil"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFE7DE] to-[#FCD8CA] dark:from-stone-800 dark:to-stone-700 border border-[#F9C3B0] dark:border-stone-600 flex items-center justify-center text-xs font-bold text-[#9A3412] dark:text-orange-400 shadow-2xs group-hover:border-[#C2410C] dark:group-hover:border-orange-500 transition-colors">
          {initials}
        </div>

        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#C2410C] dark:group-hover:text-orange-400 transition-colors leading-tight">
              {user.name || "Usuario"}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                isAdmin
                  ? "bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 border border-[#FDE0D4] dark:border-orange-900/50"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
              }`}
            >
              {user.role}
            </span>
          </div>
          <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono block leading-tight">
            {user.email}
          </span>
        </div>

        <div className="hidden sm:flex items-center text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
          <Settings className="w-4 h-4" />
        </div>
      </button>

      {/* Modal para Editar Perfil y Contraseña Propia */}
      <EditProfileModal
        user={user}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
