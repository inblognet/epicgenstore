// components/admin/dashboard-charts.tsx
"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
  // FIXED: Removed the unused 'Legend' import
} from 'recharts';

// FIXED: Defined a strict interface for the chart data
export interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

// FIXED: Defined a strict interface for the tooltip payload
interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

// Custom Tooltip to match your dark theme
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl shadow-2xl">
        <p className="text-zinc-400 text-xs font-bold uppercase mb-2">{label}</p>
        {payload.map((entry: TooltipPayload, index: number) => (
          <p key={index} className="text-sm font-black" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes("Revenue") ? "LKR " : ""}{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// FIXED: Replaced 'any[]' with 'ChartData[]'
export function RevenueChart({ data }: { data: ChartData[] }) {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value/1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// FIXED: Replaced 'any[]' with 'ChartData[]'
export function OrdersChart({ data }: { data: ChartData[] }) {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="orders" name="Orders" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}