'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';

interface ColumnMapperProps {
    data: any[];
    onConfirm: (mapping: Record<string, string>) => void;
    onCancel: () => void;
}

export type MappingType = 'model' | 'price' | 'image' | 'ignore' | string; // string for 'spec:NAME'

export default function ColumnMapper({ data, onConfirm, onCancel }: ColumnMapperProps) {
    const headers = Object.keys(data[0] || {});
    const [mapping, setMapping] = useState<Record<string, string>>({});

    // Auto-guess mapping based on header names
    useEffect(() => {
        const initialMapping: Record<string, string> = {};
        headers.forEach(header => {
            const lower = header.toLowerCase();
            if (lower.includes('model') || lower.includes('name') || lower.includes('title')) {
                initialMapping[header] = 'model';
            } else if (lower.includes('price') || lower.includes('cost') || lower.includes('fob')) {
                initialMapping[header] = 'price';
            } else if (lower.includes('image') || lower.includes('photo') || lower.includes('url')) {
                initialMapping[header] = 'image';
            } else {
                initialMapping[header] = `spec:${header}`; // Default to spec with header name
            }
        });
        setMapping(initialMapping);
    }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleMappingChange = (header: string, value: string) => {
        setMapping(prev => ({ ...prev, [header]: value }));
    };

    const isValid = () => {
        const values = Object.values(mapping);
        return values.includes('model') && values.includes('price');
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                    <h3 className="font-display text-xl text-white uppercase tracking-widest">
                        Map <span className="text-primary">Columns</span>
                    </h3>
                    <p className="text-sm text-text-gray mt-1">
                        Assign each Excel column to a database field.
                    </p>
                </div>
                <div className="flex gap-2">
                    {!isValid() && (
                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 px-3 py-1 rounded border border-red-400/20">
                            <AlertCircle className="w-3 h-3" />
                            Model & Price are required
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto pb-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            {headers.map(header => (
                                <th key={header} className="min-w-[200px] p-2 text-left">
                                    <div className="mb-2">
                                        <select
                                            value={mapping[header] || 'ignore'}
                                            onChange={(e) => handleMappingChange(header, e.target.value)}
                                            className={`w-full bg-black border text-xs uppercase font-bold py-2 px-2 rounded focus:outline-none focus:ring-2 transition-all ${mapping[header] === 'ignore'
                                                    ? 'border-white/10 text-text-gray/50'
                                                    : 'border-primary/50 text-primary focus:ring-primary'
                                                }`}
                                        >
                                            <option value="model">📌 Model Name (Required)</option>
                                            <option value="price">💰 Price (Required)</option>
                                            <option value="image">🖼️ Image URL</option>
                                            <option value="ignore">🚫 Ignore</option>
                                            <optgroup label="Specifications">
                                                <option value={`spec:${header}`}>🔧 Spec: {header}</option>
                                                {/* We could allow custom spec names here in future */}
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div className="px-3 py-2 bg-white/5 rounded text-white/80 font-mono text-xs border border-white/5 truncate">
                                        {header}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="opacity-75">
                        {data.slice(0, 3).map((row, i) => (
                            <tr key={i} className="border-b border-white/5">
                                {headers.map((header, j) => (
                                    <td key={j} className="p-3 text-text-gray border-r border-white/5 last:border-0 font-mono text-xs truncate max-w-[200px]">
                                        {String(row[header] || '')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors uppercase font-display text-sm"
                >
                    Back to Upload
                </button>
                <button
                    onClick={() => onConfirm(mapping)}
                    disabled={!isValid()}
                    className="flex items-center gap-2 px-8 py-2 bg-primary text-black font-display font-black uppercase text-sm hover:bg-white hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-primary"
                >
                    Confirm Mapping
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
