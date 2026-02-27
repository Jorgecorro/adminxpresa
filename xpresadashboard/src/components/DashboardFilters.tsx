'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DashboardFiltersProps {
    currentRange?: string;
    customFrom?: string;
    customTo?: string;
}

const RANGE_OPTIONS = [
    { value: 'today', label: 'Hoy' },
    { value: '7d', label: '7 Días' },
    { value: '30d', label: '30 Días' },
    { value: 'all', label: 'Siempre' },
    { value: 'custom', label: 'Rango' },
] as const;

export function DashboardFilters({ currentRange = '30d', customFrom = '', customTo = '' }: DashboardFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilters = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Range buttons — horizontally scrollable on mobile */}
            <div className="flex items-center gap-1.5 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md overflow-x-auto">
                {RANGE_OPTIONS.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => updateFilters({ range: value })}
                        className={`px-3 md:px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${currentRange === value
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Custom date pickers — stack vertically on mobile */}
            {currentRange === 'custom' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Calendar className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider w-10">Desde</span>
                        <Input
                            type="date"
                            className="bg-slate-950 border-slate-700 h-8 flex-1 sm:w-36 text-xs text-white"
                            value={customFrom}
                            onChange={(e) => updateFilters({ from: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:border-l sm:border-slate-800 sm:pl-3">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider w-10">Hasta</span>
                        <Input
                            type="date"
                            className="bg-slate-950 border-slate-700 h-8 flex-1 sm:w-36 text-xs text-white"
                            value={customTo}
                            onChange={(e) => updateFilters({ to: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
