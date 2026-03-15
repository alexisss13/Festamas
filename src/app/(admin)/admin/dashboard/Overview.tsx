'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

interface OverviewProps {
  data: { name: string; total: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    
    // Convertir "14/03" a "14 de Marzo"
    const [day, month] = label.split('/');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const formattedDate = `${day} de ${monthNames[parseInt(month) - 1]}`;
    
    return (
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2">
        <p className="text-[10px] text-slate-500 mb-1">{formattedDate}</p>
        <p className="text-sm font-bold text-slate-900">S/ {value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export function Overview({ data }: OverviewProps) {
  if (data.length === 0) {
    return (
      <div className="h-[350px] flex flex-col items-center justify-center text-slate-400 gap-2">
        <TrendingUp className="h-8 w-8 opacity-20" />
        <p className="text-sm font-medium">No hay datos de ventas recientes.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
          stroke="#64748b" 
          fontSize={13} 
          tickLine={false} 
          axisLine={{ stroke: '#cbd5e1' }}
          dy={8}
          fontWeight={600}
          label={{ 
            value: 'Fecha', 
            position: 'insideBottom', 
            offset: -10,
            style: { fontSize: 13, fontWeight: 600, fill: '#475569' }
          }}
        />
        <YAxis 
          stroke="#64748b" 
          fontSize={13} 
          tickLine={false} 
          axisLine={{ stroke: '#cbd5e1' }}
          tickFormatter={(v) => `S/${v}`}
          fontWeight={500}
          width={70}
          label={{ 
            value: 'Ingresos (S/)', 
            angle: -90, 
            position: 'insideLeft',
            style: { fontSize: 13, fontWeight: 600, fill: '#475569' }
          }}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          cursor={{ fill: 'var(--primary)', opacity: 0.1 }} 
          animationDuration={300}
          animationEasing="ease-out"
          isAnimationActive={true}
        />
        <Bar 
          dataKey="total" 
          fill="var(--primary)" 
          radius={[8, 8, 0, 0]} 
          barSize={50}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
