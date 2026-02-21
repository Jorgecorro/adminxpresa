
'use client';

import { useState } from 'react';
import { importManyChatBotFields } from '@/app/chat/actions';
import {
    RefreshCcw,
    CheckCircle2,
    Loader2,
    Brain,
    Sparkles
} from "lucide-react";

interface BotFieldsImporterProps {
    botFields: any[];
}

export function BotFieldsImporter({ botFields }: BotFieldsImporterProps) {
    const [isImporting, setIsImporting] = useState(false);
    const [lastImportCount, setLastImportCount] = useState<number | null>(null);

    const handleImport = async () => {
        if (botFields.length === 0) return;

        setIsImporting(true);
        try {
            const result = await importManyChatBotFields(botFields);
            if (result.success) {
                setLastImportCount(result.count || 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-3xl backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl">
                        <Brain className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">Sincronización Global</h3>
                        <p className="text-xs text-slate-400 font-medium">Detectados {botFields.length} Bot Fields con información de tu cuenta.</p>
                    </div>
                </div>

                <button
                    onClick={handleImport}
                    disabled={isImporting || botFields.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl transition-all shadow-lg shadow-indigo-600/20 text-sm font-black uppercase tracking-widest"
                >
                    {isImporting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Importando...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            Llenar Cerebro con Bot Fields
                        </>
                    )}
                </button>
            </div>

            {lastImportCount !== null && (
                <div className="animate-in slide-in-from-top-2 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Éxito: Se importaron {lastImportCount} entradas de conocimiento correctamente.
                    </p>
                </div>
            )}
        </div>
    );
}
