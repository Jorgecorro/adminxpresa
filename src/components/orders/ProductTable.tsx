'use client';

import React from 'react';
import { Button, Input, Select } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

export interface ProductItem {
    id: string;
    product_name: string;
    size: string;
    quantity: number;
    unit_price: number;
    is_custom?: boolean;
}

interface ProductTableProps {
    items: ProductItem[];
    onAdd: () => void;
    onUpdate: (id: string, updates: Partial<ProductItem>) => void;
    onRemove: (id: string) => void;
    editable?: boolean;
}

const productOptions = [
    { value: 'playera basica', label: 'Playera Basica' },
    { value: 'playera manga larga', label: 'Playera Basica Manga Larga' },
    { value: 'playera polo', label: 'Playera Polo' },
    { value: 'playera polo manga larga', label: 'Playera Polo Manga Larga' },
    { value: 'sudadera', label: 'Sudadera' },
    { value: 'uniforme futbol personalizado', label: 'Uniforme Futbol Personalizado' },
    { value: 'uniforme de futbol de catalogo', label: 'Uniforme de Futbol de Catalogo' },
    { value: 'uniforme futbol personalizado manga larga', label: 'Uniforme Futbol Personalizado Manga Larga' },
    { value: 'uniforme de futbol de catalogo manga larga', label: 'Uniforme de Futbol de Catalogo Manga Larga' },
    { value: 'uniforme basquet', label: 'Uniforme Basquetbol' },
    { value: 'otro', label: 'Otro (Escribir personalizado)' },
];

const sizeOptions = [
    { value: '2', label: '2' },
    { value: '4', label: '4' },
    { value: '6-8', label: '6-8' },
    { value: '10-12', label: '10-12' },
    { value: '14-16', label: '14-16' },
    { value: 'xs', label: 'XS' },
    { value: 's', label: 'S' },
    { value: 'm', label: 'M' },
    { value: 'l', label: 'L' },
    { value: 'xl', label: 'XL' },
    { value: '2xl', label: '2XL' },
    { value: '3xl', label: '3XL' },
    { value: '4xl', label: '4XL' },
    { value: '5xl', label: '5XL' },
    { value: '6xl', label: '6XL' },
];

export function ProductTable({ items, onAdd, onUpdate, onRemove, editable = true }: ProductTableProps) {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Productos</h3>
                {editable && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onAdd}
                        className="h-8 py-0"
                    >
                        <Plus size={16} className="mr-1" />
                        Agregar
                    </Button>
                )}
            </div>

            {/* Mobile Cards (hidden on desktop) */}
            <div className="lg:hidden space-y-4">
                {items.map((item, index) => (
                    <div key={item.id} className="bg-background-tertiary/50 border border-card-border rounded-xl p-4 space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-accent uppercase">Producto #{index + 1}</span>
                            {editable && (
                                <button
                                    type="button"
                                    onClick={() => onRemove(item.id)}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] uppercase text-text-muted font-bold mb-1 block">Descripción</label>
                                {editable ? (
                                    <div className="space-y-2">
                                        <Select
                                            options={productOptions}
                                            value={item.is_custom ? 'otro' : item.product_name}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'otro') {
                                                    onUpdate(item.id, { is_custom: true, product_name: '' });
                                                } else {
                                                    onUpdate(item.id, { is_custom: false, product_name: val });
                                                }
                                            }}
                                            placeholder="Seleccionar producto"
                                        />
                                        {item.is_custom && (
                                            <Input
                                                placeholder="Escribe el nombre del producto..."
                                                value={item.product_name}
                                                onChange={(e) => onUpdate(item.id, { product_name: e.target.value })}
                                                className="border-accent/30 focus:border-accent"
                                                autoFocus
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-text-primary text-sm">{item.product_name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase text-text-muted font-bold mb-1 block">Talla</label>
                                    {editable ? (
                                        <Select
                                            options={sizeOptions}
                                            value={item.size}
                                            onChange={(e) => onUpdate(item.id, { size: e.target.value })}
                                            placeholder="-"
                                        />
                                    ) : (
                                        <p className="text-text-primary text-sm">{item.size || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase text-text-muted font-bold mb-1 block">Cantidad</label>
                                    {editable ? (
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => onUpdate(item.id, { quantity: parseInt(e.target.value) || 0 })}
                                        />
                                    ) : (
                                        <p className="text-text-primary text-sm">{item.quantity}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase text-text-muted font-bold mb-1 block">Precio Unit.</label>
                                    {editable ? (
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unit_price}
                                            onChange={(e) => onUpdate(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                                        />
                                    ) : (
                                        <p className="text-text-primary text-sm">{formatCurrency(item.unit_price)}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase text-text-muted font-bold mb-1 block">Subtotal</label>
                                    <p className="text-accent font-bold text-sm h-10 flex items-center bg-accent/5 px-3 rounded-lg border border-accent/10">
                                        {formatCurrency(item.quantity * item.unit_price)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table (hidden on mobile) */}
            <div className="hidden lg:block overflow-x-auto rounded-xl border border-card-border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-background-tertiary">
                            <th className="text-left py-3 px-4 text-text-secondary font-medium uppercase tracking-wider text-[10px]">Producto</th>
                            <th className="text-left py-3 px-4 text-text-secondary font-medium uppercase tracking-wider text-[10px] w-24">Talla</th>
                            <th className="text-right py-3 px-4 text-text-secondary font-medium uppercase tracking-wider text-[10px] w-24">Cant.</th>
                            <th className="text-right py-3 px-4 text-text-secondary font-medium uppercase tracking-wider text-[10px] w-32">Precio</th>
                            <th className="text-right py-3 px-4 text-text-secondary font-medium uppercase tracking-wider text-[10px] w-32">Subtotal</th>
                            {editable && <th className="w-12"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-t border-card-border/50 hover:bg-white/5">
                                <td className="py-2 px-4">
                                    {editable ? (
                                        <div className="space-y-2 py-1">
                                            <Select
                                                options={productOptions}
                                                value={item.is_custom ? 'otro' : item.product_name}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'otro') {
                                                        onUpdate(item.id, { is_custom: true, product_name: '' });
                                                    } else {
                                                        onUpdate(item.id, { is_custom: false, product_name: val });
                                                    }
                                                }}
                                                placeholder="Seleccionar producto"
                                                className="border-0 bg-transparent"
                                            />
                                            {item.is_custom && (
                                                <Input
                                                    placeholder="Escribe el producto..."
                                                    value={item.product_name}
                                                    onChange={(e) => onUpdate(item.id, { product_name: e.target.value })}
                                                    className="h-8 text-xs border-accent/30 focus:border-accent"
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-text-primary">{item.product_name}</span>
                                    )}
                                </td>
                                <td className="py-2 px-4">
                                    {editable ? (
                                        <Select
                                            options={sizeOptions}
                                            value={item.size}
                                            onChange={(e) => onUpdate(item.id, { size: e.target.value })}
                                            placeholder="-"
                                            className="border-0 bg-transparent text-center"
                                        />
                                    ) : (
                                        <span className="text-text-primary text-center block">{item.size}</span>
                                    )}
                                </td>
                                <td className="py-2 px-4">
                                    {editable ? (
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => onUpdate(item.id, { quantity: parseInt(e.target.value) || 0 })}
                                            className="h-9 border-0 bg-transparent text-right"
                                        />
                                    ) : (
                                        <span className="text-text-primary text-right block">{item.quantity}</span>
                                    )}
                                </td>
                                <td className="py-2 px-4">
                                    {editable ? (
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unit_price}
                                            onChange={(e) => onUpdate(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                                            className="h-9 border-0 bg-transparent text-right"
                                        />
                                    ) : (
                                        <span className="text-text-primary text-right block">
                                            {formatCurrency(item.unit_price)}
                                        </span>
                                    )}
                                </td>
                                <td className="py-2 px-4 text-right text-accent font-bold">
                                    {formatCurrency(item.quantity * item.unit_price)}
                                </td>
                                {editable && (
                                    <td className="py-2 px-4">
                                        <button
                                            type="button"
                                            onClick={() => onRemove(item.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {items.length === 0 && (
                <div className="py-12 bg-background-tertiary/20 border border-dashed border-card-border rounded-xl text-center text-text-muted">
                    No hay productos agregados
                </div>
            )}

            {/* Summary */}
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex justify-between items-center">
                <span className="text-text-secondary font-medium uppercase text-xs tracking-widest">Inversión Total</span>
                <span className="text-2xl font-bold text-accent">{formatCurrency(total)}</span>
            </div>
        </div>
    );
}

export default ProductTable;
