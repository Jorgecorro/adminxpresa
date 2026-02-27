'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Order } from '@/types/database';
import { daysSince, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Clock, FileImage } from 'lucide-react';

interface OrderCardProps {
    order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
    const days = daysSince(order.created_at);
    const displayNumber = order.previo_number
        ? `Previo${order.previo_number}`
        : `Temp ${order.temp_id}`;

    return (
        <Link href={`/pedido/${order.id}`}>
            <div className="card hover animate-fade-in group">
                {/* Image Container */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-background-tertiary mb-3">
                    {order.image_url ? (
                        <Image
                            src={order.image_url.replace('api.xpresa.com.mx', 'api1.xpresa.com.mx')}
                            alt={displayNumber}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                            <FileImage size={40} className="mb-2 opacity-50" />
                            <span className="text-xs">Sin imagen</span>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 status-badge ${getStatusColor(order.status)} text-white`}>
                        {getStatusLabel(order.status)}
                    </div>
                </div>

                {/* Order Info */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-text-primary text-sm truncate">
                            {displayNumber}
                        </h3>
                        <div className="flex items-center gap-1 text-text-muted text-xs">
                            <Clock size={12} />
                            <span>{days} día{days !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {order.customer_name && (
                        <p className="text-text-secondary text-xs truncate">
                            {order.customer_name}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default OrderCard;
