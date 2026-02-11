'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Order, OrderItem } from '@/types/database';
import { formatCurrency } from '@/lib/utils';
import { generateQuotationPDF } from '@/lib/pdf-generator';
import { ArrowLeft, FileDown, Loader2 } from 'lucide-react';

export default function CotizarPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;
    const supabase = getSupabaseClient();

    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Quotation fields
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [notes, setNotes] = useState('Tiempo de entrega 6 días hábiles');
    const [quoteNumber, setQuoteNumber] = useState(0);

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
                setClientName(typedData.customer_name || '');
                setClientEmail(typedData.customer_email || '');

                // Generate quote number based on order count
                const { count } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'cotizado');

                setQuoteNumber((count || 0) + 100);

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

    const handleGenerateQuotation = async () => {
        if (!order) return;

        try {
            // Update order with client info
            await (supabase.from('orders') as any)
                .update({
                    customer_name: clientName,
                    customer_email: clientEmail,
                    notes: notes,
                    status: 'cotizado',
                } as any)
                .eq('id', order.id);

            // Generate PDF
            await generateQuotationPDF({
                quoteNumber,
                clientName,
                clientEmail,
                notes,
                items,
                total: order.total_amount,
                date: new Date(),
            });

            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al generar cotización');
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

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} className="text-text-secondary" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">
                        Cotización
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Genera una cotización para el cliente
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <Card className="p-6">
                {/* Quote Number Display */}
                <div className="text-center mb-8">
                    <div className="text-4xl font-bold text-accent">
                        Cotización {quoteNumber}
                    </div>
                </div>

                {/* Client Info */}
                <div className="space-y-4 mb-8">
                    <Input
                        label="Nombre del Cliente"
                        placeholder="Jose Juan Jimenez"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                    />
                    <Input
                        label="Correo del cliente"
                        type="email"
                        placeholder="correo@empresa.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                    />
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Notas
                        </label>
                        <textarea
                            className="w-full bg-background-secondary text-text-primary border border-card-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent placeholder:text-text-muted transition-all duration-200 min-h-[100px] resize-none"
                            placeholder="Notas adicionales..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                {/* Products Summary */}
                <div className="border-t border-card-border pt-6 mb-6">
                    <h3 className="text-sm font-medium text-text-secondary mb-4">Resumen de productos</h3>
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-text-primary">
                                    {item.product_name} ({item.size || 'N/A'}) x{item.quantity}
                                </span>
                                <span className="text-text-secondary">
                                    {formatCurrency(item.subtotal)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 pt-4 border-t border-card-border">
                        <span className="font-semibold text-text-primary">Total</span>
                        <span className="font-bold text-accent text-lg">
                            {formatCurrency(order.total_amount)}
                        </span>
                    </div>
                </div>

                {/* Generate Button */}
                <Button
                    onClick={handleGenerateQuotation}
                    className="w-full"
                    size="lg"
                >
                    <FileDown size={20} className="mr-2" />
                    GENERAR COTIZACIÓN
                </Button>
            </Card>
        </div>
    );
}
