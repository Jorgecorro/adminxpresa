
import { createClient } from "@/utils/supabase/server";
import { fetchManyChatFlows, fetchManyChatCustomFields, fetchManyChatBotFields } from "@/lib/manychat";
import { BotFieldsImporter } from "@/components/BotFieldsImporter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    ArrowLeft,
    Bot,
    RefreshCcw,
    CheckCircle2,
    AlertCircle,
    Link2,
    Database,
    Sparkles
} from "lucide-react";
import Link from "next/link";

const MANYCHAT_API_URL = 'https://api.manychat.com';

async function fetchPageInfo() {
    const token = process.env.MANYCHAT_API_TOKEN;
    const res = await fetch(`${MANYCHAT_API_URL}/fb/page/getInfo`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();
    return result.data;
}

export default async function ManyChatImportPage() {
    let flows: any[] = [];
    let fields: any[] = [];
    let botFields: any[] = [];
    let pageInfo: any = null;
    let error = null;

    try {
        const [flowsData, fieldsData, botFieldsData, info] = await Promise.all([
            fetchManyChatFlows(),
            fetchManyChatCustomFields(),
            fetchManyChatBotFields(),
            fetchPageInfo()
        ]);
        flows = Array.isArray(flowsData) ? flowsData : [];
        fields = Array.isArray(fieldsData) ? fieldsData : [];
        botFields = Array.isArray(botFieldsData) ? botFieldsData : [];
        pageInfo = info;
    } catch (e: any) {
        console.error(e);
        error = e.message;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link href="/chat" className="text-xs font-bold text-slate-500 hover:text-indigo-400 flex items-center gap-1 mb-2 transition-colors">
                        <ArrowLeft className="h-3 w-3" /> Regresar al Cerebro
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                            <Download className="h-5 w-5 text-indigo-400" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-50">Importar desde ManyChat</h2>
                    </div>
                    <p className="text-slate-400">Sincroniza tus automatizaciones actuales con el cerebro de tu IA.</p>
                </div>

                {!error && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-500/20">
                        <Link2 className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-wider">
                            {pageInfo?.name || 'API Conectada'}
                        </span>
                    </div>
                )}
            </div>

            {!error && <BotFieldsImporter botFields={botFields} />}

            {error ? (
                <Card className="bg-red-500/5 border-red-500/20">
                    <CardContent className="p-12 text-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-100">Error de Conexión</h3>
                            <p className="text-sm text-slate-400 max-w-md mx-auto">
                                No pudimos conectar con ManyChat. Por favor verifica que tu <code className="text-red-400 bg-red-400/10 px-1 rounded">MANYCHAT_API_TOKEN</code> en el archivo .env sea correcto.
                            </p>
                        </div>
                        <p className="text-xs text-slate-600 italic">Detalle: {error}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Flows Listing */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <RefreshCcw className="h-4 w-4" /> Flujos Detectados ({flows.length})
                        </h3>
                        {flows.map((flow: any) => (
                            <Card key={flow.id} className="bg-slate-900 border-slate-800 hover:border-indigo-500/30 transition-all cursor-pointer group">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                                            <Bot className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-200">{flow.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">ID: {flow.id}</p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-black text-indigo-400 opacity-0 group-hover:opacity-100 uppercase tracking-widest transition-all">
                                        Importar Datos
                                    </button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Custom Fields Listing */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Database className="h-4 w-4" /> Campos Personalizados ({fields.length})
                        </h3>
                        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-800">
                                    {fields.map((field: any) => (
                                        <div key={field.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="text-[10px] font-bold border-indigo-500/20 text-indigo-400">
                                                    {field.type}
                                                </Badge>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200">{field.name}</p>
                                                    <p className="text-[10px] text-slate-500">{field.description || 'Sin descripción'}</p>
                                                </div>
                                            </div>
                                            <button className="p-1.5 hover:bg-indigo-500/20 rounded-lg text-indigo-400 transition-all">
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl">
                <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-100">Nota sobre la importación</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                    Debido a las restricciones de privacidad de ManyChat, la API permite listar los flujos pero no leer el texto exacto de cada bloque de mensaje automáticamente. Al hacer clic en "Importar Datos", el sistema preparará una estructura para que puedas mapear las variables de tus flujos directamente al cerebro de la IA.
                </p>
            </div>
        </div>
    );
}
