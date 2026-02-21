'use client';

import { useState } from 'react';
import { Plus, X, Package, Save, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export function AddProductModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price_1: 0,
        price_2: 0,
        price_3: 0,
        price_4: 0,
        price_5: 0,
        unit: 'pza',
        category: ''
    });

    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await (supabase.from('products') as any).insert(formData);

            if (error) throw error;

            setIsOpen(false);
            setFormData({
                name: '',
                description: '',
                price_1: 0,
                price_2: 0,
                price_3: 0,
                price_4: 0,
                price_5: 0,
                unit: 'pza',
                category: ''
            });
            router.refresh();
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Error al agregar el producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
                <Plus className="h-4 w-4" /> Nuevo Producto
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => !loading && setIsOpen(false)}
                    />

                    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                                <Package className="h-5 w-5 text-indigo-400" /> Registrar Nuevo Producto
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre del Producto</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: Playera Polo"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unidad</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    >
                                        <option value="pza">Pieza (pza)</option>
                                        <option value="metro">Metro (m)</option>
                                        <option value="par">Par</option>
                                        <option value="kg">Kilogramo (kg)</option>
                                        <option value="lote">Lote / Paquete</option>
                                        <option value="serv">Servicio</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Textiles"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">Configurar Precios (MXN)</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <div key={num} className="space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase font-bold text-center block">Nivel {num}</label>
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData[`price_${num}` as keyof typeof formData]}
                                                onChange={(e) => setFormData({ ...formData, [`price_${num}`]: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 text-center focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
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
                                    {loading ? 'Guardando...' : 'Registrar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
