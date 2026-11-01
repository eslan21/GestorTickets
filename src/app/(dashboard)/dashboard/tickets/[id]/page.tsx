// src/app/(dashboard)/dashboard/tickets/[id]/page.tsx
import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/ticket-badges";
import { TicketActionsBar } from "@/components/tickets/ticket-actions-bar";
import { TicketChat } from "@/components/chat/ticket-chat";
import { ArrowLeft, User, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface TicketDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      group: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      messages: {
        include: {
          sender: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  // Comprobar RBAC: ADMIN o miembro del grupo responsable
  const isMember = session.user.groupIds?.includes(ticket.groupId);
  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin && !isMember) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-center max-w-xl mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Acceso Restringido</h2>
        <p className="text-sm text-stone-600 dark:text-stone-300 mt-2">
          No tienes permisos para visualizar este ticket porque no perteneces al área responsable (
          <span className="font-semibold text-stone-800 dark:text-stone-200">{ticket.group.name}</span>).
        </p>
        <Link
          href="/dashboard/tickets"
          className="mt-5 inline-block px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
        >
          Volver a mis tickets
        </Link>
      </div>
    );
  }

  // Lista de todos los grupos para la derivación
  const allGroups = await prisma.group.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Lista de todos los usuarios para asignación específica (Admin)
  const allUsers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Botón Volver y Metadatos Superiores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-5">
        <div className="space-y-2">
          <Link
            href="/dashboard/tickets"
            className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la lista de tickets</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">{ticket.title}</h1>
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
        </div>

        {/* Barra de Acciones */}
        <TicketActionsBar
          ticketId={ticket.id}
          currentStatus={ticket.status}
          currentGroupId={ticket.groupId}
          assignedToId={ticket.assignedToId}
          currentUserId={session.user.id}
          isAdmin={isAdmin}
          allGroups={allGroups}
          allUsers={allUsers}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Información y Detalles del Ticket */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 space-y-4 shadow-2xs transition-colors">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3">
              Detalles del Incidente
            </h3>

            <div>
              <span className="text-xs text-stone-500 dark:text-stone-400 block mb-1.5 font-medium">Descripción</span>
              <p className="text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-xl border border-stone-200/60 dark:border-stone-750 leading-relaxed">
                {ticket.description}
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5 font-medium">
                  <Shield className="w-3.5 h-3.5 text-[#C2410C] dark:text-orange-400" />
                  Área Responsable:
                </span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 px-2 py-0.5 rounded-md text-[11px] border border-[#FDE0D4] dark:border-orange-900/50">
                  {ticket.group.name}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                  Reportado por:
                </span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{ticket.createdBy.name}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Técnico Asignado:
                </span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {ticket.assignedTo ? (
                    <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                      {ticket.assignedTo.name}
                    </span>
                  ) : (
                    <span className="text-stone-400 dark:text-stone-500 italic">Sin asignar</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                  Creado:
                </span>
                <span className="text-stone-600 dark:text-stone-400 font-mono">
                  {new Date(ticket.createdAt).toLocaleDateString()}{" "}
                  {new Date(ticket.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {ticket.resolvedAt && (
                <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Resuelto:
                  </span>
                  <span className="text-emerald-800 dark:text-emerald-300 font-semibold font-mono">
                    {new Date(ticket.resolvedAt).toLocaleDateString()}{" "}
                    {new Date(ticket.resolvedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Chat Interno y Línea de Tiempo de Auditoría */}
        <div className="lg:col-span-2">
          <TicketChat
            ticketId={ticket.id}
            initialMessages={ticket.messages}
            currentUserId={session.user.id}
          />
        </div>
      </div>
    </div>
  );
}
