'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Box, Fan, Cable, Monitor } from 'lucide-react';
import Link from 'next/link';
import { CatalogPage, Specification } from '@/lib/types';
import ImageUpload from '@/components/ImageUpload';
import CatalogPageView from '@/components/CatalogPage';

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [page, setPage] = useState<CatalogPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('0');
    const [category, setCategory] = useState('CASES');
    const [specs, setSpecs] = useState<Specification[]>([]);

    useEffect(() => {
        if (id) fetchPage();
    }, [id]);

    async function fetchPage() {
        setLoading(true);
        const { data, error } = await supabase
            .from('esgaming_pages')
            .select(`
                *,
                images:esgaming_images (*),
                specifications:esgaming_specifications (*),
                prices:esgaming_prices (*)
            `)
            .eq('id', id)
            .single();

        if (data) {
            setPage(data);
            setTitle(data.title);
            setPrice(data.prices && data.prices.length > 0 ? data.prices[0].amount : '0');
            setCategory(data.category || 'CASES');
            setSpecs(data.specifications || []);
        }
        setLoading(false);
    }

    const handleSavePrimary = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('esgaming_pages')
                .update({
                    title,
                    category: category.toUpperCase()
                })
                .eq('id', id);

            if (error) throw error;

            // Save Price
            // Check if price exists
            const { data: existingPrice } = await supabase.from('esgaming_prices').select('id').eq('page_id', id).single();
            if (existingPrice) {
                await supabase.from('esgaming_prices').update({ amount: parseFloat(price) }).eq('id', existingPrice.id);
            } else {
                await supabase.from('esgaming_prices').insert({ page_id: id, amount: parseFloat(price), currency: 'USD' });
            }

            alert('Saved successfully!');
        } catch (err) {
            alert('Error saving data');
        } finally {
            setSaving(false);
        }
    };

    const handleSpecChange = (index: number, field: 'label' | 'value', text: string) => {
        const newSpecs = [...specs];
        newSpecs[index] = { ...newSpecs[index], [field]: text };
        setSpecs(newSpecs);
    };

    const handleSaveSpecs = async () => {
        setSaving(true);
        try {
            // Upsert all specs
            const updates = specs.map((s, i) => ({
                id: s.id, // If ID exists, update. If new (temp ID), might need handling but for now assuming direct edit of existing
                page_id: id,
                label: s.label,
                value: s.value,
                display_order: i
            }));

            const { error } = await supabase.from('esgaming_specifications').upsert(updates);
            if (error) throw error;
            alert('Specs Saved!');
        } catch (err) {
            console.error(err);
            alert('Error saving specs');
        } finally {
            setSaving(false);
        }
    };

    const addNewSpec = async (defaultLabel: string = 'NEW LABEL') => {
        const { data, error } = await supabase
            .from('esgaming_specifications')
            .insert({ page_id: id, label: defaultLabel, value: '...', display_order: specs.length })
            .select()
            .single();

        if (data) setSpecs([...specs, data]);
    };

    const deleteImage = async (imageId: string) => {
        if (!confirm('Delete this image?')) return;
        const { error } = await supabase.from('esgaming_images').delete().eq('id', imageId);
        if (!error) {
            fetchPage();
        }
    };

    const deleteSpec = async (specId: string) => {
        if (!confirm('Delete this spec?')) return;
        const { error } = await supabase.from('esgaming_specifications').delete().eq('id', specId);
        if (!error) {
            setSpecs(specs.filter(s => s.id !== specId));
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary"><Loader2 className="animate-spin" /></div>;
    if (!page) return <div className="text-white">Page not found</div>;

    // Construct Preview Data
    const previewData: CatalogPage = {
        ...page,
        title: title,
        category: category,
        specifications: specs,
        // Mock prices array for preview
        prices: [{ amount: parseFloat(price), currency: 'USD' }] as any,
    };

    // Spec Grouping Logic (Same as SpecGroupGrid.tsx)
    const groupedSpecs = {
        structure: specs.filter(s => /structure|size|dimension|mm|material|panel/i.test(s.label) || /mm|steel|glass/i.test(s.value)),
        cooling: specs.filter(s => /fan|cool|radiator|water|rgb/i.test(s.label)),
        io: specs.filter(s => /usb|audio|port|jack/i.test(s.label) || /usb/i.test(s.value)),
        storage: specs.filter(s => /hdd|ssd|drive|bay|slot/i.test(s.label))
    };

    const others = specs.filter(s =>
        !groupedSpecs.structure.includes(s) &&
        !groupedSpecs.cooling.includes(s) &&
        !groupedSpecs.io.includes(s) &&
        !groupedSpecs.storage.includes(s)
    );

    const renderSpecEditor = (label: string, icon: React.ReactNode, items: Specification[], addLabel?: string) => (
        <div className="bg-white/5 border border-white/10 p-4 rounded mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary">
                    {icon}
                    <h3 className="font-display font-bold uppercase text-sm tracking-widest">{label}</h3>
                </div>
                {addLabel && (
                    <button
                        onClick={() => addNewSpec(addLabel)}
                        className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white/50 flex items-center gap-1"
                    >
                        + Add {label}
                    </button>
                )}
            </div>
            <div className="space-y-2">
                {items.length === 0 && <p className="text-[10px] text-white/20 italic">No specs in this category yet.</p>}
                {items.map((spec) => {
                    const realIndex = specs.findIndex(s => s.id === spec.id);
                    return (
                        <div key={spec.id} className="flex gap-2 items-start group">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <input
                                    value={spec.label}
                                    onChange={(e) => handleSpecChange(realIndex, 'label', e.target.value)}
                                    placeholder="Label"
                                    className="bg-black/50 border border-white/10 p-2 text-[10px] font-bold text-white/70 focus:text-primary focus:border-primary outline-none"
                                />
                                <input
                                    value={spec.value}
                                    onChange={(e) => handleSpecChange(realIndex, 'value', e.target.value)}
                                    placeholder="Value"
                                    className="bg-black/50 border border-white/10 p-2 text-[10px] text-white focus:border-primary outline-none"
                                />
                            </div>
                            <button onClick={() => deleteSpec(spec.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary"><Loader2 className="animate-spin" /></div>;
    if (!page) return <div className="text-white">Page not found</div>;

    return (
        <div className="min-h-screen bg-black text-white p-8 pb-32">
            {/* Header */}
            <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-4 sticky top-0 bg-black/95 z-50 pt-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-display font-black uppercase tracking-tighter">Editor</h1>
                        <p className="text-white/50 text-xs font-mono">{id}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSavePrimary} disabled={saving} className="bg-primary text-black px-6 py-2 font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 shadow-[0_4px_20px_rgba(255,255,255,0.1)] active:scale-95">
                        {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Save Basic Info
                    </button>
                </div>
            </header>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* LEFT COLUMN: Editing Controls */}
                <div className="flex-1 space-y-12 max-w-3xl">

                    {/* 1. General Info */}
                    <section className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <h2 className="font-display font-bold uppercase text-primary mb-6 tracking-widest">General Info</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-white/50 mb-1">Product Title</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-black border border-white/20 p-3 font-bold text-lg focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-white/50 mb-1">Price (USD)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full bg-black border border-white/20 p-3 font-mono text-lg focus:border-primary outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-white/50 mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full bg-black border border-white/20 p-3 text-white focus:border-primary outline-none"
                                >
                                    <option value="CASES">CASES</option>
                                    <option value="MOTHERBOARDS">MOTHERBOARDS</option>
                                    <option value="KEYBOARDS">KEYBOARDS</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* 2. Images Manager */}
                    <section className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <h2 className="font-display font-bold uppercase text-primary mb-6 tracking-widest">Image Gallery</h2>
                        <div className="grid grid-cols-3 gap-4">
                            {/* Existing Images */}
                            {page.images.map((img) => (
                                <div key={img.id} className="relative aspect-square group border border-white/10 bg-black">
                                    <img src={img.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0">
                                        <ImageUpload pageId={page.id} imageId={img.id} currentUrl={img.url} onUpdate={fetchPage} isEditMode={true} />
                                    </div>
                                    <button
                                        onClick={() => deleteImage(img.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/80 text-white/50 hover:text-red-500 rounded z-10 border border-white/10 opacity-100 transition-opacity shadow-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Add New Slot */}
                            <div className="aspect-square border-2 border-dashed border-white/10 hover:border-primary flex flex-col items-center justify-center text-white/30 hover:text-primary transition-colors cursor-pointer bg-black/20">
                                <div className="w-full h-full relative">
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <ImageUpload pageId={page.id} onUpdate={fetchPage} isEditMode={true} />
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-center text-white/30">Click any image to replace it. Use the empty slot to add new.</p>
                    </section>

                    {/* 3. Specifications */}
                    <section className="bg-white/5 border border-white/10 p-6 rounded-lg h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-display font-bold uppercase text-primary tracking-widest">Enhanced Spec Manager</h2>
                            <button onClick={addNewSpec} className="text-xs bg-primary text-black hover:bg-white px-3 py-1 font-bold rounded flex items-center gap-1 transition-colors">
                                <Plus className="w-3 h-3" /> Add Any Spec
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar">
                            {renderSpecEditor('Structure', <Box size={16} />, groupedSpecs.structure, 'Panel')}
                            {renderSpecEditor('Cooling', <Fan size={16} />, groupedSpecs.cooling, 'Fan')}
                            {renderSpecEditor('I/O', <Cable size={16} />, groupedSpecs.io, 'USB')}
                            {renderSpecEditor('Storage', <Monitor size={16} />, groupedSpecs.storage, 'HDD/SSD')}

                            {others.length > 0 && renderSpecEditor('Additional', <Plus size={16} />, others)}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 sticky bottom-0 bg-zinc-900/90 p-4 -m-4">
                            <button onClick={handleSaveSpecs} className="w-full py-4 bg-primary text-black font-black uppercase text-xs tracking-[0.2em] flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <Save className="w-4 h-4" /> Finalize & Push Specs
                            </button>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: LIVE PREVIEW (GOD MODE) */}
                <div className="hidden xl:block xl:flex-1">
                    <div className="sticky top-28 space-y-4">
                        <div className="flex items-center justify-between text-white/40 mb-2 px-2">
                            <span className="text-[10px] uppercase font-bold tracking-[0.3em]">Live Product Preview</span>
                            <span className="text-[10px] italic">Scaling automatically...</span>
                        </div>
                        <div className="border border-white/20 bg-zinc-900 rounded-xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.8)] transform scale-[0.85] origin-top">
                            <div className="pointer-events-none">
                                <CatalogPageView
                                    page={previewData}
                                    zoomLevel={1}
                                />
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-white/20 uppercase tracking-widest bg-white/5 py-2 rounded">What clients see</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
