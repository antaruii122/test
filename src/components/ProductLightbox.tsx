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
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Top Bar controls */}
            <div className="absolute top-4 right-4 flex gap-4 z-20">
                <button
                    onClick={onClose}
                    className="p-2 bg-white/10 hover:bg-red-600 text-white rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Navigation Left */}
            <button
                onClick={handlePrev}
                className="absolute left-4 p-3 hidden md:flex text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-20"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Main Image Container */}
            <div
                className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={currentImage.url}
                    alt="Product"
                    style={{ transform: `scale(${zoom})` }}
                    className="max-h-full max-w-full object-contain transition-transform duration-200 select-none"
                />
            </div>

            {/* Navigation Right */}
            <button
                onClick={handleNext}
                className="absolute right-4 p-3 hidden md:flex text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-20"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Bottom Counter & Info */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm z-20">
                <span className="text-white/70 font-mono text-xs">
                    {currentIndex + 1} / {images.length}
                </span>
            </div>
        </div>
    );
}
