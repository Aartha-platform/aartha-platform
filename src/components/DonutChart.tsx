"use client";

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { RFQStatusData } from '../types';

interface DonutChartProps {
  data: RFQStatusData[];
  width?: number;
  height?: number;
}

export default function DonutChart({ data, width = 200, height = 200 }: DonutChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="relative inline-flex items-center justify-center font-sans">
      {mounted ? (
        <PieChart width={width} height={height}>
          <Pie
            data={data}
            cx={width / 2}
            cy={height / 2}
            innerRadius={Math.round(height * 0.3)}
            outerRadius={Math.round(height * 0.45)}
            dataKey="value"
            nameKey="label"
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-navy/90 dark:bg-slate-800/90 backdrop-blur-md text-white dark:text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-gold/25 shadow-premium pointer-events-none select-none">
                    {item.label}: {item.value}
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      ) : (
        // Client-mounted loading skeleton placeholder
        <div 
          style={{ width, height }} 
          className="rounded-full border border-border-default/45 flex items-center justify-center bg-cream-secondary/20"
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <span className="text-base font-bold text-text-primary">{total}</span>
          <div className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Total</div>
        </div>
      </div>
    </div>
  );
}
