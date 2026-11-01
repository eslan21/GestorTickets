// src/components/admin/admin-dashboard-charts.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Layers,
  Flame,
} from "lucide-react";

export interface DailyTicketMetric {
  date: string;
  label: string;
  created: number;
  resolved: number;
}

export interface GroupMetric {
  name: string;
  total: number;
  resolved: number;
}

export interface AdminDashboardChartsProps {
  dailyData: DailyTicketMetric[];
  groupMetrics: GroupMetric[];
  statusDistribution: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  priorityDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export function AdminDashboardCharts({
  dailyData,
  groupMetrics,
  priorityDistribution,
}: AdminDashboardChartsProps) {
  const { resolvedTheme } = useTheme();
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d">("14d");

  const isDark = resolvedTheme === "dark";
  const gridColor = isDark ? "#292524" : "#F3EBE6";
  const axisColor = isDark ? "#A8A29E" : "#78716C";
  const tooltipBg = isDark ? "#1C1917" : "#FFFFFF";
  const tooltipBorder = isDark ? "#292524" : "#E7DDD6";
  const tooltipTextColor = isDark ? "#F5F5F4" : "#1C1917";

  // Filtrar los datos diarios según el rango seleccionado
  const filteredDailyData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "14d" ? 14 : 30;
    return dailyData.slice(-days);
  }, [dailyData, timeRange]);

  // Totales en el período seleccionado
  const periodTotals = useMemo(() => {
    const createdSum = filteredDailyData.reduce((acc, curr) => acc + curr.created, 0);
    const resolvedSum = filteredDailyData.reduce((acc, curr) => acc + curr.resolved, 0);
    const avgCreated = (createdSum / filteredDailyData.length).toFixed(1);
    const avgResolved = (resolvedSum / filteredDailyData.length).toFixed(1);
    const resolutionRate =
      createdSum > 0 ? Math.round((resolvedSum / createdSum) * 100) : 100;

    return { createdSum, resolvedSum, avgCreated, avgResolved, resolutionRate };
  }, [filteredDailyData]);

  // Colores para prioridades
  const priorityColors: Record<string, string> = {
    critical: "#DC2626", // Rojo
    high: "#EA580C", // Naranja
    medium: "#D97706", // Ámbar
    low: "#059669", // Verde
  };

  const priorityData = [
    { name: "Crítica", count: priorityDistribution.critical, key: "critical" },
    { name: "Alta", count: priorityDistribution.high, key: "high" },
    { name: "Media", count: priorityDistribution.medium, key: "medium" },
    { name: "Baja", count: priorityDistribution.low, key: "low" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Gráfica Principal: Tendencia Diaria de Tickets Creados vs Resueltos */}
      <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 rounded-2xl p-5 shadow-2xs space-y-4 transition-colors">
        {/* Cabecera de la gráfica y selector de rango de tiempo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                Tendencia Diaria de Tickets: Creados vs. Resueltos
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Monitoreo diario de la tasa de entrada de nuevas incidencias frente al ritmo de resolución operativa.
            </p>
          </div>

          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === "7d"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              7 Días
            </button>
            <button
              onClick={() => setTimeRange("14d")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === "14d"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              14 Días
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === "30d"
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs font-bold"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              30 Días
            </button>
          </div>
        </div>

        {/* Resumen numérico del período seleccionado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-700/70">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              Creados en el Período
            </span>
            <span className="text-xl font-extrabold text-[#C2410C] dark:text-orange-400 mt-1 block">
              {periodTotals.createdSum}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500">~{periodTotals.avgCreated} tickets / día</span>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-700/70">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              Resueltos en el Período
            </span>
            <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 block">
              {periodTotals.resolvedSum}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500">~{periodTotals.avgResolved} tickets / día</span>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-700/70">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              Tasa de Eficiencia
            </span>
            <span className="text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 block">
              {periodTotals.resolutionRate}%
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500">resueltos vs creados</span>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/70 dark:border-stone-700/70">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              Balance Neto
            </span>
            <span
              className={`text-xl font-extrabold mt-1 block ${
                periodTotals.resolvedSum >= periodTotals.createdSum
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-[#C2410C] dark:text-orange-400"
              }`}
            >
              {periodTotals.resolvedSum - periodTotals.createdSum >= 0 ? "+" : ""}
              {periodTotals.resolvedSum - periodTotals.createdSum}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500">diferencial de cola</span>
          </div>
        </div>

        {/* Gráfico Recharts de Área Suave */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredDailyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EA580C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="label"
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: tooltipTextColor,
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ fontWeight: "bold", color: tooltipTextColor, marginBottom: "4px" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "10px", fontSize: "12px" }}
              />
              <Area
                type="monotone"
                dataKey="created"
                name="Tickets Creados"
                stroke="#EA580C"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCreated)"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                name="Tickets Resueltos"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorResolved)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Fila Secundaria de Gráficas: Distribución por Área + Nivel de Prioridad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica Izquierda: Tickets por Área / Grupo de Soporte */}
        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 rounded-2xl p-5 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFF1EB] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-400 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Volumen de Incidencias por Área
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Comparativa de tickets totales asignados por departamento
                </p>
              </div>
            </div>
            <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
              {groupMetrics.length} Áreas
            </span>
          </div>

          <div className="h-64 w-full pt-1">
            {groupMetrics.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-400 dark:text-stone-500">
                No hay áreas registradas con datos de tickets.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={groupMetrics}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke={axisColor}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tickFormatter={(val) =>
                      val.length > 14 ? `${val.substring(0, 12)}…` : val
                    }
                  />
                  <YAxis
                    stroke={axisColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: tooltipTextColor,
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
                  />
                  <Bar
                    dataKey="total"
                    name="Total Incidencias"
                    fill="#C2410C"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="resolved"
                    name="Resueltos"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfica Derecha: Distribución por Nivel de Criticidad y Estado */}
        <div className="bg-white dark:bg-stone-900 border border-[#F0E7E1] dark:border-stone-800 rounded-2xl p-5 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Distribución por Nivel de Criticidad
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Clasificación de prioridad y estado de atención
                </p>
              </div>
            </div>
            <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
              SLA Operativo
            </span>
          </div>

          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis
                  type="number"
                  stroke={axisColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke={axisColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: tooltipTextColor,
                  }}
                />
                <Bar dataKey="count" name="Tickets" radius={[0, 6, 6, 0]} barSize={20}>
                  {priorityData.map((entry) => (
                    <Cell
                      key={`cell-${entry.key}`}
                      fill={priorityColors[entry.key] || "#B4461B"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
