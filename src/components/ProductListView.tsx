'use client';

import React, { useState } from 'react';
import { CatalogPage as PageType } from '@/lib/types';
import { ChevronDown, ChevronUp, Edit, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

interface ProductListViewProps {
    pages: PageType[];
    isEditMode?: boolean;
}

export default function ProductListView({ pages, isEditMode }: ProductListViewProps) {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleSort = (column: 'name' | 'price') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const sortedPages = [...pages].sort((a, b) => {
        if (sortBy === 'name') {
            const comparison = a.title.localeCompare(b.title);
            return sortOrder === 'asc' ? comparison : -comparison;
        } else {
            const priceA = a.prices?.[0]?.amount || 0;
            const priceB = b.prices?.[0]?.amount || 0;
            return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
        }
    });

    const getKeySpecs = (page: PageType) => {
        const specs = page.specifications || [];
        const structure = specs.find(s => s.label.toUpperCase().includes('TAMAÑO') || s.label.toUpperCase().includes('PLACA MADRE'))?.value || '';
        const cooling = specs.filter(s => s.spec_group === 'COOLING').length;
        return { structure, cooling };
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 p-4 mb-6 skew-x-[-2deg]">
                <h2 className="font-display font-black text-white text-2xl uppercase skew-x-[2deg] text-center tracking-wider">
                    Professional Specs View
                </h2>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-black/40 border border-primary/20 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1fr_2fr_auto_auto] gap-4 bg-primary/10 border-b-2 border-primary p-4 font-display text-xs uppercase tracking-widest text-white/70">
                    <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 hover:text-primary transition-colors text-left"
                    >
                        Product Name
                        <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <div>Structure</div>
                    <div>Cooling Specs</div>
                    <button
                        onClick={() => handleSort('price')}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                        Price
                        <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <div className="text-center">Details</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-white/5">
                    {sortedPages.map((page) => {
                        const { structure, cooling } = getKeySpecs(page);
                        const isExpanded = expandedRow === page.id;
                        const coolingSpecs = page.specifications?.filter(s => s.spec_group === 'COOLING') || [];

                        return (
                            <div key={page.id} className="hover:bg-white/5 transition-colors">
                                {/* Main Row */}
                                <div className="grid grid-cols-[2fr_1fr_2fr_auto_auto] gap-4 p-4 items-center">
                                    {/* Product Name */}
                                    <div className="flex items-center gap-3">
                                        {isEditMode && (
                                            <Link
                                                href={`/admin/edit/${page.id}`}
                                                className="p-1.5 bg-primary/20 hover:bg-primary hover:text-black rounded transition-colors"
                                                title="Edit Product"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                        )}
                                        <div>
                                            <div className="font-display font-bold text-white text-sm uppercase">
                                                {page.title}
                                            </div>
                                            <div className="text-white/40 text-xs mt-0.5">
                                                {page.category || 'CASES'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Structure */}
                                    <div className="text-white/70 text-sm">
                                        {structure || 'N/A'}
                                    </div>

                                    {/* Cooling Summary */}
                                    <div className="text-white/70 text-sm">
                                        {cooling > 0 ? `${cooling} cooling specs` : 'No cooling info'}
                                    </div>

                                    {/* Price */}
                                    <div className="text-primary font-display font-black text-lg">
                                        ${page.prices?.[0]?.amount || 'TBD'}
                                    </div>

                                    {/* Expand Button */}
                                    <button
                                        onClick={() => toggleRow(page.id)}
                                        className="p-2 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-primary"
                                    >
                                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="bg-black/60 p-6 border-t border-white/5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Group specs by spec_group */}
                                            {['STRUCTURE', 'COOLING', 'I/O', 'STORAGE'].map(group => {
                                                const groupSpecs = page.specifications?.filter(s => s.spec_group === group) || [];
                                                if (groupSpecs.length === 0) return null;

                                                return (
                                                    <div key={group} className="space-y-2">
                                                        <h4 className="font-display font-bold text-primary text-xs uppercase tracking-wider border-b border-primary/30 pb-1">
                                                            {group}
                                                        </h4>
                                                        <div className="space-y-1.5">
                                                            {groupSpecs.map(spec => (
                                                                <div key={spec.id} className="text-xs">
                                                                    <span className="text-white/40 uppercase">{spec.label}:</span>
                                                                    <span className="text-white/80 ml-2">{spec.value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {sortedPages.map((page) => {
                    const { structure, cooling } = getKeySpecs(page);
                    const isExpanded = expandedRow === page.id;

                    return (
                        <div key={page.id} className="bg-black/40 border border-primary/20 rounded-lg overflow-hidden">
                            {/* Card Header */}
                            <div className="p-4 bg-primary/5 border-b border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-display font-bold text-white text-sm uppercase">
                                        {page.title}
                                    </h3>
                                    {isEditMode && (
                                        <Link
                                            href={`/admin/edit/${page.id}`}
                                            className="p-1.5 bg-primary/20 hover:bg-primary hover:text-black rounded transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                                <div className="text-white/40 text-xs">{page.category || 'CASES'}</div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50">Structure:</span>
                                    <span className="text-white/80">{structure || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50">Cooling:</span>
                                    <span className="text-white/80">{cooling > 0 ? `${cooling} specs` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t border-white/10 pt-2 mt-2">
                                    <span className="text-white/50 font-display uppercase">Price:</span>
                                    <span className="text-primary font-display font-black text-lg">
                                        ${page.prices?.[0]?.amount || 'TBD'}
                                    </span>
                                </div>
                            </div>

                            {/* Expand Button */}
                            <button
                                onClick={() => toggleRow(page.id)}
                                className="w-full p-3 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-white/50 hover:text-primary text-sm font-display uppercase"
                            >
                                {isExpanded ? 'Hide Details' : 'View Details'}
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="p-4 bg-black/60 border-t border-white/5 space-y-4">
                                    {['STRUCTURE', 'COOLING', 'I/O', 'STORAGE'].map(group => {
                                        const groupSpecs = page.specifications?.filter(s => s.spec_group === group) || [];
                                        if (groupSpecs.length === 0) return null;

                                        return (
                                            <div key={group} className="space-y-2">
                                                <h4 className="font-display font-bold text-primary text-xs uppercase tracking-wider border-b border-primary/30 pb-1">
                                                    {group}
                                                </h4>
                                                <div className="space-y-1.5">
                                                    {groupSpecs.map(spec => (
                                                        <div key={spec.id} className="text-xs">
                                                            <span className="text-white/40 uppercase block">{spec.label}</span>
                                                            <span className="text-white/80">{spec.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {pages.length === 0 && (
                <div className="text-center py-20">
                    <h3 className="font-display text-2xl text-white/20 mb-2">No Products Found</h3>
                    <p className="text-white/40 text-sm">Try adjusting your filters or add new products</p>
                </div>
            )}
        </div>
    );
}
