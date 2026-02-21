'use client';

import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { ReactNode } from 'react';

interface OrderRowProps {
    orderId: string;
    children: ReactNode;
}

export function OrderRow({ orderId, children }: OrderRowProps) {
    const router = useRouter();

    return (
        <tr
            className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
            onClick={() => router.push(`/ventas/${orderId}`)}
        >
            {children}
        </tr>
    );
}

export function OrderAction({ orderId }: { orderId: string }) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/ventas/${orderId}`;
            }}
            className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all inline-block"
        >
            <FileText className="h-4 w-4" />
        </button>
    );
}
