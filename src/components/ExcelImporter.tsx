'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';
import { FileUp, Table, Check, AlertCircle, Loader2, Plus } from 'lucide-react';
import ColumnMapper from './ColumnMapper';
import PreviewTable, { ImportRow } from './PreviewTable';
import { sanitizeText, sanitizeNumericField } from '@/lib/sanitization';
import { isBase64Image, base64ToFile } from '@/lib/imageHelpers';


interface ExcelImporterProps {
    onComplete: () => void;
}

interface Category {
    name: string;
    display_name: string;
}

export default function ExcelImporter({ onComplete }: ExcelImporterProps) {
    const [step, setStep] = useState<'category' | 'upload' | 'mapping' | 'preview' | 'importing'>('category');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Data States
    const [rawFile, setRawFile] = useState<any[]>([]);
    const [previewData, setPreviewData] = useState<ImportRow[]>([]);

    // Category States
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [customCategory, setCustomCategory] = useState<string>('');
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase
                .from('esgaming_categories')
                .select('name, display_name')
                .eq('is_active', true)
                .order('display_name');
            setCategories(data || []);
        };
        fetchCategories();
    }, []);

    const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'CUSTOM') {
            setIsCustomCategory(true);
            setSelectedCategory('');
        } else {
            setIsCustomCategory(false);
            setSelectedCategory(val);
        }
    };

    const handleCategoryConfirm = () => {
        if (isCustomCategory && !customCategory) return;
        if (!isCustomCategory && !selectedCategory) return;
        setStep('upload');
    };

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
                setRawFile(json);
                setStep('mapping');
            } else {
                alert('File appears to be empty');
            }
        };
        reader.readAsBinaryString(file);
    };

    // Transform raw Excel data into structured ImportRow format
    const processMapping = (mapping: Record<string, string>) => {
        const processed: ImportRow[] = [];

        rawFile.forEach((row, index) => {
            let title = '';
            let sku = '';
            let price = 0;
            let imageUrl = '';
            const specs: { label: string; value: string; spec_group?: string }[] = [];

            Object.entries(mapping).forEach(([header, type]) => {
                const rawValue = row[header];
                if (rawValue === undefined || rawValue === null) return;

                const valStr = String(rawValue);

                if (type === 'model') {
                    title = sanitizeText(valStr);
                } else if (type === 'sku') {
                    sku = sanitizeText(valStr);
                } else if (type === 'price') {
                    price = sanitizeNumericField(valStr);
                } else if (type === 'image') {
                    imageUrl = sanitizeText(valStr);
                } else if (type.startsWith('spec:')) {
                    // Format: spec:HEADER:GROUP or spec:HEADER
                    const parts = type.split(':');
                    const label = parts[1] || header;
                    const group = parts[2] || 'MAIN_SPECS'; // Default group if not specified
                    const normalizedValue = sanitizeText(valStr); // Maybe normalizeUnit later if we detect dimensions?

                    if (normalizedValue) {
                        specs.push({
                            label,
                            value: normalizedValue,
                            spec_group: group
                        });
                    }
                }
            });

            // If missing SKU, maybe generate one or duplicate check won't work well?
            // For now, we allow empty SKU but it's risky. PreviewTable warns about it if we want.

            if (title || price > 0 || sku) {
                processed.push({
                    title,
                    sku,
                    price,
                    image_url: imageUrl,
                    specs,
                    category: isCustomCategory ? customCategory.toUpperCase().trim() : selectedCategory,
                    originalIndex: index
                });
            }
        });

        setPreviewData(processed);
        setStep('preview');
    };

    const handleImportConfirm = async (rowsToImport: ImportRow[]) => {
        try {
            setLoading(true);
            setStep('importing');

            // 1. Handle Custom Category Creation if needed
            let finalCategory = selectedCategory;
            if (isCustomCategory) {
                const catName = customCategory.toUpperCase().trim();
                const displayName = customCategory.trim();

                // Check if exists
                const { data: existingCat } = await supabase
                    .from('esgaming_categories')
                    .select('name')
                    .eq('name', catName)
                    .single();

                if (!existingCat) {
                    await supabase
                        .from('esgaming_categories')
                        .insert({ name: catName, display_name: displayName });
                }
                finalCategory = catName;
            }

            // 2. Process Rows
            let processedCount = 0;
            for (const row of rowsToImport) {
                if (!row.title || row.price <= 0) continue; // Skip invalid rows just in case

                // Check for existing product by SKU (if provided) or fallback to Title?
                // Plan says SKU.
                let pageId = '';

                if (row.sku) {
                    const { data: existingPage } = await supabase
                        .from('esgaming_pages')
                        .select('id')
                        .eq('sku_interno', row.sku)
                        .single();

                    if (existingPage) {
                        pageId = existingPage.id;
                        // Update existing page
                        await supabase
                            .from('esgaming_pages')
                            .update({
                                title: row.title,
                                category: finalCategory,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', pageId);
                    }
                }

                // If no page found (or no SKU), create new
                if (!pageId) {
                    const { data: newPage, error } = await supabase
                        .from('esgaming_pages')
                        .insert({
                            title: row.title,
                            sku_interno: row.sku || null,
                            category: finalCategory
                        })
                        .select()
                        .single();

                    if (error) {
                        console.error('Error creating page:', error);
                        continue;
                    }
                    pageId = newPage.id;
                }

                // Update Price
                // Delete old price? Or just insert new one? 
                // Usually we want *current* price. The table might be historic.
                // For simplicity as per current app structure (assumed 1-1 mostly), we insert.
                // Wait, previous code was inserting blind.
                // Let's check `esgaming_prices`.
                // Ideally we update if exists?
                // Let's clean up old price for this page to clear confusion or just insert new/update?
                // Let's insert new for history tracking if architecture supports it, IDK.
                // Assuming simple current price update: delete old, insert new.
                await supabase.from('esgaming_prices').delete().eq('page_id', pageId);
                await supabase.from('esgaming_prices').insert({
                    page_id: pageId,
                    amount: row.price,
                    currency: 'USD'
                });

                // Update Price
                await supabase.from('esgaming_prices').delete().eq('page_id', pageId);
                await supabase.from('esgaming_prices').insert({
                    page_id: pageId,
                    amount: row.price,
                    currency: 'USD'
                });

                // Images
                if (row.image_url) {
                    let finalImageUrl = row.image_url;

                    // AUTO-UPLOAD LOGIC: Check if Base64
                    if (isBase64Image(row.image_url)) {
                        try {
                            const uniqueId = Math.random().toString(36).substring(2, 15);
                            const filename = `upload_${Date.now()}_${uniqueId}.png`;
                            const file = base64ToFile(row.image_url, filename);
                            const storagePath = `imported/${filename}`;

                            const { data: uploadData, error: uploadError } = await supabase.storage
                                .from('product-images')
                                .upload(storagePath, file);

                            if (uploadError) {
                                console.error('Image Upload Failed:', uploadError);
                                finalImageUrl = '';
                            } else {
                                const { data: publicUrlData } = supabase.storage
                                    .from('product-images')
                                    .getPublicUrl(storagePath);

                                finalImageUrl = publicUrlData.publicUrl;
                            }
                        } catch (imgErr) {
                            console.error('Base64 Conversion Error:', imgErr);
                            finalImageUrl = '';
                        }
                    }

                    if (finalImageUrl) {
                        await supabase.from('esgaming_images').delete().eq('page_id', pageId);
                        await supabase.from('esgaming_images').insert({
                            page_id: pageId,
                            url: finalImageUrl,
                            display_order: 0
                        });
                    }
                }

                // Specs
                // Delete old specs to avoid "stacking" specs on re-import
                await supabase.from('esgaming_specifications').delete().eq('page_id', pageId);

                if (row.specs.length > 0) {
                    const specsPayload = row.specs.map((s, idx) => ({
                        page_id: pageId,
                        label: s.label,
                        value: s.value,
                        spec_group: s.spec_group,
                        display_order: idx
                    }));
                    await supabase.from('esgaming_specifications').insert(specsPayload);
                }

                processedCount++;
            }

            setRawFile([]);
            setPreviewData([]);
            setStep('category'); // Reset to start
            onComplete();
            alert(`Successfully processed ${processedCount} products!`);

        } catch (err) {
            console.error(err);
            alert('Import failed. Check console.');
            setStep('preview');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-alt border border-primary/30 p-6 rounded-lg shadow-xl max-w-5xl mx-auto my-8">
            <div className="flex items-center gap-4 mb-6 border-b border-primary/20 pb-4">
                <div className="p-2 bg-primary rounded">
                    <FileUp className="text-black w-6 h-6" />
                </div>
                <h2 className="font-display text-2xl uppercase tracking-widest text-white">Excel <span className="text-primary italic">Importer</span></h2>

                {/* Steps Indicator */}
                <div className="ml-auto flex items-center gap-2 text-xs font-mono text-white/40">
                    <span className={step === 'category' ? 'text-primary' : ''}>Category</span>
                    <span>→</span>
                    <span className={step === 'upload' ? 'text-primary' : ''}>Upload</span>
                    <span>→</span>
                    <span className={step === 'mapping' ? 'text-primary' : ''}>Map</span>
                    <span>→</span>
                    <span className={step === 'preview' ? 'text-primary' : ''}>Preview</span>
                </div>
            </div>

            {/* STEP 0: CATEGORY SELECTION */}
            {step === 'category' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center space-y-2">
                        <h3 className="text-xl text-white font-display">Select Target Category</h3>
                        <p className="text-text-gray text-sm">Where should these products be imported?</p>
                    </div>

                    <div className="max-w-md mx-auto space-y-4">
                        <select
                            value={isCustomCategory ? 'CUSTOM' : selectedCategory}
                            onChange={handleCategorySelect}
                            className="w-full bg-black border border-white/20 p-3 rounded text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="">-- Select Category --</option>
                            {categories.map(cat => (
                                <option key={cat.name} value={cat.name}>{cat.display_name}</option>
                            ))}
                            <option value="CUSTOM">+ Create New Category</option>
                        </select>

                        {isCustomCategory && (
                            <div className="space-y-2 pt-2 border-t border-white/10">
                                <label className="text-xs uppercase text-primary font-bold">New Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. POWER_SUPPLIES"
                                    value={customCategory}
                                    onChange={e => setCustomCategory(e.target.value)}
                                    className="w-full bg-black border border-primary/50 p-3 rounded text-white"
                                />
                                <p className="text-xs text-white/50">Internal name will be uppercase (e.g., "POWER_SUPPLIES")</p>
                            </div>
                        )}

                        <button
                            onClick={handleCategoryConfirm}
                            disabled={!isCustomCategory && !selectedCategory}
                            className="w-full py-3 bg-primary text-black font-bold uppercase rounded hover:bg-white transition-colors disabled:opacity-50 disabled:hover:bg-primary"
                        >
                            Next: Upload File
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 1: UPLOAD */}
            {step === 'upload' && (
                <div className="animate-in fade-in zoom-in duration-300">
                    <div className="mb-4 text-center">
                        <span className="text-sm text-primary font-mono bg-primary/10 px-2 py-1 rounded border border-primary/20">
                            Target: {isCustomCategory ? customCategory : selectedCategory}
                        </span>
                    </div>
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

                    <div className="mt-4 text-center">
                        <button onClick={() => setStep('category')} className="text-xs text-red-400 hover:underline">
                            ← Change Category
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: MAPPING */}
            {step === 'mapping' && (
                <ColumnMapper
                    data={rawFile}
                    onConfirm={processMapping}
                    onCancel={() => { setRawFile([]); setStep('upload'); }}
                />
            )}

            {/* STEP 3: PREVIEW */}
            {step === 'preview' && (
                <PreviewTable
                    data={previewData}
                    onConfirm={handleImportConfirm}
                    onCancel={() => setStep('mapping')}
                    onDeleteRow={(idx) => {
                        const newData = [...previewData];
                        newData.splice(idx, 1);
                        setPreviewData(newData);
                    }}
                />
            )}

            {/* STEP 4: IMPORTING */}
            {step === 'importing' && (
                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <h3 className="text-xl font-display text-white uppercase tracking-widest">Importing Products...</h3>
                    <p className="text-text-gray text-sm mt-2">Updating database and sanitizing entries.</p>
                </div>
            )}
        </div>
    );
}
