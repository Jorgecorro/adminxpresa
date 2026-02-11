'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { CheckCircle, Home } from 'lucide-react';

export default function RegistradoPage() {
    const searchParams = useSearchParams();
    const tempId = searchParams.get('temp');
    const router = useRouter();

    return (
        <div className="max-w-xl mx-auto text-center py-16 animate-fade-in">
            {/* Success Icon */}
            <div className="inline-block p-4 rounded-full bg-green-500/20 border border-green-500/30 mb-6 animate-pulse-glow">
                <CheckCircle className="w-16 h-16 text-green-400" />
            </div>

            {/* Message */}
            <h1 className="text-2xl font-bold text-text-primary mb-2">
                REGISTRADO
            </h1>
            <p className="text-text-secondary mb-6">
                Se registró el pedido, agrega la imagen del previo para obtener el número de previo, podrás encontrarlo en Pendientes como:
            </p>

            {/* Temp ID */}
            <div className="bg-card rounded-2xl border border-card-border p-8 mb-8">
                <div className="text-5xl font-bold text-accent">
                    Temp {tempId || '?'}
                </div>
            </div>

            {/* Actions */}
            <Button onClick={() => router.push('/dashboard')} size="lg">
                <Home size={20} className="mr-2" />
                INICIO
            </Button>
        </div>
    );
}
