'use client';

import { useState } from 'react';
import { Plus, X, Brain, Save, Loader2, MessageSquare } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface ManageKnowledgeModalProps {
    category: 'general' | 'faq';
    triggerText: string;
}

export function ManageKnowledgeModal({ category, triggerText }: ManageKnowledgeModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        key: '',
        question: '',
        content: '',
        category
    });

    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await (supabase.from('bot_knowledge') as any)
                .insert({
                    key: category === 'faq' ? `faq_${Date.now()}` : formData.key.toLowerCase().replace(/ /g, '_'),
                    question: category === 'faq' ? formData.question : null,
                    content: formData.content,
                    category
                });

            if (error) throw error;

            setIsOpen(false);
            setFormData({ key: '', question: '', content: '', category });
            router.refresh();
        } catch (error) {
            console.error('Error adding knowledge:', error);
            alert('Error al agregar el conocimiento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5"
            >
                <Plus className="h-3.5 w-3.5" /> {triggerText}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => !loading && setIsOpen(false)}
                    />

                    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                                <Brain className="h-5 w-5 text-indigo-400" />
                                {category === 'general' ? 'Agregar Conocimiento Base' : 'Nueva Pregunta Frecuente'}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                                disabled={loading}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {category === 'general' ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Concepto / Clave</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: Ubicación, Costos de Envío..."
                                        value={formData.key}
                                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pregunta del Cliente</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: ¿Hacen envíos a todo México?"
                                        value={formData.question}
                                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Respuesta que debe dar el Bot</label>
                                <textarea
                                    required
                                    placeholder="Explica aquí la respuesta detallada..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-all"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {loading ? 'Guardando...' : 'Entrenar Bot'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
