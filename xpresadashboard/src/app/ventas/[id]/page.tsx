import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Calendar,
    User,
    CreditCard,
    Image as ImageIcon,
    FileText,
    Clock,
    MapPin,
    Tag,
    Package,
    Truck
} from "lucide-react";
import Link from "next/link";
import { Order } from "@/types/database";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch order details with items and seller
    const { data: orderData, error } = await supabase
        .from('orders')
        .select(`
      *,
      vendedor:profiles(full_name),
      order_items(*)
    `)
        .eq('id', id)
        .single();

    if (error || !orderData) {
        notFound();
    }

    const order = orderData as any; // Using any for quick access to joined data

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
            {/* Back button and title */}
            <div className="flex flex-col gap-4">
                <Link
                    href="/ventas"
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors group w-fit"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Volver a Ventas
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-50 flex items-center gap-3">
                            Orden #{order.temp_id || order.id.slice(0, 8)}
                            {getStatusBadge(order.status)}
                        </h2>
                        <p className="text-slate-400 mt-1">Detalles completos del pedido e información de pago.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Fecha de Creación</p>
                        <p className="text-slate-200 font-medium">{new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Info Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                    <User className="h-4 w-4 text-indigo-400" /> Información del Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-bold text-slate-200">{order.customer_name || 'Particular'}</p>
                                <p className="text-sm text-slate-500">{order.customer_email || 'Sin correo registrado'}</p>
                                <div className="mt-4 pt-4 border-t border-slate-800/50">
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Vendedor Asignado</p>
                                    <p className="text-sm text-slate-400">{order.vendedor?.full_name || 'Vendedor del sistema'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-emerald-400" /> Información de Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Cuenta de Pago</p>
                                        <p className="text-base font-semibold text-emerald-400">{order.payment_account || 'No especificada'}</p>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-slate-800/50 pt-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Anticipo</p>
                                            <p className="text-sm text-slate-300 font-medium">{formatter.format(order.anticipo || 0)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Total de Orden</p>
                                            <p className="text-xl font-bold text-slate-50">{formatter.format(order.total_amount || 0)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Products Summary Card */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                <Package className="h-5 w-5 text-indigo-400" /> Productos del Pedido
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            <th className="pb-4">Producto</th>
                                            <th className="pb-4">Talla</th>
                                            <th className="pb-4 text-center">Cant.</th>
                                            <th className="pb-4 text-right">Unitario</th>
                                            <th className="pb-4 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {order.order_items?.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="py-4 text-sm font-medium text-slate-300">{item.product_name}</td>
                                                <td className="py-4 text-sm text-slate-500">{item.size || '-'}</td>
                                                <td className="py-4 text-sm text-slate-400 text-center">{item.quantity}</td>
                                                <td className="py-4 text-sm text-slate-400 text-right">{formatter.format(item.unit_price)}</td>
                                                <td className="py-4 text-sm font-bold text-slate-200 text-right">{formatter.format(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes Card */}
                    {order.notes && (
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-amber-400" /> Notas y Observaciones
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-amber-500/50 pl-4 py-1">
                                    "{order.notes}"
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Logistics Card */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                <Truck className="h-4 w-4 text-blue-400" /> Información de Logística
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Paquetería</p>
                                    <p className="text-sm text-slate-300 font-medium">{order.shipping_carrier || 'Pendiente de asignar'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Guía de rastreo</p>
                                    <p className="text-sm text-indigo-400 font-bold tracking-widest">{order.shipping_guide || 'Aún no generada'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column: Photos & Summary */}
                <div className="space-y-8">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-purple-400" /> Galería de Pedido
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Frente / Diseño</p>
                                {order.image_url ? (
                                    <img
                                        src={order.image_url}
                                        alt="Frente del producto"
                                        className="w-full aspect-[4/3] object-cover rounded-xl border border-slate-800 hover:scale-[1.02] transition-transform cursor-pointer shadow-lg"
                                    />
                                ) : (
                                    <div className="w-full aspect-[4/3] bg-slate-950/50 border border-dashed border-slate-800 rounded-xl flex items-center justify-center">
                                        <p className="text-xs text-slate-600 italic">No hay foto frontal</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Detalle / Referencia</p>
                                {order.image_back_url ? (
                                    <img
                                        src={order.image_back_url}
                                        alt="Reverso o detalle del producto"
                                        className="w-full aspect-[4/3] object-cover rounded-xl border border-slate-800 hover:scale-[1.02] transition-transform cursor-pointer shadow-lg"
                                    />
                                ) : (
                                    <div className="w-full aspect-[4/3] bg-slate-950/50 border border-dashed border-slate-800 rounded-xl flex items-center justify-center">
                                        <p className="text-xs text-slate-600 italic">No hay foto trasera</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Tag className="h-24 w-24 text-indigo-500 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Comisión Generada</p>
                            <p className="text-3xl font-black text-white">{formatter.format(order.commission_earned || 0)}</p>
                            <p className="text-[10px] text-indigo-300/70 mt-3 leading-tight">Ganancia acumulada por este vendedor según las políticas de comisión vigentes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
