'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks';
import { Order, OrderItem } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generatePrevioPDF } from '@/lib/pdf-generator';
import { ArrowLeft, FileText, Save, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function PedidoDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;
    const supabase = getSupabaseClient();
    const { profile } = useAuth();

    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    // Editable fields
    const [calcetasColor, setCalcetasColor] = useState('');
    const [regaloDetalle, setRegaloDetalle] = useState('');
    const [shippingGuide, setShippingGuide] = useState('');
    const [shippingCarrier, setShippingCarrier] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (orderError) throw orderError;
                const typedData = orderData as any;
                setOrder(typedData);
                setCalcetasColor(typedData.calcetas_color || '');
                setRegaloDetalle(typedData.regalo_detalle || '');
                setShippingGuide(typedData.shipping_guide || '');
                setShippingCarrier(typedData.shipping_carrier || '');
                setNotes(typedData.notes || '');

                const { data: itemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select('*')
                    .eq('order_id', orderId);

                if (itemsError) throw itemsError;
                setItems(itemsData || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar pedido');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, supabase]);

    const isFootballOrder = items.some(item => {
        const name = (item.product_name || '').toLowerCase();
        return name.includes('uniforme futbol') || name.includes('uniforme de futbol');
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (!file || !order) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${order.id}-${side}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('order-images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('order-images')
                .getPublicUrl(fileName);

            const updates: any = {};
            if (side === 'front') {
                updates.image_url = publicUrl;
            } else {
                updates.image_back_url = publicUrl;
            }

            // Si el pedido no tiene número de previo, lo generamos ahora
            if (!order.previo_number) {
                const { data: maxOrder } = await (supabase.from('orders') as any)
                    .select('previo_number')
                    .not('previo_number', 'is', null)
                    .order('previo_number', { ascending: false })
                    .limit(1);

                const nextNumber = (maxOrder?.[0]?.previo_number || 0) + 1;
                updates.previo_number = nextNumber;
            }

            const { error: updateError } = await (supabase.from('orders') as any)
                .update(updates)
                .eq('id', order.id);

            if (updateError) throw updateError;

            setOrder({ ...order, ...updates });
        } catch (err) {
            console.error('Error al subir imagen:', err);
            setError(err instanceof Error ? err.message : 'Error al subir imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!order) return;

        setIsSaving(true);
        setError('');

        try {
            const updates: any = {
                calcetas_color: calcetasColor,
                regalo_detalle: regaloDetalle,
                shipping_guide: shippingGuide,
                shipping_carrier: shippingCarrier,
                notes: notes,
            };

            // Lógica: Si hay guía y paquetería, el pedido sube a "Enviados" y se asigna 5% de comisión
            if (shippingGuide && shippingCarrier) {
                updates.status = 'enviado' as any;
                updates.commission_earned = order.total_amount * 0.05;
                console.log('Pedido finalizado y enviado: asignando comisión del 5%', updates.commission_earned);
            }

            const { error: updateError } = await (supabase.from('orders') as any)
                .update(updates)
                .eq('id', order.id);

            if (updateError) throw updateError;

            // Refresh order data to get updated commission/status
            const { data: updatedOrder } = await supabase
                .from('orders')
                .select('*')
                .eq('id', order.id)
                .single();

            if (updatedOrder) {
                setOrder(updatedOrder);
            }

            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGeneratePrevio = async () => {
        if (order && items.length > 0) {
            // Prefer current logged in user, fallback to registration metadata
            const profileName = profile?.full_name;
            const metaName = order.notes?.match(/\[Registrado por: (.*?)\]/)?.[1];
            const vendedorName = profileName || metaName || 'Vendedor';

            await generatePrevioPDF(order, items, vendedorName);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <p className="text-text-secondary">Pedido no encontrado</p>
                <Button onClick={() => router.push('/dashboard')} className="mt-4">
                    Volver al inicio
                </Button>
            </div>
        );
    }

    const displayNumber = order.previo_number
        ? `Previo${order.previo_number}`
        : `Temp ${order.temp_id}`;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} className="text-text-secondary" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-accent">
                        {displayNumber}
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Fecha: {formatDate(order.created_at)}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Section */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                        Imágenes del Producto
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Front Side */}
                        <div className="space-y-3">
                            <label className="text-xs uppercase text-text-muted font-bold block text-center">Frente</label>
                            <div className="aspect-square rounded-xl overflow-hidden bg-background-tertiary relative border border-card-border">
                                {order.image_url ? (
                                    <Image
                                        src={order.image_url.replace('api.xpresa.com.mx', 'api1.xpresa.com.mx')}
                                        alt="Frente"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                                        <ImageIcon size={32} className="mb-2 opacity-30" />
                                        <span className="text-[10px]">Sin imagen</span>
                                    </div>
                                )}
                            </div>
                            <label className="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer py-2 text-xs h-auto">
                                <Upload size={14} />
                                {isUploading ? '...' : 'Subir Frente'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'front')}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Back Side */}
                        <div className="space-y-3">
                            <label className="text-xs uppercase text-text-muted font-bold block text-center">Espalda</label>
                            <div className="aspect-square rounded-xl overflow-hidden bg-background-tertiary relative border border-card-border">
                                {order.image_back_url ? (
                                    <Image
                                        src={order.image_back_url.replace('api.xpresa.com.mx', 'api1.xpresa.com.mx')}
                                        alt="Espalda"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                                        <ImageIcon size={32} className="mb-2 opacity-30" />
                                        <span className="text-[10px]">Sin imagen</span>
                                    </div>
                                )}
                            </div>
                            <label className="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer py-2 text-xs h-auto">
                                <Upload size={14} />
                                {isUploading ? '...' : 'Subir Espalda'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'back')}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Order Details */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                        Detalles del Pedido
                    </h3>

                    {/* Products Table */}
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-card-border">
                                    <th className="text-left py-3 px-2 text-text-secondary font-bold uppercase text-[10px] tracking-wider">Talla</th>
                                    <th className="text-center py-3 px-4 text-text-secondary font-bold uppercase text-[10px] tracking-wider">Cant.</th>
                                    <th className="text-left py-3 px-2 text-text-secondary font-bold uppercase text-[10px] tracking-wider">Producto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-b border-card-border/30 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-2 text-text-primary font-bold">{item.size?.toUpperCase() || '-'}</td>
                                        <td className="py-3 px-4 text-text-primary text-center font-medium bg-background-tertiary/30 rounded-lg">{item.quantity}</td>
                                        <td className="py-3 px-4 text-text-primary capitalize">{item.product_name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Editable Fields */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {isFootballOrder && (
                            <>
                                <Input
                                    label="Color de calcetas"
                                    placeholder="Negras"
                                    value={calcetasColor}
                                    onChange={(e) => setCalcetasColor(e.target.value)}
                                />
                                <Input
                                    label="Regalo"
                                    placeholder="Calcetas"
                                    value={regaloDetalle}
                                    onChange={(e) => setRegaloDetalle(e.target.value)}
                                />
                            </>
                        )}
                        <Input
                            label="Guía"
                            placeholder="Número de guía"
                            value={shippingGuide}
                            onChange={(e) => setShippingGuide(e.target.value)}
                        />
                        <Input
                            label="Paquetería"
                            placeholder="Fedex, DHL, etc."
                            value={shippingCarrier}
                            onChange={(e) => setShippingCarrier(e.target.value)}
                        />
                    </div>

                    {/* Notes Field */}
                    <div className="mb-6">
                        <label className="text-xs uppercase text-text-muted font-bold mb-1 block">Notas / Especificaciones</label>
                        <textarea
                            className="w-full bg-background-tertiary border border-card-border rounded-xl p-4 text-text-primary focus:outline-none focus:border-accent min-h-[120px] text-sm transition-colors"
                            placeholder="Especificaciones adicionales..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Commission Display */}
                    {order.commission_earned > 0 && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                            <div className="text-sm text-green-400">Comisión (5%)</div>
                            <div className="text-xl font-bold text-green-400">
                                {formatCurrency(order.commission_earned)}
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className="text-right mb-6">
                        <span className="text-text-secondary">Total: </span>
                        <span className="text-xl font-bold text-accent">
                            {formatCurrency(order.total_amount)}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleGeneratePrevio}
                            disabled={items.length === 0}
                        >
                            <FileText size={18} className="mr-2" />
                            Previo
                        </Button>
                        <Button
                            onClick={handleSave}
                            isLoading={isSaving}
                        >
                            <Save size={18} className="mr-2" />
                            Guardar
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
