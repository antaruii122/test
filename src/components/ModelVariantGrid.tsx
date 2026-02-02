import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

// Interfaces for local state until DB has this structure
interface Variant {
    id: string;
    model: string;
    price: number;
    specs?: string;
}

interface ModelVariantGridProps {
    pageId: string;
    // We'll accept an initial list or just use internal state for now since DB migration is pending
    isEditMode: boolean;
}

export default function ModelVariantGrid({ pageId, isEditMode }: ModelVariantGridProps) {
    // Placeholder data to demonstrate the UI
    const [variants, setVariants] = useState<Variant[]>([
        { id: '1', model: 'Model A - Mesh', price: 15.50 },
        { id: '2', model: 'Model B - Glass', price: 17.00 },
        { id: '3', model: 'Model C - Pro', price: 21.00 },
    ]);

    const handleAddVariant = () => {
        const newVar = {
            id: Date.now().toString(),
            model: 'New Model',
            price: 0.00
        };
        setVariants([...variants, newVar]);
    };

    return (
        <div className="mt-12 mb-8">
            <h3 className="font-display text-2xl text-center text-white uppercase tracking-widest mb-6 border-b border-primary/30 pb-2">
                Available Models & Pricing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
                {variants.map((v) => (
                    <div key={v.id} className="group h-[120px] perspective-1000 cursor-pointer">
                        <div className="relative w-full h-full transition-all duration-500 transform-style-3d group-hover:rotate-y-180">

                            {/* FRONT FACE */}
                            <div className="absolute inset-0 backface-hidden bg-white hover:bg-gray-100 border-2 border-primary flex flex-col items-center justify-center p-4 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <span className="font-display font-black text-xl text-black text-center leading-tight">
                                    {v.model}
                                </span>
                                <span className="text-xs text-gray-500 mt-2 font-display tracking-widest uppercase">
                                    Hover for Price
                                </span>
                            </div>

                            {/* BACK FACE */}
                            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary border-2 border-white flex flex-col items-center justify-center p-4 shadow-[0_0_20px_#ff0000]">
                                <span className="font-display font-black text-3xl text-black">
                                    ${v.price.toFixed(2)}
                                </span>
                                <span className="text-xs text-black font-bold uppercase mt-1">
                                    FOB PRICE
                                </span>
                            </div>

                        </div>
                    </div>
                ))}

                {isEditMode && (
                    <button
                        onClick={handleAddVariant}
                        className="h-[120px] border-2 border-dashed border-white/20 hover:border-primary hover:text-primary text-white/20 flex flex-col items-center justify-center transition-all bg-black/40"
                    >
                        <Plus className="w-8 h-8 mb-2" />
                        <span className="font-display text-sm uppercase">Add Variant</span>
                    </button>
                )}
            </div>

            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
}
