import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
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
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body className="antialiased bg-[#FAF7F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 min-h-screen transition-colors duration-150">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
