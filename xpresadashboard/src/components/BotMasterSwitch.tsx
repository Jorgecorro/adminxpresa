'use client';

import { useState, useEffect } from 'react';
import { Power, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface BotMasterSwitchProps {
    initialStatus: boolean;
}

export function BotMasterSwitch({ initialStatus }: BotMasterSwitchProps) {
    const [isActive, setIsActive] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const toggleBot = async () => {
        setLoading(true);
        try {
            const newStatus = !isActive;
            const { error } = await (supabase
                .from('global_settings') as any)
                .upsert({ key: 'bot_active', value: newStatus }, { onConflict: 'key' });

            if (error) throw error;
            setIsActive(newStatus);
        } catch (error) {
            console.error('Error toggling bot status:', error);
            alert('Error al cambiar el estado del bot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`p-6 rounded-3xl border transition-all duration-500 ${isActive
            ? 'bg-emerald-500/10 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
            : 'bg-red-500/10 border-red-500/20 shadow-lg shadow-red-500/5'
            }`}>
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-colors duration-500 ${isActive ? 'bg-emerald-500/20' : 'bg-red-500/20'
                        }`}>
                        {isActive ? (
                            <ShieldCheck className="h-6 w-6 text-emerald-400" />
                        ) : (
                            <ShieldAlert className="h-6 w-6 text-red-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-50 flex items-center gap-2">
                            Estado Maestro del Bot
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest ${isActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                {isActive ? 'Activo' : 'Apagado'}
                            </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {isActive
                                ? 'El bot está respondiendo en WhatsApp e Instagram usando tu base de conocimientos.'
                                : 'La IA está pausada. Todos los mensajes deben ser contestados manualmente.'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={toggleBot}
                    disabled={loading}
                    className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${isActive ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                >
                    <span className="sr-only">Toggle Bot</span>
                    <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-white transition-all duration-300 shadow-sm ${isActive ? 'translate-x-11' : 'translate-x-1'
                            }`}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                        ) : (
                            <Power className={`h-4 w-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}
