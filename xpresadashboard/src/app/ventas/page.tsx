import { createClient } from "@/utils/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/database";
import { SalesFilters } from "@/components/SalesFilters";
import { OrderRow, OrderAction } from "@/components/OrderRow";
import {
    ArrowUpRight,
    Clock,
    CheckCircle2,
    FileText,
    User,
    AlertCircle
} from "lucide-react";

interface PageProps {
    searchParams: Promise<{
        range?: string;
        vendedor?: string;
        status?: string;
        from?: string;
        to?: string;
    }>;
}

export default async function VentasPage({ searchParams }: PageProps) {
    const supabase = await createClient();
    const { range, vendedor, status, from, to } = await searchParams;

    // Build the Supabase query
    let query = supabase
        .from('orders')
        .select(`
      *,
      vendedor:profiles(id, full_name)
    `)
        .order('created_at', { ascending: false });

    // Apply filters to query
    if (vendedor && vendedor !== 'all') {
        query = query.eq('vendedor_id', vendedor);
    }

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    // Date Logic
    const now = new Date();
    if (range === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', today);
    } else if (range === 'yesterday') {
        const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
        const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', yesterdayStart).lt('created_at', yesterdayEnd);
    } else if (range === '7d') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', weekAgo);
    } else if (range === '30d') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', monthAgo);
    } else if (range === 'custom' && from) {
        query = query.gte('created_at', new Date(from).toISOString());
        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            query = query.lte('created_at', toDate.toISOString());
        }
    }

    const { data: ordersData, error: ordersError } = await query;
    const orders = ordersData as (Order & { vendedor: { id: string; full_name: string } | null })[] | null;

    // Fetch unique sellers and statuses for filter dropdowns
    const { data: profiles } = await supabase.from('profiles').select('id, full_name');
    const uniqueStatuses = ['cotizado', 'pendiente', 'pagado', 'enviado'];

    // Metrics (calculated from filtered results)
    const totalSales = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
    const pendingCount = orders?.filter(o => o.status === 'pendiente' || o.status === 'cotizado').length || 0;
    const completedCount = orders?.filter(o => o.status === 'pagado' || o.status === 'enviado').length || 0;

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pagado': return <Badge variant="success">Pagado</Badge>;
            case 'enviado': return <Badge variant="info">Enviado</Badge>;
            case 'pendiente': return <Badge variant="warning">Pendiente</Badge>;
            case 'cotizado': return <Badge variant="default">Cotizado</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-50">Ventas y Órdenes</h2>
                    <p className="text-slate-400">Panel administrativo con filtros avanzados de control.</p>
                </div>
            </div>

            <SalesFilters
                vendedores={profiles || []}
                statuses={uniqueStatuses}
            />

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Venta en Periodo</p>
                                <h3 className="text-2xl font-bold text-slate-50 mt-1">{formatter.format(totalSales)}</h3>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-xl">
                                <ArrowUpRight className="h-6 w-6 text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Por Procesar</p>
                                <h3 className="text-2xl font-bold text-slate-50 mt-1">{pendingCount} órdenes</h3>
                            </div>
                            <div className="p-3 bg-amber-500/10 rounded-xl">
                                <Clock className="h-6 w-6 text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Terminadas</p>
                                <h3 className="text-2xl font-bold text-slate-50 mt-1">{completedCount} ventas</h3>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <CheckCircle2 className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-950/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Folio</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vendedor</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Estatus</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Info</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {orders?.map((order) => (
                                <OrderRow key={order.id} orderId={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-200 capitalize">
                                                #{order.temp_id || order.id.slice(0, 8)}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                {new Date(order.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-slate-300 font-medium">
                                            {order.customer_name || 'Particular'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 border border-slate-700">
                                                {order.vendedor?.full_name?.charAt(0) || 'V'}
                                            </div>
                                            <span className="text-sm text-slate-400">
                                                {order.vendedor?.full_name || 'Sistema'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-indigo-400">
                                            {formatter.format(order.total_amount)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(order.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <OrderAction orderId={order.id} />
                                    </td>
                                </OrderRow>
                            ))}
                            {orders?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle className="h-8 w-8 text-slate-700" />
                                            <p className="text-slate-500 text-sm italic">No se encontraron ventas con estos filtros.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
