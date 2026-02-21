'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Calendar, User, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SalesFiltersProps {
    vendedores: { id: string; full_name: string | null }[];
    statuses: string[];
}

export function SalesFilters({ vendedores, statuses }: SalesFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Current filter values from URL
    const [dateRange, setDateRange] = useState(searchParams.get('range') || 'all');
    const [vendedorId, setVendedorId] = useState(searchParams.get('vendedor') || 'all');
    const [status, setStatus] = useState(searchParams.get('status') || 'all');
    const [startDate, setStartDate] = useState(searchParams.get('from') || '');
    const [endDate, setEndDate] = useState(searchParams.get('to') || '');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (dateRange !== 'all') params.set('range', dateRange);
        if (vendedorId !== 'all') params.set('vendedor', vendedorId);
        if (status !== 'all') params.set('status', status);
        if (dateRange === 'custom') {
            if (startDate) params.set('from', startDate);
            if (endDate) params.set('to', endDate);
        }

        router.push(`/ventas?${params.toString()}`);
    };

    // Auto-apply when non-custom filters change
    useEffect(() => {
        if (dateRange !== 'custom') {
            applyFilters();
        }
    }, [dateRange, vendedorId, status]);

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Date Range */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" /> Periodo
                    </label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                    >
                        <option value="all">Todo el tiempo</option>
                        <option value="today">Hoy</option>
                        <option value="yesterday">Ayer</option>
                        <option value="7d">Últimos 7 días</option>
                        <option value="30d">Últimos 30 días</option>
                        <option value="custom">Rango personalizado</option>
                    </select>
                </div>

                {/* Vendedor */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <User className="h-3.5 w-3.5" /> Vendedor
                    </label>
                    <select
                        value={vendedorId}
                        onChange={(e) => setVendedorId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                    >
                        <option value="all">Todos los vendedores</option>
                        {vendedores.map(v => (
                            <option key={v.id} value={v.id}>{v.full_name || 'Vendedor sin nombre'}</option>
                        ))}
                    </select>
                </div>

                {/* Estatus */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5" /> Estatus
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                    >
                        <option value="all">Cualquier estatus</option>
                        {statuses.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>

                {/* Custom Date Inputs (only if custom is selected) */}
                {dateRange === 'custom' && (
                    <div className="lg:col-span-1 flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase">Desde</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-bold text-slate-600 uppercase">Hasta</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                            />
                        </div>
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all h-[38px]"
                        >
                            Ir
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
