'use client';

import React from 'react';
import { OrderStatus } from '@/types/database';

interface OrderFilterProps {
    activeStatus: OrderStatus | 'all';
    onStatusChange: (status: OrderStatus | 'all') => void;
    counts?: {
        all: number;
        pendiente: number;
        cotizado: number;
        pagado: number;
        enviado: number;
    };
}

const filters: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Pedidos' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'cotizado', label: 'Cotizados' },
    { value: 'enviado', label: 'Enviados' },
];

export function OrderFilter({ activeStatus, onStatusChange, counts }: OrderFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => onStatusChange(filter.value)}
                    className={`filter-tab ${activeStatus === filter.value ? 'active' : ''
                        }`}
                >
                    {filter.label}
                    {counts && (
                        <span className="ml-1.5 text-xs opacity-70">
                            ({counts[filter.value as keyof typeof counts] || 0})
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

export default OrderFilter;
