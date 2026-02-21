'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Edit2, Trash2, Save, X, Loader2, MessageCircle, Info } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface KnowledgeItemProps {
    item: {
        id: string;
        key: string;
        question?: string | null;
        content: string;
        category: string;
    };
    isFaq?: boolean;
}

export function KnowledgeItem({ item, isFaq = false }: KnowledgeItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState(item.content);
    const [question, setQuestion] = useState(item.question || '');

    const router = useRouter();
    const supabase = createClient();

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const { error } = await (supabase.from('bot_knowledge') as any)
                .update({
                    content,
                    question: isFaq ? question : null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', item.id);

            if (error) throw error;
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error('Error updating knowledge:', error);
            alert('Error al guardar el conocimiento');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar este conocimiento?')) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('bot_knowledge')
                .delete()
                .eq('id', item.id);

            if (error) throw error;
            router.refresh();
        } catch (error) {
            console.error('Error deleting knowledge:', error);
            alert('Error al eliminar');
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <Card className="bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-500/10">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">
                            Editando {isFaq ? 'FAQ' : item.key}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {isFaq && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Pregunta</label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Respuesta / Contenido</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            Guardar Cambios
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900 border-slate-800 group hover:border-slate-700 transition-all">
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-750 transition-colors">
                                {isFaq ? <MessageCircle className="h-4 w-4 text-emerald-400" /> : <Info className="h-4 w-4 text-blue-400" />}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-tight">
                                    {isFaq ? item.question : item.key}
                                </h4>
                                {!isFaq && <p className="text-[10px] text-slate-500 font-bold uppercase">Clave de Entonación</p>}
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed pl-12 line-clamp-3">
                            {item.content}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 bg-slate-800 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 rounded-xl transition-all"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        {isFaq && (
                            <button
                                onClick={handleDelete}
                                className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
