import React from 'react';
import { ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';

interface ViewControlsProps {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    viewMode: 'grid' | 'table';
    setViewMode: (mode: 'grid' | 'table') => void;
}

export default function ViewControls({
    currentPage,
    setCurrentPage,
    totalPages,
    viewMode,
    setViewMode
}: ViewControlsProps) {
    return (
        <div className="sticky top-[76px] z-40 bg-black/90 backdrop-blur border-b border-primary/20 py-3 px-8 flex flex-wrap gap-6 items-center justify-between">

            {/* View Mode Toggle */}
            <div className="flex items-center gap-6">
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-primary text-black' : 'text-white/50 hover:text-white'}`}
                        title="Grid View"
                    >
                        <Grid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded transition-all ${viewMode === 'table' ? 'bg-primary text-black' : 'text-white/50 hover:text-white'}`}
                        title="List View"
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center gap-4">
                    <span className="text-white/50 font-display text-sm">
                        PAGE <span className="text-primary">{currentPage + 1}</span> / {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="p-2 border border-white/20 rounded hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="p-2 border border-white/20 rounded hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
