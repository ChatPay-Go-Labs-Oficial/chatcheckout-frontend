'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesBarChartProps {
  data: { day: string; value: number }[];
}

export default function SalesBarChart({ data }: SalesBarChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-5 w-full h-64 flex flex-col animate-pulse">
        <span className="text-base font-semibold text-[#181b4a] mb-2">Vendas da Semana</span>
        <div className="flex-1 bg-gray-100 rounded-xl" />
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 w-full h-64 flex flex-col">
      <span className="text-base font-semibold text-[#181b4a] mb-2">Vendas da Semana</span>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="day" axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="value" fill="#6f43d0" radius={[8, 8, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
