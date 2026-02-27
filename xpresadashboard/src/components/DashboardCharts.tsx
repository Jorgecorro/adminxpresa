'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface ChartDataPoint {
    date: string;
    ventas: number;
    gastos: number;
    balance: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const fmt = (v: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(v);
        return (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[160px]">
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px] mb-2">{label}</p>
                {payload.map((entry: any) => (
                    <div key={entry.name} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                            <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
                            {entry.name === 'ventas' ? 'Ventas' : entry.name === 'gastos' ? 'Gastos' : 'Balance'}
                        </span>
                        <span className="font-black" style={{ color: entry.color }}>{fmt(entry.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function DashboardCharts({ data }: { data: ChartDataPoint[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-600 text-sm italic">
                Sin datos para graficar en este periodo.
            </div>
        );
    }

    const fmt = (v: number) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact', minimumFractionDigits: 0 }).format(v);

    return (
        <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ventas" stroke="#6366f1" strokeWidth={2} fill="url(#colorVentas)" dot={false} name="ventas" />
                <Area type="monotone" dataKey="gastos" stroke="#f43f5e" strokeWidth={2} fill="url(#colorGastos)" dot={false} name="gastos" />
                <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fill="url(#colorBalance)" dot={false} name="balance" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
