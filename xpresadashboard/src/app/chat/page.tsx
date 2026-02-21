import Link from 'next/link';
import {
    MessageSquare,
    Brain,
    MapPin,
    Clock,
    Info,
    Settings,
    Sparkles,
    Save,
    Plus,
    Trash2,
    RefreshCcw,
    Zap,
    Bot,
    DollarSign
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KnowledgeItem } from "@/components/KnowledgeItem";
import { ManageKnowledgeModal } from "@/components/ManageKnowledgeModal";
import { BotKnowledge, Product } from "@/types/database";
import { BotMasterSwitch } from "@/components/BotMasterSwitch";
import { BotLogs } from "@/components/BotLogs";
import { ChatSimulator } from "@/components/ChatSimulator";

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
    const supabase = await createClient();

    // Fetch initial bot status
    const { data: settingsData } = await (supabase
        .from('global_settings')
        .select('value')
        .eq('key', 'bot_active')
        .single() as any);

    const botActive = settingsData?.value === true;

    // Fetch Knowledge base
    const { data: knowledgeData } = await supabase
        .from('bot_knowledge')
        .select('*')
        .order('category', { ascending: true });

    // Fetch Products to feed the simulator
    const { data: productsData } = await supabase
        .from('products')
        .select('*');

    // Fetch recent logs
    const { data: logsData } = await (supabase
        .from('bot_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10) as any);

    const knowledge = (knowledgeData as BotKnowledge[] | null) || [];
    const products = (productsData as Product[] | null) || [];
    const logs = logsData || [];

    const generalInfo = knowledge?.filter(k => k.category === 'general') || [];
    const faqs = knowledge?.filter(k => k.category === 'faq') || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                            <Bot className="h-5 w-5 text-indigo-400" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-50">Cerebro del Bot</h2>
                    </div>
                    <p className="text-slate-400">Entrena a tu IA de ManyChat con el conocimiento de Xpresa.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/chat/import"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl border border-indigo-500/20 transition-all text-xs font-black uppercase tracking-wider"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Sincronizar ManyChat
                    </Link>
                </div>
            </div>

            {/* Master Switch */}
            <BotMasterSwitch initialStatus={botActive} />

            {/* AI Simulator Laboratory */}
            <div className="space-y-4">
                <ChatSimulator
                    knowledge={knowledge || []}
                    products={products}
                />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Brain className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Conocimientos</p>
                            <p className="text-xl font-bold text-slate-50">{knowledge?.length || 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl">
                            <Sparkles className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Precisión IA</p>
                            <p className="text-xl font-bold text-slate-50">94%</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <Zap className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Tiempo Respuesta</p>
                            <p className="text-xl font-bold text-slate-50">~1.2s</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Knowledge Column */}
                <div className="xl:col-span-2 space-y-8">
                    {/* General Knowledge */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                <Info className="h-5 w-5 text-indigo-400" /> Información Base
                            </h3>
                            <ManageKnowledgeModal category="general" triggerText="Agregar Dato" />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {generalInfo.map((item) => (
                                <KnowledgeItem key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* FAQ Collection */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-indigo-400" /> Preguntas Frecuentes (FAQ)
                            </h3>
                            <ManageKnowledgeModal category="faq" triggerText="Nueva FAQ" />
                        </div>
                        <div className="space-y-4">
                            {faqs.map((item) => (
                                <KnowledgeItem key={item.id} item={item} isFaq />
                            ))}
                            {faqs.length === 0 && (
                                <div className="p-8 border border-dashed border-slate-800 bg-slate-900/30 rounded-2xl text-center">
                                    <p className="text-slate-500 text-sm italic">No hay FAQs registradas. La IA usará solo la información base.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Config */}
                <div className="space-y-8">
                    <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                        <CardHeader className="bg-slate-950/50 border-b border-slate-800">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-400" /> Comportamiento de IA
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 uppercase block leading-none mb-1">Nivel de Precio Sugerido</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold"
                                    defaultValue="price_2"
                                >
                                    <option value="price_1">Nivel 1 (Menudeo)</option>
                                    <option value="price_2">Nivel 2 (Mayoreo Sugerido)</option>
                                    <option value="price_3">Nivel 3</option>
                                    <option value="price_4">Nivel 4</option>
                                    <option value="price_5">Nivel 5 (Volumen)</option>
                                </select>
                                <p className="text-[10px] text-slate-500 leading-tight">El bot priorizará este nivel en preguntas generales de costo.</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 uppercase block">Temperatura de Respuesta</label>
                                <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                    <span>PRECISO</span>
                                    <span>CREATIVO</span>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-800 space-y-4">
                                <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all">
                                    Ver Logs de Chat
                                </button>
                                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-indigo-500/20">
                                    Guardar Configuración
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-indigo-600/10 border-indigo-500/20 border">
                        <CardContent className="p-6 space-y-4">
                            <h4 className="text-indigo-400 font-bold text-sm flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> Integración de Catálogo
                            </h4>
                            <p className="text-xs text-indigo-300 leading-relaxed">
                                Tu bot está conectado directamente a la base de datos de productos. Si cambias un precio en la pestaña **"Productos"**, la IA responderá el nuevo precio de inmediato.
                            </p>
                            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 font-bold text-[10px]">SINCRONIZACIÓN ACTIVA</Badge>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Live Activity Logs */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-400" /> Historial de Respuestas Recientes
                </h3>
                <BotLogs logs={logs} />
            </div>
        </div>
    );
}
