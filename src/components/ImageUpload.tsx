'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Upload, Loader2, Image as ImageIcon, PlusCircle, MinusCircle, X } from 'lucide-react';

interface ImageUploadProps {
    pageId: string;
    imageId?: string;
    currentUrl?: string;
    onUpdate: (newUrl: string) => void;
    isEditMode?: boolean; // New prop for security
    onImageClick?: () => void; // New prop for external lightbox
}

export default function ImageUpload({ pageId, imageId, currentUrl, onUpdate, isEditMode = false, onImageClick }: ImageUploadProps) {
    // State for Lightbox
    // State for Lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = e.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${pageId}-${Math.random()}.${fileExt}`;
            const filePath = `catalog/${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('catalog-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('catalog-images')
                .getPublicUrl(filePath);

            // 3. Update DB
            if (imageId) {
                const { error: dbError } = await supabase
                    .from('esgaming_images')
                    .update({ url: publicUrl })
                    .eq('id', imageId);
                if (dbError) throw dbError;
            } else {
                const { error: dbError } = await supabase
                    .from('esgaming_images')
                    .insert({ page_id: pageId, url: publicUrl });
                if (dbError) throw dbError;
            }

            onUpdate(publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    // LIGHTBOX CONTROLS
    const handleZoomIn = (e: React.MouseEvent) => { e.stopPropagation(); setZoom(p => Math.min(p + 0.5, 3)); };
    const handleZoomOut = (e: React.MouseEvent) => { e.stopPropagation(); setZoom(p => Math.max(p - 0.5, 0.5)); };
    const closeLightbox = (e: React.MouseEvent) => { e.stopPropagation(); setLightboxOpen(false); setZoom(1); };

    // READ ONLY MODE (With Lightbox)
    if (!isEditMode) {
        if (currentUrl) {
            return (
                <>
                    {/* Thumbnail */}
                    <div
                        onClick={() => onImageClick ? onImageClick() : setLightboxOpen(true)}
                        className="w-full h-full cursor-zoom-in relative group"
                    >
                        <img
                            src={currentUrl}
                            alt="Product"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
                    </div>

                    {/* Lightbox Overlay */}
                    {lightboxOpen && (
                        <div
                            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200"
                            onClick={closeLightbox}
                        >
                            {/* Image Container */}
                            <div
                                className="relative bg-black border border-white/20 p-2 shadow-2xl max-w-[80vw] max-h-[80vh] overflow-hidden rounded-lg"
                                onClick={(e) => e.stopPropagation()} // Prevent close when clicking image area
                            >
                                <img
                                    src={currentUrl}
                                    alt="Product Zoom"
                                    style={{ transform: `scale(${zoom})`, cursor: zoom > 1 ? 'grab' : 'default' }}
                                    className="max-h-[70vh] w-auto object-contain transition-transform duration-200"
                                />

                                {/* Controls Toolbar */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/90 border border-white/20 rounded-full px-4 py-2 shadow-lg z-10">
                                    <button onClick={handleZoomOut} className="p-1 hover:text-primary text-white"><MinusCircle className="w-5 h-5" /></button>
                                    <span className="text-xs font-mono w-8 text-center">{Math.round(zoom * 100)}%</span>
                                    <button onClick={handleZoomIn} className="p-1 hover:text-primary text-white"><PlusCircle className="w-5 h-5" /></button>
                                    <div className="w-px h-4 bg-white/20 mx-1"></div>
                                    <button onClick={closeLightbox} className="p-1 hover:text-red-500 text-white"><X className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            );
        }
        // If no URL and not edit mode, render nothing or placeholder? 
        // Rendering empty div to maintain grid layout
        return <div className="w-full h-full bg-white/5" />;
    }

    // EDIT MODE (Original Logic)
    return (
        <label className="relative cursor-pointer group block w-full h-full">
            {currentUrl ? (
                <img
                    src={currentUrl}
                    alt="Product"
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-40"
                />
            ) : (
                <div className="w-full h-full bg-background-alt flex flex-col items-center justify-center border-2 border-dashed border-white/10 group-hover:border-primary transition-all">
                    <ImageIcon className="w-8 h-8 text-white/20 group-hover:text-primary transition-colors" />
                    <span className="mt-2 text-xs font-display uppercase tracking-widest text-white/30 group-hover:text-primary">Add Image</span>
                </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                    <div className="flex flex-col items-center bg-black/60 p-4 rounded border border-primary/50">
                        <Upload className="w-6 h-6 text-primary mb-2" />
                        <span className="text-[10px] font-display uppercase text-white font-bold tracking-tighter">Change Image</span>
                    </div>
                )}
            </div>

            <input
                type="file"
                className="hidden"
                accept="image/*"
                disabled={uploading}
                onChange={handleUpload}
            />
        </label>
    );
}
