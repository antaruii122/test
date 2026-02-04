import React, { useMemo } from 'react';
import { Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { sanitizeText, sanitizeNumericField } from '@/lib/sanitization';

export interface ImportRow {
    title: string;
    sku: string;
    price: number;
    category: string;
    image_url?: string;
    specs: { label: string; value: string; spec_group?: string }[];
    originalIndex: number; // For tracking
}

interface PreviewTableProps {
    data: ImportRow[];
    onConfirm: (validatedData: ImportRow[]) => void;
    onCancel: () => void;
    onDeleteRow: (index: number) => void;
}

export default function PreviewTable({ data, onConfirm, onCancel, onDeleteRow }: PreviewTableProps) {
    const validatedRows = useMemo(() => {
        return data.map(row => {
            const hasTitle = !!row.title;
            const hasPrice = row.price > 0;
            const hasSku = !!row.sku;
            const isValid = hasTitle && hasPrice; // SKU is recommended but maybe not strictly blocking? Let's assume Title & Price are critical.

            return {
                ...row,
                isValid,
                errors: [
                    !hasTitle && 'Missing Title',
                    !hasPrice && 'Missing Price'
                ].filter(Boolean) as string[]
            };
        });
    }, [data]);

    const validCount = validatedRows.filter(r => r.isValid).length;
    const invalidCount = validatedRows.length - validCount;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                    <h3 className="font-display text-xl text-white uppercase tracking-widest">
                        Data <span className="text-primary">Preview</span>
                    </h3>
                    <p className="text-sm text-text-gray mt-1">
                        Review your data before importing. Rows with errors will not be imported unless fixed (or you can delete them).
                    </p>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="px-3 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400">
                        {validCount} Valid
                    </div>
                    {invalidCount > 0 && (
                        <div className="px-3 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                            {invalidCount} Invalid
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto max-h-[60vh] border border-white/10 rounded-lg">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-text-gray sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="p-3 font-display uppercase text-xs tracking-wider">Status</th>
                            <th className="p-3 font-display uppercase text-xs tracking-wider">SKU</th>
                            <th className="p-3 font-display uppercase text-xs tracking-wider">Model / Title</th>
                            <th className="p-3 font-display uppercase text-xs tracking-wider">Price (USD)</th>
                            <th className="p-3 font-display uppercase text-xs tracking-wider">Specs Count</th>
                            <th className="p-3 font-display uppercase text-xs tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {validatedRows.map((row, idx) => (
                            <tr
                                key={idx}
                                className={`transition-colors hover:bg-white/5 ${!row.isValid ? 'bg-red-500/5' : ''}`}
                            >
                                <td className="p-3">
                                    {row.isValid ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <div className="group relative">
                                            <XCircle className="w-5 h-5 text-red-500 cursor-help" />
                                            <div className="absolute left-full top-0 ml-2 w-max px-2 py-1 bg-black border border-red-500/50 rounded text-xs text-red-200 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                                {row.errors.join(', ')}
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="p-3 font-mono text-xs text-white/70">
                                    {row.sku || <span className="text-white/20 italic">--</span>}
                                </td>
                                <td className={`p-3 font-medium ${!row.title ? 'text-red-400 italic' : 'text-white'}`}>
                                    {row.title || 'Missing Title'}
                                </td>
                                <td className={`p-3 font-mono ${row.price === 0 ? 'text-red-400' : 'text-primary'}`}>
                                    {row.price > 0 ? `$${row.price.toFixed(2)}` : 'Invalid'}
                                </td>
                                <td className="p-3 text-white/60">
                                    {row.specs.length} specs
                                </td>
                                <td className="p-3 text-right">
                                    <button
                                        onClick={() => onDeleteRow(idx)}
                                        className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                                        title="Remove row"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 text-text-gray hover:text-white hover:bg-white/5 rounded transition-colors uppercase font-display text-sm"
                >
                    Back
                </button>
                <button
                    onClick={() => onConfirm(data)} // We pass original data because we implicitly filter or just alert on invalid rows? 
                    // Better practice: Filter out invalid rows or block?
                    // Implementation Plan says: "Allow the user to 'Delete' a row... Highlight rows in Red".
                    // Let's block confirmation if there are invalid rows to enforce data integrity, or filter them out automatically?
                    // "Highlight rows in Red if they are missing a Price or Title."
                    disabled={invalidCount > 0}
                    className="flex items-center gap-2 px-8 py-2 bg-primary text-black font-display font-black uppercase text-sm hover:bg-white hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-primary disabled:cursor-not-allowed"
                >
                    {invalidCount > 0 ? 'Fix Errors to Import' : 'Import Data'}
                    <CheckCircle className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
