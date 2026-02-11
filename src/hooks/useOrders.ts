'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Order, OrderStatus } from '@/types/database';

interface UseOrdersOptions {
    status?: OrderStatus | 'all';
}

interface UseOrdersReturn {
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    counts: {
        all: number;
        pendiente: number;
        cotizado: number;
        pagado: number;
        enviado: number;
    };
    refetch: () => Promise<void>;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
    const { status = 'all' } = options;
    const [orders, setOrders] = useState<Order[]>([]);
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = getSupabaseClient();

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw fetchError;
            }

            setAllOrders(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Filter based on status
    useEffect(() => {
        let filtered = [...allOrders];

        if (status === 'all') {
            // "Pedidos" tab: have photo AND are still in 'pendiente' status
            filtered = allOrders.filter(o => o.previo_number !== null && o.status === 'pendiente');
        } else if (status === 'pendiente') {
            // "Pendientes" tab: no photo yet (regardless of status, though usually they are pendiente)
            filtered = allOrders.filter(o => o.previo_number === null);
        } else {
            // Other tabs: filter by status normally (cotizado, enviado, etc.)
            filtered = allOrders.filter(o => o.status === status);
        }

        setOrders(filtered);
    }, [status, allOrders]);

    const counts = {
        all: allOrders.filter(o => o.previo_number !== null && o.status === 'pendiente').length,
        pendiente: allOrders.filter(o => o.previo_number === null).length,
        cotizado: allOrders.filter(o => o.status === 'cotizado').length,
        pagado: allOrders.filter(o => o.status === 'pagado').length,
        enviado: allOrders.filter(o => o.status === 'enviado').length,
    };

    return {
        orders,
        isLoading,
        error,
        counts,
        refetch: fetchOrders,
    };
}

export default useOrders;
