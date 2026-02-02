'use client';

import React from 'react';
import { CatalogPage as PageType } from '@/lib/types';
import SpecGroupGrid from './SpecGroupGrid';
import ModelVariantGrid from './ModelVariantGrid';
import EditableText from './EditableText';
import ImageUpload from './ImageUpload';
import { supabase } from '@/lib/supabaseClient';
import { Trash2 } from 'lucide-react';

interface CatalogPageProps {
    page: PageType;
    isEditMode?: boolean;
    onDelete?: () => void;
    onRefresh?: () => void;
    zoomLevel: number;
}

export default function CatalogPage({ page, isEditMode, onDelete, onRefresh, zoomLevel }: CatalogPageProps) {

    // Scale container based on zoom (1=800px, 2=1000px, 3=1200px approx width logic handled by max-w wrapper in parent)
    // Actually, zoomLevel can scale the font/padding inside? 
    // Let's use zoomLevel to impact the grid density of images primarily.

    const handleUpdateTitle = async (newTitle: string) => {
        const { error } = await supabase
            .from('pages')
            .update({ title: newTitle })
            .eq('id', page.id);
        if (error) throw error;
    };

    return (
        <div className="a4-page mx-auto group flex flex-col relative transition-all duration-300">
            {/* Admin Controls */}
            {isEditMode && (
                <div className="absolute top-4 right-4 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onDelete}
                        className="p-2 bg-red-600 hover:bg-red-500 rounded text-white shadow-lg"
                        title="Delete Page"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* HEADER */}
            <header className="flex justify-between items-end border-b-4 border-primary pb-4 mb-8">
                <div>
                    <h1 className="orbitron-title text-4xl font-black text-white uppercase tracking-tighter">
                        <EditableText
                            value={page.title}
                            isEditMode={!!isEditMode}
                            onSave={handleUpdateTitle}
                        />
                    </h1>
                    <p className="text-white/60 font-display tracking-widest text-sm mt-1 uppercase">Professional Gaming Hardware</p>
                </div>
                <div className="bg-primary px-4 py-1 skew-x-[-10deg]">
                    <span className="font-display font-black text-black text-lg skew-x-[10deg] inline-block">SERIES {page.display_order + 1}</span>
                </div>
            </header>

            {/* MAIN CONTENT SPLIT */}
            <div className="flex flex-col xl:flex-row gap-8">

                {/* LEFT: IMAGES */}
                <div className={`transition-all ${zoomLevel === 1 ? 'xl:w-[30%]' : 'xl:w-[38%]'} print:w-1/2`}>
                    <div className={`grid gap-4 ${zoomLevel === 3 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {/* Main Hero Image */}
                        {page.images?.[0] && (
                            <div className="relative w-full aspect-square border-2 border-white/10 bg-black/40 p-2">
                                <ImageUpload
                                    pageId={page.id}
                                    imageId={page.images[0].id}
                                    currentUrl={page.images[0].url}
                                    onUpdate={() => onRefresh?.()}
                                />
                            </div>
                        )}

                        {/* Thumbnails Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            {page.images?.slice(1).map((img) => (
                                <div key={img.id} className="aspect-video border border-white/10 bg-black/40 hover:border-primary transition-colors">
                                    <ImageUpload
                                        pageId={page.id}
                                        imageId={img.id}
                                        currentUrl={img.url}
                                        onUpdate={() => onRefresh?.()}
                                    />
                                </div>
                            ))}
                            {isEditMode && (
                                <div className="aspect-video border border-dashed border-white/20 flex items-center justify-center text-white/20 hover:text-primary hover:border-primary cursor-pointer">
                                    <ImageUpload
                                        pageId={page.id}
                                        onUpdate={() => onRefresh?.()}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: SPECS GROUPS */}
                <div className="flex-1 xl:w-[62%] print:w-1/2">
                    <div className="bg-gradient-to-r from-primary to-purple-600 p-2 mb-6 skew-x-[-10deg] inline-block">
                        <h2 className="font-display font-black text-white text-xl uppercase skew-x-[10deg] px-4">
                            Product Structure & Features
                        </h2>
                    </div>

                    <SpecGroupGrid specs={page.specifications} />
                </div>
            </div>

            {/* BOTTOM: VARIANT FLIP CARDS REMOVED PER USER REQUEST */
            /*
            <div className="mt-12 pt-8 border-t border-white/10 relative">
                <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 bg-black px-6">
                    <span className="font-display font-bold text-primary uppercase tracking-widest border border-primary px-4 py-1 rounded-full text-sm">
                        Select Your Model
                    </span>
                </div>

                <ModelVariantGrid pageId={page.id} isEditMode={!!isEditMode} />
            </div>
            */}

            {/* FOOTER */}
            <div className="mt-auto pt-8 flex justify-between items-center text-white/30 text-xs font-display uppercase tracking-widest">
                <span>MSI Gaming Chassis</span>
                <span>Powered by High Performance</span>
            </div>
        </div>
    );
}
