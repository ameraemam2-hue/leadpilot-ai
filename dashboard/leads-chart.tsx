"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function LeadsChart({ data }: { data: { day: string; leads: number }[] }) {
  return (
    <div className="lp-card p-5">
      <div className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#7a8099] mb-1">
          Last 14 days
        </div>
        <h3 className="font-display font-bold text-base">Leads received</h3>
      </div>
      <div className="h-[240px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#222632" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#7a8099"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#7a8099"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ fill: "#181c24" }}
              contentStyle={{
                background: "#111318",
                border: "1px solid #222632",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="leads" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#7c5cfc" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
