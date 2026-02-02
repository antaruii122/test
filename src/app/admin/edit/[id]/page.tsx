'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { CatalogPage, Specification } from '@/lib/types';
import ImageUpload from '@/components/ImageUpload';

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [page, setPage] = useState<CatalogPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('CASES');
    const [specs, setSpecs] = useState<Specification[]>([]);

    useEffect(() => {
        if (id) fetchPage();
    }, [id]);

    async function fetchPage() {
        setLoading(true);
        const { data, error } = await supabase
            .from('pages')
            .select(`
                *,
                images (*),
                specifications (*)
            `)
            .eq('id', id)
            .single();

        if (data) {
            setPage(data);
            setTitle(data.title);
            setCategory(data.category || 'CASES');
            setSpecs(data.specifications || []);
        }
        setLoading(false);
    }

    const handleSavePrimary = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('pages')
                .update({
                    title,
                    category: category.toUpperCase()
                })
                .eq('id', id);

            if (error) throw error;
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

            const { error } = await supabase.from('specifications').upsert(updates);
            if (error) throw error;
            alert('Specs Saved!');
        } catch (err) {
            console.error(err);
            alert('Error saving specs');
        } finally {
            setSaving(false);
        }
    };

    const addNewSpec = async () => {
        // Create a blank spec in DB immediately to get an ID? Or just local?
        // Let's do local first, but for upsert to work effectively it's better to insert.
        // Actually, simplest is to insert a blank one.
        const { data, error } = await supabase
            .from('specifications')
            .insert({ page_id: id, label: 'NEW LABEL', value: 'New Value', display_order: specs.length })
            .select()
            .single();

        if (data) setSpecs([...specs, data]);
    };

    const deleteSpec = async (specId: string) => {
        if (!confirm('Delete this spec?')) return;
        const { error } = await supabase.from('specifications').delete().eq('id', specId);
        if (!error) {
            setSpecs(specs.filter(s => s.id !== specId));
        }
    };

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
                    <button onClick={handleSavePrimary} disabled={saving} className="bg-primary text-black px-6 py-2 font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2">
                        {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* LEFT COLUMN: Main Info & Images */}
                <div className="space-y-12">

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
                                    {/* Using logic from main page: reusing ImageUpload for simplicity, or building custom delete? */}
                                    {/* For Admin convenience, let's reuse ImageUpload in edit mode which handles replacement */}
                                    <div className="absolute inset-0">
                                        <ImageUpload pageId={page.id} imageId={img.id} currentUrl={img.url} onUpdate={fetchPage} isEditMode={true} />
                                    </div>
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
                </div>

                {/* RIGHT COLUMN: Specifications */}
                <div className="space-y-12">
                    <section className="bg-white/5 border border-white/10 p-6 rounded-lg h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-display font-bold uppercase text-primary tracking-widest">Specifications</h2>
                            <button onClick={addNewSpec} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Add Spec
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {specs.sort((a, b) => a.display_order - b.display_order).map((spec, index) => (
                                <div key={spec.id} className="flex gap-2 items-start group">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <input
                                            value={spec.label}
                                            onChange={(e) => handleSpecChange(index, 'label', e.target.value)}
                                            placeholder="Label"
                                            className="bg-black/50 border border-white/10 p-2 text-xs font-bold text-white/70 focus:text-primary focus:border-primary outline-none"
                                        />
                                        <input
                                            value={spec.value}
                                            onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                            placeholder="Value"
                                            className="bg-black/50 border border-white/10 p-2 text-xs text-white focus:border-primary outline-none"
                                        />
                                    </div>
                                    <button onClick={() => deleteSpec(spec.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10">
                            <button onClick={handleSaveSpecs} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-xs tracking-widest flex justify-center items-center gap-2 transition-colors">
                                <Save className="w-3 h-3" /> Update Specs List
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
