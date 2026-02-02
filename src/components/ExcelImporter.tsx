'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';
import { FileUp, Table, Check, AlertCircle, Loader2 } from 'lucide-react';

interface ExcelImporterProps {
    onComplete: () => void;
}

export default function ExcelImporter({ onComplete }: ExcelImporterProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        parseFile(file);
    };

    const parseFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const json = XLSX.utils.sheet_to_json(ws);
            setData(json);
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (data.length === 0) return;

        try {
            setLoading(true);

            for (const row of data) {
                // Simple heuristic: title is often product name or model
                const title = row['Model'] || row['Name'] || row['Title'] || 'Untitled Case';

                // 1. Create Page
                const { data: page, error: pError } = await supabase
                    .from('pages')
                    .insert({ title })
                    .select()
                    .single();

                if (pError) throw pError;

                // 2. Add Price
                const amount = parseFloat(row['Price'] || '0');
                if (!isNaN(amount)) {
                    await supabase.from('prices').insert({
                        page_id: page.id,
                        amount,
                        currency: 'USD'
                    });
                }

                // 3. Add Specs (Iterate through other columns)
                const specs = Object.entries(row)
                    .filter(([key]) => !['Model', 'Name', 'Title', 'Price', 'Image'].includes(key))
                    .map(([label, value], idx) => ({
                        page_id: page.id,
                        label,
                        value: String(value),
                        display_order: idx
                    }));

                if (specs.length > 0) {
                    await supabase.from('specifications').insert(specs);
                }

                // Note: Image import from Excel binary is complex. 
                // We'll focus on text data first, user can click-to-upload images.
            }

            setData([]);
            onComplete();
            alert('Import successful!');
        } catch (err) {
            console.error(err);
            alert('Import failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-alt border border-primary/30 p-6 rounded-lg shadow-xl max-w-4xl mx-auto my-8">
            <div className="flex items-center gap-4 mb-6 border-b border-primary/20 pb-4">
                <div className="p-2 bg-primary rounded">
                    <FileUp className="text-black w-6 h-6" />
                </div>
                <h2 className="font-display text-2xl uppercase tracking-widest text-white">Excel <span className="text-primary italic">Importer</span></h2>
            </div>

            {data.length === 0 ? (
                <label
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all ${dragActive ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary/50 hover:bg-white/5'
                        }`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) parseFile(file);
                    }}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Table className="w-12 h-12 text-primary/50 mb-3" />
                        <p className="mb-2 text-sm text-text-gray font-display uppercase tracking-widest">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-text-gray/60 italic lowercase">.XLSX, .XLS or .CSV files supported</p>
                    </div>
                    <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                </label>
            ) : (
                <div className="space-y-6">
                    <div className="overflow-x-auto border border-white/10 max-h-80">
                        <table className="w-full text-sm text-left text-text-gray">
                            <thead className="text-xs uppercase bg-primary/20 text-primary">
                                <tr>
                                    {Object.keys(data[0]).map((key) => (
                                        <th key={key} className="px-4 py-3 font-display border-r border-white/5">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 5).map((row, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                        {Object.values(row).map((val: any, j) => (
                                            <td key={j} className="px-4 py-2 border-r border-white/5">{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.length > 5 && <div className="p-2 text-center text-xs italic text-text-gray/50">Showing first 5 of {data.length} rows</div>}
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => setData([])}
                            className="px-6 py-2 border border-white/20 hover:border-red-500 hover:text-red-500 font-display uppercase text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2 bg-primary text-black font-display font-black uppercase text-sm hover:bg-white transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Import {data.length} Products
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6 flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-xs text-blue-200/80 leading-relaxed">
                    Ensure your Excel has columns for <span className="text-blue-400 font-bold">Model</span> and <span className="text-blue-400 font-bold">Price</span>. All other columns will be automatically added as specifications.
                </p>
            </div>
        </div>
    );
}
