import { createClient } from "@/utils/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/database";
import { EditProductModal } from "@/components/EditProductModal";
import { AddProductModal } from "@/components/AddProductModal";
import {
    Package,
    Search,
    Filter,
    Tag,
    TrendingUp,
    LayoutGrid,
    List
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProductosPage() {
    const supabase = await createClient();

    const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

    const products = productsData as Product[] | null;

    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    });

    const categories = Array.from(new Set(products?.map(p => p.category).filter(Boolean))) as string[];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-50">Catálogo de Productos</h2>
                    <p className="text-slate-400">Administra los precios y especificaciones de tus productos.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-slate-900 border-slate-700 text-slate-400 py-1.5 px-3">
                        Total: {products?.length || 0} productos
                    </Badge>
                    <AddProductModal />
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar producto por nombre o código..."
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/50">
                        <option value="all">Todas las Categorías</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {products?.map((product) => (
                    <Card key={product.id} className="bg-slate-900 border-slate-800 overflow-hidden group hover:border-slate-700 transition-all duration-300">
                        <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row">
                                {/* Thumbnail */}
                                <div className="sm:w-48 h-48 sm:h-auto bg-slate-950 flex items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-slate-800">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <Package className="h-12 w-12 text-slate-800 group-hover:text-slate-700 transition-colors" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                {product.category && (
                                                    <Badge variant="outline" className="text-[10px] uppercase border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
                                                        {product.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-100">{product.name}</h3>
                                            <p className="text-sm text-slate-400 line-clamp-1 mt-1">{product.description || 'Sin descripción disponible.'}</p>
                                        </div>
                                        <EditProductModal product={product} />
                                    </div>

                                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                <TrendingUp className="h-3 w-3" /> Escala de Precios Sugerida
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[1, 2, 3, 4, 5].map((num) => {
                                                const startQty = num === 1 ? 1 : (product[`qty_${num - 1}` as keyof Product] as number) + 1;
                                                const endQty = product[`qty_${num}` as keyof Product] as number;
                                                const isLast = num === 5;

                                                return (
                                                    <div key={num} className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-center">
                                                        <p className="text-[8px] font-black text-slate-600 uppercase mb-0.5">
                                                            {isLast ? `${startQty}+` : `${startQty}-${endQty}`}
                                                        </p>
                                                        <p className="text-xs font-bold text-slate-200">
                                                            {formatter.format(product[`price_${num}` as keyof Product] as number).replace('MXN', '')}
                                                            <span className="text-[8px] text-slate-500 font-normal ml-0.5">/{product.unit || 'pza'}</span>
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {(!products || products.length === 0) && (
                <div className="p-12 border border-dashed border-slate-800 bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-slate-800 rounded-full">
                        <Package className="h-8 w-8 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-slate-300 font-bold">No se encontraron productos</p>
                        <p className="text-sm text-slate-500">Intenta ajustar tus filtros o agrega productos a la base de datos.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
