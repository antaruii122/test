'use client';

import React from 'react';
import { CatalogPage as PageType } from '@/lib/types';
import SpecificationTable from './SpecificationTable';
import EditableText from './EditableText';
import ImageUpload from './ImageUpload';
import { supabase } from '@/lib/supabaseClient';
import { Trash2, Plus } from 'lucide-react';

interface CatalogPageProps {
    page: PageType;
    isEditMode?: boolean;
    onDelete?: () => void;
    onRefresh?: () => void;
}

export default function CatalogPage({ page, isEditMode, onDelete, onRefresh }: CatalogPageProps) {
    const handleUpdateTitle = async (newTitle: string) => {
        const { error } = await supabase
            .from('pages')
            .update({ title: newTitle })
            .eq('id', page.id);
        if (error) throw error;
    };

    const handleUpdatePrice = async (newAmount: string) => {
        const amount = parseFloat(newAmount);
        if (isNaN(amount)) return;

        if (page.price) {
            const { error } = await supabase
                .from('prices')
                .update({ amount })
                .eq('id', page.price.id);
            if (error) throw error;
        } else {
            // Create price if it doesn't exist
            const { error } = await supabase
                .from('prices')
                .insert({ page_id: page.id, amount, currency: 'USD' });
            if (error) throw error;
        }
    };

    const handleAddSpec = async () => {
        const { error } = await supabase
            .from('specifications')
            .insert({
                page_id: page.id,
                label: 'NEW SPEC',
                value: 'VALUE',
                display_order: page.specifications?.length || 0
            });
        if (error) throw error;
        if (onRefresh) onRefresh();
    };

    return (
        <div className="a4-page mx-auto group">
            {/* Admin Controls Overflow */}
            {isEditMode && (
                <div className="absolute top-4 left-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onDelete}
                        className="p-2 bg-red-600 hover:bg-red-500 rounded text-white shadow-lg"
                        title="Delete Page"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* MSI Style Header */}
            <header className="angular-header">
                <h1 className="orbitron-title text-3xl font-black text-white">
                    <EditableText
                        value={page.title}
                        isEditMode={!!isEditMode}
                        onSave={handleUpdateTitle}
                    />
                </h1>
            </header>

            {/* Images Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8 p-4 bg-red-500/5 border-2 border-primary rounded-md">
                {page.images?.sort((a, b) => a.display_order - b.display_order).map((img) => (
                    <div key={img.id} className="relative border-2 border-primary bg-black aspect-video transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_30px_#ff0000]">
                        <ImageUpload
                            pageId={page.id}
                            imageId={img.id}
                            currentUrl={img.url}
                            onUpdate={() => onRefresh?.()}
                        />
                    </div>
                ))}
                {isEditMode && (
                    <div className="relative border-2 border-dashed border-primary/50 bg-black/40 aspect-video transition-all hover:border-primary">
                        <ImageUpload
                            pageId={page.id}
                            onUpdate={() => onRefresh?.()}
                        />
                    </div>
                )}
            </div>

            {/* Price Section */}
            {(page.price || isEditMode) && (
                <div className="price-tag flex justify-center items-center gap-2">
                    <span>{page.price?.currency || 'USD'}</span>
                    <EditableText
                        value={page.price?.amount.toString() || '0.00'}
                        isEditMode={!!isEditMode}
                        onSave={handleUpdatePrice}
                    />
                </div>
            )}

            {/* Specifications Table */}
            <div className="mt-8 relative">
                <SpecificationTable
                    pageId={page.id}
                    specifications={page.specifications}
                    isEditMode={!!isEditMode}
                    onRefresh={onRefresh}
                />
                {isEditMode && (
                    <button
                        onClick={handleAddSpec}
                        className="mt-2 flex items-center gap-1 text-xs font-display uppercase text-primary hover:text-white transition-colors"
                    >
                        <Plus className="w-3 h-3" /> Add Specification
                    </button>
                )}
            </div>

            {/* Page Footer Decor */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <div className="h-1 w-20 bg-primary"></div>
                <span className="font-display text-primary text-sm italic">GAMING SERIES</span>
            </div>
        </div>
    );
}
