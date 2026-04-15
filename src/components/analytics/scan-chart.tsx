"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

interface ScanChartProps {
  data: { date: string; scans: number }[];
}

export function ScanChart({ data }: ScanChartProps) {
  if (data.every((d) => d.scans === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Nessuna scansione nel periodo selezionato
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => format(parseISO(value), "dd MMM", { locale: it })}
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          allowDecimals={false}
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          labelFormatter={(value) =>
            format(parseISO(value as string), "dd MMMM yyyy", { locale: it })
          }
          formatter={(value) => [String(value), "Scansioni"]}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Area
          type="monotone"
          dataKey="scans"
          stroke="hsl(var(--primary))"
          fill="url(#scanGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
