import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TicketHub - Plataforma Empresarial de Gestión de Tickets",
  description: "Gestión de incidencias y soporte técnico corporativo multiequipo con RBAC y chat en tiempo real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased bg-[#FAF7F5] text-stone-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
