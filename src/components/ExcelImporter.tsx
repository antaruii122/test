'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';
import { FileUp, Table, Check, AlertCircle, Loader2 } from 'lucide-react';
import ColumnMapper from './ColumnMapper';

interface ExcelImporterProps {
    onComplete: () => void;
}

export default function ExcelImporter({ onComplete }: ExcelImporterProps) {
    const [data, setData] = useState<any[]>([]);
    const [step, setStep] = useState<'upload' | 'mapping' | 'importing'>('upload');
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
            if (json.length > 0) {
                setData(json);
                setStep('mapping');
            } else {
                alert('File appears to be empty');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleImportWithMapping = async (mapping: Record<string, string>) => {
        if (data.length === 0) return;

        try {
            setLoading(true);
            setStep('importing');

            for (const row of data) {
                // Identify fields based on user mapping
                let title = 'Untitled Case';
                let priceAmount = 0;
                let imageUrl = '';
                const specs: { label: string; value: string }[] = [];

                Object.entries(mapping).forEach(([header, type]) => {
                    const value = row[header];
                    if (!value) return;

                    if (type === 'model') title = String(value);
                    else if (type === 'price') priceAmount = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
                    else if (type === 'image') imageUrl = String(value);
                    else if (type.startsWith('spec:')) {
                        // Extract the original header name if possible, or use the mapping suffix
                        const specLabel = type.replace('spec:', '');
                        specs.push({ label: specLabel, value: String(value) });
                    }
                });

                // 1. Create Page
                const { data: page, error: pError } = await supabase
                    .from('esgaming_pages')
                    .insert({ title })
                    .select()
                    .single();

                if (pError) throw pError;

                // 2. Add Price
                if (priceAmount > 0) {
                    await supabase.from('esgaming_prices').insert({
                        page_id: page.id,
                        amount: priceAmount,
                        currency: 'USD'
                    });
                }

                // 3. Add Image
                if (imageUrl) {
                    await supabase.from('esgaming_images').insert({
                        page_id: page.id,
                        url: imageUrl,
                        display_order: 0
                    });
                }

                // 4. Add Specs
                if (specs.length > 0) {
                    const specsPayload = specs.map((s, idx) => ({
                        page_id: page.id,
                        label: s.label,
                        value: s.value,
                        display_order: idx
                    }));
                    await supabase.from('esgaming_specifications').insert(specsPayload);
                }
            }

            setData([]);
            setStep('upload');
            onComplete();
            alert('Import successful!');
        } catch (err) {
            console.error(err);
            alert('Import failed. Check console for details.');
            setStep('mapping'); // Go back to mapping on error
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

            {step === 'upload' && (
                <>
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
                    <div className="mt-6 flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                        <p className="text-xs text-blue-200/80 leading-relaxed">
                            Upload your price list or catalog. You will be able to map columns in the next step.
                        </p>
                    </div>
                </>
            )}

            {step === 'mapping' && (
                <ColumnMapper
                    data={data}
                    onConfirm={handleImportWithMapping}
                    onCancel={() => { setData([]); setStep('upload'); }}
                />
            )}

            {step === 'importing' && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <h3 className="text-xl font-display text-white uppercase tracking-widest">Importing Products...</h3>
                    <p className="text-text-gray text-sm mt-2">Please wait, this might take a moment.</p>
                </div>
            )}
        </div>
    );
}
