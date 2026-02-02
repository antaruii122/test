'use client';

import React from 'react';
import { Specification } from '@/lib/types';
import EditableText from './EditableText';
import { supabase } from '@/lib/supabaseClient';

interface SpecificationTableProps {
    pageId: string;
    specifications: Specification[];
    isEditMode: boolean;
    onRefresh?: () => void;
}

export default function SpecificationTable({ pageId, specifications, isEditMode, onRefresh }: SpecificationTableProps) {
    // Sort by display order
    const sortedSpecs = [...specifications].sort((a, b) => a.display_order - b.display_order);

    const handleUpdateSpec = async (id: string, field: 'label' | 'value', newValue: string) => {
        const { error } = await supabase
            .from('specifications')
            .update({ [field]: newValue })
            .eq('id', id);
        if (error) throw error;
    };

    const handleDeleteSpec = async (id: string) => {
        const { error } = await supabase.from('specifications').delete().eq('id', id);
        if (error) throw error;
        if (onRefresh) onRefresh();
    };

    return (
        <div className="border-2 border-primary bg-background-alt overflow-hidden">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th colSpan={2} className="bg-gradient-to-r from-primary to-primary-dark p-3 text-left font-display text-sm tracking-widest uppercase text-white">
                            Specifications
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedSpecs.map((spec) => (
                        <tr key={spec.id} className="border-b border-white/10 hover:bg-red-500/10 transition-colors group/row">
                            <td className="p-3 text-primary font-semibold w-[40%] text-sm uppercase relative">
                                <EditableText
                                    value={spec.label}
                                    isEditMode={isEditMode}
                                    onSave={(val) => handleUpdateSpec(spec.id, 'label', val)}
                                />
                                {isEditMode && (
                                    <button
                                        onClick={() => handleDeleteSpec(spec.id)}
                                        className="absolute left-[-20px] top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                )}
                            </td>
                            <td className="p-3 text-text-gray text-sm">
                                <EditableText
                                    value={spec.value}
                                    isEditMode={isEditMode}
                                    onSave={(val) => handleUpdateSpec(spec.id, 'value', val)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
