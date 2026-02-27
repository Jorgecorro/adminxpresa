'use client';

import { useState, useEffect } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileText,
    Calculator,
    PackageCheck,
    Clock,
    User,
    MapPin,
    Phone,
    Mail,
    Truck,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ShopifyOrder {
    id: string;
    name: string;
    createdAt: string;
    total: string;
    customer: string;
    email: string;
    phone: string;
    address: {
        address1: string;
        address2: string;
        city: string;
        province: string;
        zip: string;
    };
    // Editable shipping details
    weight: number;
    length: number;
    width: number;
    height: number;
    colonia: string;
    items: {
        title: string;
        variant?: string;
        image?: string;
        quantity: number;
        price: string;
        total: number;
    }[];
}

interface Quote {
    provider: string;
    service: string;
    price: number;
    days: string;
}

export default function EscuderiaPage() {
    const [orders, setOrders] = useState<ShopifyOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [quoting, setQuoting] = useState(false);
    const [quotes, setQuotes] = useState<Record<string, Quote[]>>({});
    const [selectedQuotes, setSelectedQuotes] = useState<Record<string, number>>({});
    const [selectedGlobal, setSelectedGlobal] = useState(false);

    // Nueva lógica de fechas específica
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [rangeMode, setRangeMode] = useState<'day' | 'range'>('day');
    const [daysRange, setDaysRange] = useState(1);

    // Cargar datos reales de Shopify con ventanas de tiempo exactas
    const fetchOrders = async () => {
        setOrders([]);
        setLoading(true);
        try {
            let url = '/api/escuderia/orders?';

            if (rangeMode === 'range') {
                url += `days=${daysRange}`;
            } else {
                // Modo día a día (Ventana de 24h del día seleccionado)
                const start = new Date(selectedDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(selectedDate);
                end.setHours(23, 59, 59, 999);
                url += `startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
                const enrichedOrders = data.map((order: any) => ({
                    ...order,
                    weight: 1,
                    length: 20,
                    width: 20,
                    height: 10,
                    colonia: order.address?.address2 || ""
                }));
                setOrders(enrichedOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [selectedDate, rangeMode, daysRange]);

    const handleFilterRange = (days: number) => {
        setDaysRange(days);
        setRangeMode('range');
    };

    const handleNextDay = () => {
        setRangeMode('day');
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        setSelectedDate(next);
    };

    const handlePrevDay = () => {
        setRangeMode('day');
        const prev = new Date(selectedDate);
        prev.setDate(prev.getDate() - 1);
        setSelectedDate(prev);
    };

    // Etiqueta dinámica para el selector
    const getDateLabel = () => {
        if (rangeMode === 'range') return `Últimos ${daysRange} días`;
        const today = new Date();
        const isToday = selectedDate.toDateString() === today.toDateString();
        if (isToday) return 'Hoy';
        return format(selectedDate, "dd 'de' MMM", { locale: es });
    };

    const updateOrderField = (orderId: string, field: string, value: any) => {
        setOrders(prev => prev.map(order => {
            if (order.id !== orderId) return order;
            if (field.startsWith('address.')) {
                const addressField = field.split('.')[1];
                return { ...order, address: { ...order.address, [addressField]: value } };
            }
            return { ...order, [field]: value };
        }));
    };

    // Cotizar envíos para todos los pedidos
    const handleQuote = async () => {
        setQuoting(true);
        const newQuotes: Record<string, Quote[]> = {};

        try {
            for (const order of orders) {
                if (!order.address?.zip) continue;

                const res = await fetch('/api/escuderia/quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        destinationZip: order.address.zip,
                        originZip: "76000",
                        weight: order.weight,
                        length: order.length,
                        width: order.width,
                        height: order.height,
                        destinationAddress: {
                            name: order.customer,
                            email: order.email,
                            phone: order.phone,
                            street: order.address.address1,
                            city: order.address.city,
                            state: order.address.province,
                            district: order.colonia
                        }
                    })
                });

                const data = await res.json();

                if (res.ok && Array.isArray(data)) {
                    newQuotes[order.id] = data;
                } else {
                    console.error(`Error en pedido #${order.name}:`, data.error, data.details);
                    const detailsStr = data.details?.map((d: any) => `${d.carrier}: ${d.error}`).join('\n') || '';
                    alert(`No se pudo cotizar #${order.name}:\n${data.error}\n\nDetalles:\n${detailsStr}`);
                }
            }
            setQuotes(newQuotes);
        } catch (error: any) {
            console.error('Error quoting:', error);
            alert('Error crítico al cotizar: ' + error.message);
        } finally {
            setQuoting(false);
        }
    };

    const handleSelectQuote = (orderId: string, quoteIdx: number) => {
        setSelectedQuotes(prev => ({
            ...prev,
            [orderId]: prev[orderId] === quoteIdx ? -1 : quoteIdx
        }));
    };

    const handleSelectAll = () => {
        if (selectedGlobal) {
            setSelectedQuotes({});
            setSelectedGlobal(false);
        } else {
            const newSelections: Record<string, number> = {};
            orders.forEach(order => {
                if (quotes[order.id]?.length > 0) {
                    newSelections[order.id] = 0;
                }
            });
            setSelectedQuotes(newSelections);
            setSelectedGlobal(true);
        }
    };

    const handleToggleRow = (orderId: string) => {
        setSelectedQuotes(prev => {
            const isSelected = prev[orderId] !== undefined && prev[orderId] !== -1;
            if (isSelected) {
                const next = { ...prev };
                delete next[orderId];
                return next;
            } else {
                return { ...prev, [orderId]: quotes[orderId]?.length > 0 ? 0 : -1 };
            }
        });
    };

    const handleGenerateReport = () => {
        if (orders.length === 0) return;

        // Detect sex from product title or variant text
        const getSexo = (title: string, variant: string) => {
            const text = `${title} ${variant}`.toLowerCase();
            const damaKeywords = ['dama', 'mujer', 'woman', 'female', 'ladies', 'niña'];
            return damaKeywords.some(kw => text.includes(kw)) ? 'DAMA' : 'CABALLERO';
        };

        let content = "";
        orders.forEach((order, index) => {
            order.items.forEach(item => {
                const rawVariant = (item.variant && item.variant !== 'Default Title') ? item.variant : '';
                const sexo = getSexo(item.title, rawVariant);

                // Variants can come as "Sexo / Talla" OR "Talla / Sexo"
                // Identify which segment is the sex word and discard it; keep the other as talla
                const SEX_WORDS = ['masculino', 'femenino', 'caballero', 'dama', 'hombre', 'mujer', 'niño', 'niña'];
                let talla = rawVariant;

                if (talla.includes(' / ')) {
                    const parts = talla.split(' / ').map(p => p.trim());
                    // Keep the part that is NOT a sex word
                    const sizePart = parts.find(p => !SEX_WORDS.includes(p.toLowerCase()));
                    talla = sizePart || parts[parts.length - 1];
                }

                // If talla ended up being a plain sex word (no " / " in variant), discard it
                if (!talla || SEX_WORDS.includes(talla.toLowerCase())) {
                    talla = 'S-T';
                }

                const cliente = order.customer || 'Sin nombre';
                const line = `${talla}__${sexo}__ESCUDERIA__${item.title}__${cliente}`;
                content += line + "\n";
            });
            // Blank line between orders
            if (index < orders.length - 1) {
                content += "\n";
            }
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = rangeMode === 'range'
            ? `Reporte_Escuderia_Rango_${daysRange}dias.txt`
            : `Reporte_Escuderia_${format(selectedDate, "dd_MM_yyyy")}.txt`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const productSummary = orders.reduce((acc: any, order) => {
        order.items.forEach(item => {
            if (!acc[item.title]) {
                acc[item.title] = { cantidad: 0, total: 0 };
            }
            acc[item.title].cantidad += item.quantity;
            acc[item.title].total += item.total;
        });
        return acc;
    }, {});

    const grandTotal = Object.values(productSummary).reduce((sum: number, item: any) => sum + item.total, 0);

    return (
        <div className="space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-50 flex items-center gap-2">
                        <Truck className="h-8 w-8 text-indigo-400" />
                        ESCUDERÍA
                    </h2>
                    <p className="text-slate-400 mt-1">Órdenes de Shopify y gestión de guías en tiempo real.</p>
                </div>
                <button
                    onClick={() => fetchOrders()}
                    disabled={loading}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-lg h-10 w-10 flex items-center justify-center hover:bg-slate-800 transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                    <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
                    <p className="text-slate-400 font-medium">Sincronizando con Shopify...</p>
                </div>
            ) : (
                <>
                    {/* Orders Table */}
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                            <button
                                onClick={() => handleFilterRange(7)}
                                className={`transition-colors ${rangeMode === 'range' && daysRange === 7 ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Ultimos 7 dias
                            </button>
                            <button
                                onClick={() => handleFilterRange(30)}
                                className={`transition-colors ${rangeMode === 'range' && daysRange === 30 ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Ultimos 30 dias
                            </button>
                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 ml-auto md:ml-0 shadow-xl ring-1 ring-white/5">
                                <ChevronLeft className="h-4 w-4 text-slate-500 cursor-pointer hover:text-white transition-colors" onClick={handlePrevDay} />
                                <span className="text-slate-200 min-w-[100px] text-center font-black uppercase text-[11px] tracking-wider">{getDateLabel()}</span>
                                <ChevronRight className="h-4 w-4 text-slate-500 cursor-pointer hover:text-white transition-colors" onClick={handleNextDay} />
                            </div>
                            <button
                                onClick={handleGenerateReport}
                                disabled={orders.length === 0}
                                className="bg-slate-50 text-slate-950 font-bold px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-lg disabled:opacity-50"
                            >
                                <FileText className="h-4 w-4" /> Hacer reporte
                            </button>
                        </div>

                        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4">Fecha</th>
                                            <th className="px-6 py-4">Pedido</th>
                                            <th className="px-6 py-4">Cliente</th>
                                            <th className="px-6 py-4">Productos</th>
                                            <th className="px-6 py-4 text-center">Cant</th>
                                            <th className="px-6 py-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No se encontraron órdenes pagadas para este periodo.</td>
                                            </tr>
                                        ) : orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                                                    {format(new Date(order.createdAt), "dd MMM, HH:mm", { locale: es })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/10 font-mono">#{order.name}</Badge>
                                                </td>
                                                <td className="px-6 py-4 text-slate-200 font-medium">{order.customer}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 group/item">
                                                                {item.image && (
                                                                    <img src={item.image} alt="" className="h-6 w-6 rounded bg-slate-800 object-cover border border-slate-700" />
                                                                )}
                                                                <div className="flex flex-col leading-none">
                                                                    <span className="text-slate-200 text-xs font-medium">{item.title}</span>
                                                                    {item.variant && item.variant !== 'Default Title' && (
                                                                        <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{item.variant}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-200 font-bold text-center">
                                                    {order.items.reduce((s, i) => s + i.quantity, 0)}
                                                </td>
                                                <td className="px-6 py-4 text-slate-200 font-bold text-right font-mono">${order.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {orders.length > 0 && (
                                <div className="bg-slate-950/50 border-t border-slate-800 p-6 flex justify-end">
                                    <div className="space-y-2 w-full max-w-xs">
                                        {Object.entries(productSummary).map(([title, data]: any) => (
                                            <div key={title} className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400 font-medium italic"><span className="text-slate-200 font-black mr-2 not-italic">{data.cantidad}</span>{title}</span>
                                                <span className="text-slate-300 font-mono">${data.total.toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
                                            <span className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Total Ventas</span>
                                            <span className="font-black text-emerald-400 text-xl font-mono">${grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Shipping Matrix */}
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${selectedGlobal ? 'bg-indigo-500 border-indigo-500' : 'border-slate-700 bg-slate-900 group-hover:border-slate-500'}`}>
                                        {selectedGlobal && <div className="w-2 h-2 bg-white rounded-sm" />}
                                    </div>
                                    <input type="checkbox" className="hidden" onChange={handleSelectAll} checked={selectedGlobal} />
                                    <span className="text-slate-300 text-sm font-bold">Seleccionar todo</span>
                                </label>
                                {quoting && <span className="text-[10px] text-indigo-400 font-black uppercase animate-pulse tracking-tighter">Buscando tarifas en tiempo real...</span>}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleQuote}
                                    disabled={quoting || orders.length === 0}
                                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Calculator className={`h-4 w-4 text-indigo-400 ${quoting ? 'animate-spin' : ''}`} /> Cotizar
                                </button>
                                <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                    <PackageCheck className="h-4 w-4" /> Hacer guías
                                </button>
                            </div>
                        </div>

                        <Card className="bg-slate-900 border-slate-800 overflow-hidden text-[10px]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-slate-950 text-slate-500 border-b border-slate-800 uppercase font-bold tracking-tighter shadow-sm">
                                        <tr>
                                            <th className="px-4 py-4 w-10"></th>
                                            <th className="px-4 py-4 sticky left-0 bg-slate-950 z-20">Pedido</th>
                                            <th className="px-3 py-4">Cliente</th>
                                            <th className="px-3 py-4">Calle</th>
                                            <th className="px-3 py-4">Colonia</th>
                                            <th className="px-3 py-4 text-center">CP</th>
                                            <th className="px-3 py-4">Municipio</th>
                                            <th className="px-3 py-4">Estado</th>
                                            <th className="px-2 py-4 text-center">Peso</th>
                                            <th className="px-2 py-4 text-center">L</th>
                                            <th className="px-2 py-4 text-center">A</th>
                                            <th className="px-2 py-4 text-center border-r border-slate-800/30">H</th>

                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <th key={i} className="px-3 py-4 text-center border-r border-slate-800/10 min-w-[110px] bg-slate-950/30">Opción {i + 1}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {orders.map((order) => {
                                            const orderQuotes = quotes[order.id] || [];
                                            const isRowSelected = selectedQuotes[order.id] !== undefined && selectedQuotes[order.id] !== -1;

                                            return (
                                                <tr key={order.id} onClick={() => handleToggleRow(order.id)} className={`transition-colors cursor-pointer ${isRowSelected ? 'bg-indigo-500/10' : 'hover:bg-slate-800/20'}`}>
                                                    <td className="px-4 py-3">
                                                        <div className={`w-4 h-4 rounded-sm border transition-all ${isRowSelected ? 'bg-indigo-500 border-indigo-400 shadow-sm' : 'border-slate-800 bg-slate-950'}`}>
                                                            {isRowSelected && <div className="w-1.5 h-1.5 bg-white mx-auto mt-0.5 rounded-xs" />}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 sticky left-0 z-10 bg-inherit font-black text-slate-100 border-r border-slate-800/50 shadow-sm">
                                                        #{order.name}
                                                    </td>
                                                    <td className="px-3 py-3 font-bold text-slate-200">{order.customer}</td>
                                                    <td className="px-2 py-2">
                                                        <input
                                                            type="text"
                                                            value={order.address?.address1 || ''}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => updateOrderField(order.id, 'address.address1', e.target.value)}
                                                            className="bg-slate-950/50 border border-slate-800 rounded px-2 py-1 text-slate-300 w-[120px] focus:border-indigo-500 outline-none transition-colors text-[10px]"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <input
                                                            type="text"
                                                            value={order.colonia || ''}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => updateOrderField(order.id, 'colonia', e.target.value)}
                                                            className="bg-slate-950/50 border border-slate-800 rounded px-2 py-1 text-slate-400 w-[100px] focus:border-indigo-500 outline-none transition-colors placeholder:text-slate-700 text-[10px]"
                                                            placeholder="Colonia"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <input
                                                            type="text"
                                                            value={order.address?.zip || ''}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => updateOrderField(order.id, 'address.zip', e.target.value)}
                                                            className="bg-slate-950/50 border border-indigo-900/30 rounded px-1 py-1 text-indigo-400 font-black text-center w-[50px] focus:border-indigo-500 outline-none transition-colors text-[10px]"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 text-slate-400">{order.address?.city}</td>
                                                    <td className="px-3 py-3 text-slate-500 font-medium">{order.address?.province}</td>

                                                    <td className="px-1 py-2 text-center text-[10px]">
                                                        <input
                                                            type="number"
                                                            value={order.weight}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => updateOrderField(order.id, 'weight', parseFloat(e.target.value) || 0)}
                                                            className="bg-slate-950 border border-slate-800 rounded w-10 py-1 text-center text-emerald-400 font-bold outline-none focus:border-emerald-500 text-[10px]"
                                                        />
                                                    </td>
                                                    <td className="px-1 py-2 text-center text-[10px]">
                                                        <input
                                                            type="number"
                                                            value={order.length}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => updateOrderField(order.id, 'length', parseInt(e.target.value) || 0)}
                                                            className="bg-slate-950 border border-slate-800 rounded w-10 py-1 text-center text-slate-400 outline-none focus:border-indigo-500 text-[10px]"
                                                        />
                                                    </td>
                                                    <td className="px-1 py-2 text-center text-[10px]">
                                                        <input
                                                            type="number"
                                                            value={order.width}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => updateOrderField(order.id, 'width', parseInt(e.target.value) || 0)}
                                                            className="bg-slate-950 border border-slate-800 rounded w-10 py-1 text-center text-slate-400 outline-none focus:border-indigo-500 text-[10px]"
                                                        />
                                                    </td>
                                                    <td className="px-1 py-2 text-center text-[10px] border-r border-slate-800/30">
                                                        <input
                                                            type="number"
                                                            value={order.height}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => updateOrderField(order.id, 'height', parseInt(e.target.value) || 0)}
                                                            className="bg-slate-950 border border-slate-800 rounded w-10 py-1 text-center text-slate-400 outline-none focus:border-indigo-500 text-[10px]"
                                                        />
                                                    </td>

                                                    {orderQuotes.length === 0 ? (
                                                        <td colSpan={3} className="px-3 py-3 text-center text-slate-700 italic text-[9px] tracking-widest font-bold">
                                                            {quoting ? 'COTIZANDO...' : 'SIN COTIZAR'}
                                                        </td>
                                                    ) : (
                                                        orderQuotes.slice(0, 3).map((q, idx) => {
                                                            const isSelected = selectedQuotes[order.id] === idx;
                                                            return (
                                                                <td key={idx} className="px-1 py-1 border-r border-slate-800/10">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSelectQuote(order.id, idx);
                                                                        }}
                                                                        className={`w-full group p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-400 shadow-lg' : 'bg-slate-950/50 border-slate-800/50 hover:border-slate-600'}`}
                                                                    >
                                                                        <span className={`text-[7px] font-black uppercase tracking-tighter ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>{q?.provider || 'Carrier'}</span>
                                                                        <span className={`text-[12px] font-black ${isSelected ? 'text-white' : 'text-slate-200'}`}>${q?.price || '-'}</span>
                                                                        <span className={`text-[7px] font-black italic uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-600'}`}>
                                                                            {q?.service ? `${q.service} (${q.days})` : (q?.days || 'Estándar')}
                                                                        </span>
                                                                    </button>
                                                                </td>
                                                            );
                                                        })
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
