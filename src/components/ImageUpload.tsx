'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    pageId: string;
    imageId?: string;
    currentUrl?: string;
    onUpdate: (newUrl: string) => void;
}

export default function ImageUpload({ pageId, imageId, currentUrl, onUpdate }: ImageUploadProps) {
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
                    .from('images')
                    .update({ url: publicUrl })
                    .eq('id', imageId);
                if (dbError) throw dbError;
            } else {
                const { error: dbError } = await supabase
                    .from('images')
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
