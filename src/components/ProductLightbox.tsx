import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { CatalogImage } from '@/lib/types';

interface ProductLightboxProps {
    images: CatalogImage[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductLightbox({ images, initialIndex, isOpen, onClose }: ProductLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setZoom(1);
            // Lock Scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, initialIndex]);

    // Keyboard Navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    if (!isOpen) return null;

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setZoom(1);
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setZoom(1);
    };

    const currentImage = images[currentIndex];

    // Check if we have valid images
    if (!currentImage) return null;

    return (
        <div
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Top Toolbar - Pure Safety Zone */}
            <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-end px-6 z-50 pointer-events-none">
                <button
                    onClick={onClose}
                    className="pointer-events-auto bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                >
                    <X className="w-4 h-4" /> Close Viewer
                </button>
            </div>

            {/* Navigation Left */}
            <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 hidden md:flex text-white/50 hover:text-primary hover:bg-black/50 rounded-full transition-all z-20"
            >
                <ChevronLeft className="w-10 h-10" />
            </button>

            {/* Main Image Container - constrained to ensure it never touches edges */}
            <div
                className="relative w-full h-full flex items-center justify-center p-8 md:p-20"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={currentImage.url}
                    alt="Product"
                    style={{ transform: `scale(${zoom})` }}
                    className="max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-200 select-none shadow-2xl drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                />
            </div>

            {/* Navigation Right */}
            <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 hidden md:flex text-white/50 hover:text-primary hover:bg-black/50 rounded-full transition-all z-20"
            >
                <ChevronRight className="w-10 h-10" />
            </button>

            {/* Bottom Counter & Info */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/90 px-6 py-3 rounded-full border border-white/10 backdrop-blur-sm z-20" onClick={(e) => e.stopPropagation()}>
                <span className="text-white/70 font-mono text-xs tracking-widest">
                    IMAGE {currentIndex + 1} / {images.length}
                </span>
                <div className="w-px h-4 bg-white/10 mx-2" />
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.5))} className="p-1 hover:text-primary transition-colors"><ZoomOut size={16} /></button>
                <span className="text-primary font-bold text-xs w-8 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.5))} className="p-1 hover:text-primary transition-colors"><ZoomIn size={16} /></button>
            </div>
        </div>
    );
}
