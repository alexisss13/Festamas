'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Truck } from "lucide-react";

interface LogisticsChartProps {
  data: { name: string; pickup: number; delivery: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const pickup = payload[0].value;
    const delivery = payload[1].value;
    const total = pickup + delivery;
    
    // Convertir "14/03" a "14 de Marzo"
    const [day, month] = label.split('/');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const formattedDate = `${day} de ${monthNames[parseInt(month) - 1]}`;
    
    return (
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-2.5 py-2">
        <p className="text-[10px] text-slate-500 mb-1.5">{formattedDate}</p>
        <div className="space-y-0.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-600">Recojo</span>
            <span className="text-[11px] font-semibold text-slate-900">{pickup}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-600">Envío</span>
            <span className="text-[11px] font-semibold text-slate-900">{delivery}</span>
          </div>
          <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-slate-700">Total</span>
            <span className="text-[11px] font-bold text-slate-900">{total}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function LogisticsChart({ data }: LogisticsChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[350px] flex flex-col items-center justify-center text-slate-400 gap-2">
        <Truck className="h-8 w-8 opacity-20" />
        <p className="text-sm font-medium">No hay datos de logística recientes.</p>
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
          allowDecimals={false}
          fontWeight={500}
          width={50}
          label={{ 
            value: 'Cantidad', 
            angle: -90, 
            position: 'insideLeft',
            style: { fontSize: 13, fontWeight: 600, fill: '#475569' }
          }}
        />
        <Tooltip 
          content={<CustomTooltip />} 
          cursor={{ fill: '#f1f5f9', opacity: 0.5 }} 
          animationDuration={300}
          animationEasing="ease-out"
          isAnimationActive={true}
        />
        <Legend 
          wrapperStyle={{ 
            fontSize: '12px', 
            fontWeight: 500,
            position: 'absolute',
            bottom: '5px',
            left: '70px'
          }}
          iconType="square"
          iconSize={10}
          align="left"
          verticalAlign="bottom"
        />
        <Bar 
          dataKey="pickup" 
          fill="var(--primary)" 
          radius={[8, 8, 0, 0]} 
          barSize={35}
          name="Recojo en Tienda"
          minPointSize={6}
        />
        <Bar 
          dataKey="delivery" 
          fill="#64748b" 
          radius={[8, 8, 0, 0]} 
          barSize={35}
          name="Envío a Domicilio"
          minPointSize={6}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
