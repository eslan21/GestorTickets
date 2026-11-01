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
        className="flex items-center gap-3 p-1.5 -mr-1.5 rounded-xl hover:bg-stone-50 transition-colors text-left group cursor-pointer"
        title="Ver y editar perfil"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFE7DE] to-[#FCD8CA] border border-[#F9C3B0] flex items-center justify-center text-xs font-bold text-[#9A3412] shadow-2xs group-hover:border-[#C2410C] transition-colors">
          {initials}
        </div>

        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-900 group-hover:text-[#C2410C] transition-colors leading-tight">
              {user.name || "Usuario"}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                isAdmin
                  ? "bg-[#FFF1EB] text-[#C2410C] border border-[#FDE0D4]"
                  : "bg-stone-100 text-stone-700 border border-stone-200"
              }`}
            >
              {user.role}
            </span>
          </div>
          <span className="text-[11px] text-stone-400 font-mono block leading-tight">
            {user.email}
          </span>
        </div>

        <div className="hidden sm:flex items-center text-stone-400 group-hover:text-stone-600 transition-colors">
          <Settings className="w-3.5 h-3.5" />
        </div>
      </button>

      {/* Modal para Editar Perfil */}
      <EditProfileModal
        user={user}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
