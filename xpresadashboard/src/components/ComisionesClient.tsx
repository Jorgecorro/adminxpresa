'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { createClient as createRawClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Percent,
    Search,
    ArrowUpRight,
    TrendingUp,
    Users as UsersIcon,
    AlertCircle,
    CheckCircle2,
    Edit2,
    Save,
    X,
    Loader2,
    DollarSign,
    Calendar,
    ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';

interface CommissionOrder {
    id: string;
    temp_id: number;
    customer_name: string;
    total_amount: number;
    commission_earned: number;
    created_at: string;
    status: string;
    vendedor: {
        id: string;
        full_name: string;
    };
}

interface SellerSummary {
    id: string;
    name: string;
    totalCommissions: number;
    orderCount: number;
}

interface ComisionesClientProps {
    initialOrders: CommissionOrder[];
    vendedores: any[];
}

export default function ComisionesClient({ initialOrders, vendedores }: ComisionesClientProps) {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [orders, setOrders] = useState<CommissionOrder[]>(initialOrders);
    const [editingOrder, setEditingOrder] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Sync state with server props when navigation occurs
    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    const currentRange = searchParams.get('range') || '30d';
    const currentVendedor = searchParams.get('vendedor') || 'all';
    const customFrom = searchParams.get('from') || '';
    const customTo = searchParams.get('to') || '';

    const updateFilters = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        router.push(`?${params.toString()}`);
    };

    const handleUpdateCommission = async (orderId: string) => {
        const newValue = parseFloat(editValue);
        if (isNaN(newValue)) return;

        try {
            // Use untyped client for mutation to bypass strict Database generic
            const rawSupabase = createRawClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { error } = await rawSupabase
                .from('orders')
                .update({ commission_earned: newValue })
                .eq('id', orderId);

            if (!error) {
                setOrders((prev: CommissionOrder[]) => prev.map(o => o.id === orderId ? { ...o, commission_earned: newValue } : o));
                setEditingOrder(null);
            } else {
                alert(`Error al actualizar: ${error.message}`);
            }
        } catch (error: any) {
            alert(`Error de red: ${error.message}`);
        }
    };

    const startEditing = (order: CommissionOrder) => {
        setEditingOrder(order.id);
        setEditValue(order.commission_earned.toString());
    };

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    });

    const sellerSummaries: SellerSummary[] = Object.values(
        orders.reduce((acc: Record<string, SellerSummary>, order) => {
            const vId = order.vendedor?.id || 'system';
            if (!acc[vId]) {
                acc[vId] = {
                    id: vId,
                    name: order.vendedor?.full_name || 'Sistema',
                    totalCommissions: 0,
                    orderCount: 0
                };
            }
            acc[vId].totalCommissions += order.commission_earned;
            acc[vId].orderCount += 1;
            return acc;
        }, {})
    ).sort((a, b) => b.totalCommissions - a.totalCommissions);

    const filteredOrders = orders.filter(order =>
        (order.vendedor?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.temp_id?.toString().includes(searchTerm)
    );

    const totalPeriodCommissions = orders.reduce((sum, o) => sum + o.commission_earned, 0);

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-50 flex items-center gap-2">
                        <Percent className="h-8 w-8 text-indigo-400" />
                        Comisiones
                    </h2>
                    <p className="text-slate-400 mt-1">Gestión y auditoría de ganancias por equipo de ventas.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
                    {(['all', 'today', '7d', '30d'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => updateFilters({ range: mode })}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentRange === mode
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                        >
                            {mode === 'all' ? 'Siempre' : mode === 'today' ? 'Hoy' : mode === '7d' ? '7 Días' : '30 Días'}
                        </button>
                    ))}
                    <button
                        onClick={() => updateFilters({ range: 'custom' })}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentRange === 'custom'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                    >
                        Rango
                    </button>
                </div>
            </div>

            {currentRange === 'custom' && (
                <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl animate-in zoom-in-95 duration-200 shadow-2xl">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Desde</span>
                        <Input
                            type="date"
                            className="bg-slate-950 border-slate-700 h-8 w-40 text-xs text-white"
                            value={customFrom}
                            onChange={(e) => updateFilters({ from: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Hasta</span>
                        <Input
                            type="date"
                            className="bg-slate-950 border-slate-700 h-8 w-40 text-xs text-white"
                            value={customTo}
                            onChange={(e) => updateFilters({ to: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-slate-900 border-slate-800 shadow-xl shadow-indigo-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Comisiones</p>
                                <h3 className="text-2xl font-black text-slate-50 mt-1">{formatter.format(totalPeriodCommissions)}</h3>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                <TrendingUp className="h-6 w-6 text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 shadow-xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vendedores Activos</p>
                                <h3 className="text-2xl font-black text-slate-50 mt-1">{sellerSummaries.length}</h3>
                            </div>
                            <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                <UsersIcon className="h-6 w-6 text-indigo-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 shadow-xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Órdenes con Comisión</p>
                                <h3 className="text-2xl font-black text-slate-50 mt-1">{orders.length}</h3>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-2xl">
                                <CheckCircle2 className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-indigo-600 shadow-lg shadow-indigo-600/20 border-0">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Promedio por Venta</p>
                                <h3 className="text-2xl font-black text-white mt-1">
                                    {orders.length > 0 ? formatter.format(totalPeriodCommissions / orders.length) : '$0'}
                                </h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <ArrowUpRight className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Ranking por Vendedor</h3>
                    {sellerSummaries.map((s, idx) => (
                        <Card key={s.id} className="bg-slate-900/50 border-slate-800/50">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-950 flex items-center justify-center font-black text-xs border border-slate-800 text-indigo-400">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-200">{s.name}</p>
                                        <p className="text-[10px] text-slate-500">{s.orderCount} ventas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-400">{formatter.format(s.totalCommissions)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Buscar..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-slate-900 border border-slate-800 text-slate-400 text-sm rounded-xl px-4 py-2"
                            value={currentVendedor}
                            onChange={(e) => updateFilters({ vendedor: e.target.value })}
                        >
                            <option value="all">Todos los vendedores</option>
                            {vendedores.map(v => (
                                <option key={v.id} value={v.id}>{v.full_name}</option>
                            ))}
                        </select>
                    </div>

                    <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50 border-b border-slate-800">
                                <tr className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                                    <th className="px-6 py-4">Orden</th>
                                    <th className="px-6 py-4">Vendedor</th>
                                    <th className="px-6 py-4">Venta</th>
                                    <th className="px-6 py-4">Comisión</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-800/20 group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-200">#{order.temp_id}</span>
                                                <span className="text-[10px] text-slate-500">{order.customer_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="text-indigo-400 border-indigo-500/30">
                                                {order.vendedor?.full_name || 'Sistema'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {formatter.format(order.total_amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingOrder === order.id ? (
                                                <Input
                                                    type="number"
                                                    className="w-24 h-8 bg-slate-950 text-emerald-400 font-bold"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="text-base font-black text-emerald-400">
                                                    {formatter.format(order.commission_earned)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingOrder === order.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleUpdateCommission(order.id)} className="p-1 text-emerald-400"><Save className="h-4 w-4" /></button>
                                                    <button onClick={() => setEditingOrder(null)} className="p-1 text-red-400"><X className="h-4 w-4" /></button>
                                                </div>
                                            ) : (
                                                <button onClick={() => startEditing(order)} className="p-1 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100"><Edit2 className="h-4 w-4" /></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>
        </div>
    );
}
