'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select, Card } from '@/components/ui';
import { ProductTable, ProductItem } from '@/components/orders';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import { useAuth } from '@/hooks';

const paymentOptions = [
    { value: 'proveedores', label: 'Proveedores' },
    { value: 'alex_banorte', label: 'Alex Banorte' },
    { value: 'xpresa_banregio', label: 'Xpresa_Banregio' },
    { value: 'xpresa_HSBC', label: 'Xpresa_HSBC' },
    { value: 'mercado_pago', label: 'Mercado_Pago' },
    { value: 'efectivo', label: 'Efectivo' }
];

export default function NuevoPedidoPage() {
    const router = useRouter();
    const supabase = getSupabaseClient();
    const { user } = useAuth();

    const [orderName, setOrderName] = useState('');
    const [paymentAccount, setPaymentAccount] = useState('');
    const [anticipo, setAnticipo] = useState<number>(0);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [items, setItems] = useState<ProductItem[]>([
        { id: '1', product_name: '', size: '', quantity: 1, unit_price: 0 },
    ]);

    const generateItemId = () => Math.random().toString(36).substr(2, 9);

    const handleAddItem = () => {
        setItems([...items, {
            id: generateItemId(),
            product_name: '',
            size: '',
            quantity: 1,
            unit_price: 0
        }]);
    };

    const handleUpdateItem = (id: string, updates: Partial<ProductItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const handleRemoveItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    const handleSubmit = async (action: 'register' | 'quote') => {
        if (!user) {
            setError('No hay sesión activa');
            return;
        }

        const validItems = items.filter(item => item.product_name && item.quantity > 0);

        if (validItems.length === 0) {
            setError('Agrega al menos un producto');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('Iniciando registro de pedido...', { action, items: validItems.length });

            // Create order
            const orderData = {
                vendedor_id: user.id,
                customer_name: orderName,
                payment_account: paymentAccount,
                anticipo: anticipo,
                total_amount: total,
                status: (action === 'quote' ? 'cotizado' : 'pendiente') as any,
                notes: notes ? `${notes}\n\n[Registrado por: ${user?.user_metadata?.full_name || 'Desconocido'}]` : `Registrado por: ${user?.user_metadata?.full_name || 'Desconocido'}`,
            };

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert(orderData)
                .select()
                .single();

            if (orderError) {
                console.error('Error al insertar pedido:', orderError);
                throw orderError;
            }

            const typedOrder = order as any;
            console.log('Pedido creado con éxito:', typedOrder.id);

            // Create order items
            const orderItems = validItems.map(item => ({
                order_id: typedOrder.id,
                product_name: item.product_name,
                size: item.size || null,
                quantity: item.quantity,
                unit_price: item.unit_price,
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems as any);

            if (itemsError) {
                console.error('Error al insertar productos:', itemsError);
                throw itemsError;
            }

            console.log('Productos registrados con éxito');

            // Redirect based on action
            if (action === 'quote') {
                router.push(`/cotizar/${typedOrder.id}`);
            } else {
                router.push(`/registrado?temp=${typedOrder.temp_id}`);
            }
        } catch (err) {
            console.error('Error completo en handleSubmit:', err);
            const msg = err instanceof Error ? err.message : 'Error al guardar el pedido';
            setError(msg);
            alert('ERROR: ' + msg); // Alert for visibility
        } finally {
            setIsLoading(false);
        }
    };

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
                    <h1 className="text-2xl font-bold text-text-primary">
                        NUEVO PEDIDO
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Registra un nuevo pedido de productos textiles
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <Card className="p-6">
                <div className="space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nombre del pedido"
                            placeholder="Playeras polo gallito"
                            value={orderName}
                            onChange={(e) => setOrderName(e.target.value)}
                        />
                        <Input
                            label="Vendedor"
                            value={user?.user_metadata?.full_name || 'Cargando...'}
                            disabled
                            className="bg-background-tertiary/50 opacity-70"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Cuenta de pago"
                            options={paymentOptions}
                            value={paymentAccount}
                            onChange={(e) => setPaymentAccount(e.target.value)}
                            placeholder="Seleccionar cuenta"
                        />
                        <Input
                            label="Anticipo/Total"
                            type="number"
                            min="0"
                            step="0.01"
                            value={anticipo}
                            onChange={(e) => setAnticipo(parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-xs uppercase text-text-muted font-bold mb-1 block">Notas / Especificaciones</label>
                            <textarea
                                className="w-full bg-background-tertiary border border-card-border rounded-xl p-4 text-text-primary focus:outline-none focus:border-accent min-h-[100px] text-sm transition-colors"
                                placeholder="Escribe aquí detalles adicionales, especificaciones de diseño, etc."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-card-border pt-6">
                        <ProductTable
                            items={items}
                            onAdd={handleAddItem}
                            onUpdate={handleUpdateItem}
                            onRemove={handleRemoveItem}
                        />
                    </div>

                    {/* Total Display */}
                    <div className="flex justify-end pt-4 border-t border-card-border">
                        <div className="text-right">
                            <span className="text-text-secondary text-sm">Total:</span>
                            <div className="text-2xl font-bold text-accent">
                                {formatCurrency(total)}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => handleSubmit('quote')}
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            <FileText size={18} className="mr-2" />
                            Cotizar
                        </Button>
                        <Button
                            onClick={() => handleSubmit('register')}
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            <Save size={18} className="mr-2" />
                            Registrar
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
