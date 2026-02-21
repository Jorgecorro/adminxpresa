'use client';

import { useState } from 'react';
import { X, Save, Loader2, Package, Tag, Info, ListOrdered } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/database';

interface EditProductModalProps {
    product: Product;
}

export function EditProductModal({ product }: EditProductModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description || '',
        price_1: product.price_1,
        price_2: product.price_2,
        price_3: product.price_3,
        price_4: product.price_4,
        price_5: product.price_5,
        qty_1: product.qty_1 || 6,
        qty_2: product.qty_2 || 39,
        qty_3: product.qty_3 || 99,
        qty_4: product.qty_4 || 499,
        qty_5: product.qty_5 || 999,
        unit: product.unit || 'pza',
        category: product.category || ''
    });

    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await (supabase.from('products') as any)
                .update(formData)
                .eq('id', product.id);

            if (error) throw error;

            setIsOpen(false);
            router.refresh();
            // Force a full reload to clear any server-side cache
            window.location.reload();
        } catch (error: any) {
            console.error('Error updating product:', error);
            alert('Error al actualizar: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-all"
            >
                Editar Listado
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => !loading && setIsOpen(false)}
                    />

                    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-xl">
                                    <Package className="h-6 w-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-50">{product.name}</h3>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Configurar Escalas de Precio</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
                                disabled={loading}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <Tag className="h-3 w-3" /> Nombre del Producto
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unidad</label>
                                            <select
                                                value={formData.unit}
                                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            >
                                                <option value="pza">Pieza (pza)</option>
                                                <option value="metro">Metro (m)</option>
                                                <option value="par">Par</option>
                                                <option value="kg">Kilogramo (kg)</option>
                                                <option value="lote">Lote</option>
                                                <option value="serv">Servicio</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</label>
                                            <input
                                                type="text"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Info className="h-3 w-3" /> Descripción
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full h-[116px] bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-lg">Escalas de Cantidad y Precio</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                                        <ListOrdered className="h-3 w-3" /> Define hasta cuántas unidades aplica cada precio
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <div key={num} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-4">
                                            <div className="text-center">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase">Nivel {num}</span>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-600 uppercase text-center block">Hasta qty:</label>
                                                <input
                                                    required
                                                    type="number"
                                                    value={formData[`qty_${num}` as keyof typeof formData]}
                                                    onChange={(e) => setFormData({ ...formData, [`qty_${num}`]: parseInt(e.target.value) || 0 })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-200 font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-center"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-600 uppercase text-center block">Precio:</label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">$</span>
                                                    <input
                                                        required
                                                        type="number"
                                                        step="0.01"
                                                        value={formData[`price_${num}` as keyof typeof formData]}
                                                        onChange={(e) => setFormData({ ...formData, [`price_${num}`]: parseFloat(e.target.value) || 0 })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-5 pr-2 py-2 text-xs text-slate-200 font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-center"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-all"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {loading ? 'Guardando...' : 'Actualizar Catálogo de Precios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
