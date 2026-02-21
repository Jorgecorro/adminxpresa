'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Instagram, Phone, Clock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BotLog {
    id: string;
    user_info: string | null;
    platform: string | null;
    question: string | null;
    response: string | null;
    confidence: number | null;
    created_at: string;
}

interface BotLogsProps {
    logs: BotLog[];
}

export function BotLogs({ logs }: BotLogsProps) {
    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="bg-slate-950/30 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-400" /> Registro de Actividad IA
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 font-medium">Últimas 50 respuestas generadas por el bot.</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-1">
                        Auditoría en Tiempo Real
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-800">
                    {logs.length === 0 ? (
                        <div className="p-12 text-center">
                            <MessageCircle className="h-12 w-12 text-slate-700 mx-auto mb-4 opacity-20" />
                            <p className="text-slate-500 text-sm font-medium">Aún no hay registros de actividad del bot.</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="p-6 hover:bg-slate-800/30 transition-colors group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800">
                                            {log.platform === 'instagram' ? (
                                                <Instagram className="h-5 w-5 text-pink-500" />
                                            ) : (
                                                <Phone className="h-5 w-5 text-emerald-500" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-200">
                                                    {log.user_info || 'Usuario Desconocido'}
                                                </span>
                                                <Badge variant="outline" className="text-[9px] uppercase font-black py-0 px-1.5 border-slate-700 text-slate-500">
                                                    {log.platform}
                                                </Badge>
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                {format(new Date(log.created_at), "d MMM, HH:mm", { locale: es })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                                        <div className={`h-1.5 w-1.5 rounded-full ${(log.confidence || 0) > 0.9 ? 'bg-emerald-500' : 'bg-yellow-500'
                                            }`} />
                                        <span className="text-[10px] font-black text-slate-400">
                                            {Math.round((log.confidence || 0) * 100)}% Confianza
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 pl-13">
                                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase mb-1 tracking-widest">Pregunta del Cliente:</p>
                                        <p className="text-sm text-slate-300 italic">"{log.question}"</p>
                                    </div>

                                    <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Respuesta de IA:</p>
                                            {(log.confidence || 0) > 0.9 ?
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> :
                                                <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                                            }
                                        </div>
                                        <p className="text-sm text-slate-200 leading-relaxed font-medium">
                                            {log.response}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
