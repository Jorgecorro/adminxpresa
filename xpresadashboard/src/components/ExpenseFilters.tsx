'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Calendar, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ExpenseFiltersProps {
    accounts: string[];
}

export function ExpenseFilters({ accounts }: ExpenseFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [dateRange, setDateRange] = useState(searchParams.get('range') || 'all');
    const [account, setAccount] = useState(searchParams.get('account') || 'all');
    const [startDate, setStartDate] = useState(searchParams.get('from') || '');
    const [endDate, setEndDate] = useState(searchParams.get('to') || '');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (dateRange !== 'all') params.set('range', dateRange);
        if (account !== 'all') params.set('account', account);
        if (dateRange === 'custom') {
            if (startDate) params.set('from', startDate);
            if (endDate) params.set('to', endDate);
        }

        router.push(`/gastos?${params.toString()}`);
    };

    useEffect(() => {
        if (dateRange !== 'custom') {
            applyFilters();
        }
    }, [dateRange, account]);

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {/* Account */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5" /> Cuenta de Pago
                    </label>
                    <select
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                    >
                        <option value="all">Todas las cuentas</option>
                        {accounts.map(acc => (
                            <option key={acc} value={acc}>
                                {acc.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Custom Date Inputs */}
                {dateRange === 'custom' && (
                    <div className="flex gap-2 items-end">
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
