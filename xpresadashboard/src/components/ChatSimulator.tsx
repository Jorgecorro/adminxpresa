'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Send as SendIcon,
    Bot as BotIcon,
    Sparkles as SparklesIcon,
    Loader2 as Loader2Icon,
    User as UserIcon,
    Brain as BrainIcon,
    MessageCircle as MsgIcon,
    Zap as ZapIcon,
    Trash2
} from "lucide-react";
import { BotKnowledge, Product } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { getBotResponse } from "@/lib/bot-engine";

interface ChatSimulatorProps {
    knowledge: BotKnowledge[];
    products: Product[];
}

export function ChatSimulator({ knowledge, products }: ChatSimulatorProps) {
    const [question, setQuestion] = useState("");
    const [isSimulating, setIsSimulating] = useState(false);
    const [history, setHistory] = useState<{ role: 'user' | 'bot', content: string, source?: string }[]>([]);
    const [lastContext, setLastContext] = useState<Product | null>(null);

    const simulateBot = async () => {
        if (!question.trim()) return;

        const currentQuestion = question;
        setQuestion("");
        setIsSimulating(true);

        // Agregar pregunta al historial
        setHistory(prev => [...prev, { role: 'user', content: currentQuestion }]);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = getBotResponse(
            currentQuestion,
            history,
            knowledge,
            products,
            lastContext || undefined
        );

        if (result.detectedProduct) {
            setLastContext(result.detectedProduct);
        }

        if (result.response === "SILENT_THRESHOLD") {
            setHistory(prev => [...prev, { role: 'bot', content: "SYSTEM_SILENT: Intervención humana requerida." }]);
        } else {
            setHistory(prev => [...prev, { role: 'bot', content: result.response, source: result.source }]);
        }

        setIsSimulating(false);
    };

    return (
        <Card className="bg-slate-900 border-indigo-500/20 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <SparklesIcon className="h-24 w-24 text-indigo-400" />
            </div>

            <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/10 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                            <ZapIcon className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-100 uppercase tracking-tight">Chat de Prueba con Memoria</CardTitle>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Simulando contexto real de ManyChat</p>
                        </div>
                    </div>
                    {lastContext && (
                        <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 text-[9px] font-black uppercase">
                            Tema: {lastContext.name}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-[400px]">
                {/* Chat History Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {history.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <MsgIcon className="h-12 w-12 mb-2" />
                            <p className="text-xs font-bold uppercase tracking-widest">Inicia una conversación</p>
                        </div>
                    )}
                    {history.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm relative ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : msg.content.startsWith('SYSTEM_SILENT')
                                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200 italic rounded-tl-none'
                                    : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none shadow-lg'
                                }`}>
                                {msg.content.startsWith('SYSTEM_SILENT') ? (
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="h-3 w-3" />
                                        <span>El bot no tiene información. Esperando a un humano...</span>
                                    </div>
                                ) : msg.content}

                                {msg.source && (
                                    <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center gap-1.5 opacity-50">
                                        <BrainIcon className="h-3 w-3" />
                                        <span className="text-[9px] font-black uppercase tracking-tighter">{msg.source}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isSimulating && (
                        <div className="flex justify-start animate-pulse">
                            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none">
                                <Loader2Icon className="h-4 w-4 animate-spin text-indigo-400" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                    <div className="relative">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && simulateBot()}
                            placeholder="Escribe tu mensaje..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                        />
                        <button
                            onClick={simulateBot}
                            disabled={isSimulating}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-white transition-colors"
                        >
                            <SendIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="mt-2 flex gap-4">
                        <button onClick={() => { setHistory([]); setLastContext(null); }} className="text-[9px] font-bold text-slate-600 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-1">
                            <Trash2 className="h-3 w-3" /> Reiniciar Chat
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
