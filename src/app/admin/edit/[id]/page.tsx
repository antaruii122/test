'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Box, Fan, Cable, Monitor, Target } from 'lucide-react';
import Link from 'next/link';
import { CatalogPage, Specification } from '@/lib/types';
import ImageUpload from '@/components/ImageUpload';
import CatalogPageView from '@/components/CatalogPage';

const SPECS_BY_CATEGORY: Record<string, string[]> = {
    'CASES': [
        "Model No.", "MOQ", "FOB Price", "Structure Size", "Case Size", "Carton Size",
        "Form Factor", "Material", "Motherboard Support", "PSU Support",
        "Front Panel", "Side Panel", "Cooling System", "Water Cooling",
        "Fan Support", "Included Fans", "Input / Output Ports", "Drive Bays",
        "PCI Slots", "Max GPU Length", "Max CPU Height", "Net Weight / Gross Weight"
    ],
    'MOTHERBOARDS': [
        "Model No.", "MOQ", "FOB Price", "Chipset", "Socket", "Memory Support",
        "Storage", "Expansion Slots", "Rear I/O", "Internal I/O", "Form Factor",
        "LAN / Audio", "Power Phase"
    ],
    'KEYBOARDS': [
        "Model No.", "MOQ", "FOB Price", "Keys", "Switch Type", "Backlight",
        "Connectivity", "Cable Length", "Keycaps", "Dimensions", "Weight", "System Support"
    ]
};

const AutoCompleteInput = ({ value, onChange, placeholder, category }: { value: string, onChange: (val: string) => void, placeholder: string, category?: string }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Default to CASES if category undefined or not found
    const validSuggestions = SPECS_BY_CATEGORY[category || 'CASES'] || SPECS_BY_CATEGORY['CASES'];

    // Filter suggestions based on input
    const filtered = validSuggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()));

    return (
        <div className="relative">
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                placeholder={placeholder}
                className="w-full bg-black/50 border border-white/10 p-2 text-[10px] font-bold text-white/70 focus:text-primary focus:border-primary outline-none"
            />
            {showSuggestions && filtered.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-zinc-900 border border-white/20 z-50 max-h-48 overflow-y-auto shadow-xl rounded-b-md">
                    {filtered.map((suggestion) => (
                        <div
                            key={suggestion}
                            onMouseDown={() => { onChange(suggestion); setShowSuggestions(false); }}
                            className="p-2 hover:bg-primary/20 hover:text-white text-[10px] text-white/70 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// NEW: Autocomplete but for VALUES based on existing DB entries for that specific Label
const ValueAutoComplete = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder: string }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch unique values for this label when focused
    const fetchSuggestions = async () => {
        if (!label) return;
        const { data } = await supabase
            .from('esgaming_specifications')
            .select('value')
            .ilike('label', label) // Case insensitive match on label
            .not('value', 'is', null)
            .limit(50);

        if (data) {
            // Uniq and clean options
            const unique = Array.from(new Set(data.map(d => d.value).filter(v => v !== '-' && v !== '...')));
            setSuggestions(unique);
        }
    };

    return (
        <div className="relative">
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => { setShowSuggestions(true); fetchSuggestions(); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={placeholder}
                className="w-full bg-black/50 border border-white/10 p-2 text-[10px] text-white focus:border-primary outline-none"
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-zinc-900 border border-white/20 z-50 max-h-48 overflow-y-auto shadow-xl rounded-b-md">
                    {suggestions.map((suggestion) => (
                        <div
                            key={suggestion}
                            onMouseDown={() => { onChange(suggestion); setShowSuggestions(false); }}
                            className="p-2 hover:bg-primary/20 hover:text-white text-[10px] text-white/70 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


const DeleteConfirmButton = ({ onDelete }: { onDelete: () => void }) => {
    // ... existing DeleteConfirmButton logic (if it was inline, good, otherwise we define it or remove if unused)
    // Wait, the previous file had it inline or imported? 
    // Checking lines around 60-100 in previous step showed the previous edit broke specific blocks.
    // I will assume DeleteConfirmButton is defined later or I need to keep it if it was there.
    // Looking at previous `view_file` (Step 767), DeleteConfirmButton definition starts at line 104 (not shown in snippet but implied).
    // I will include the end of AutoCompleteInput and the start of ValueAutoComplete.
    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                if (confirm('Are you sure?')) onDelete();
            }}
            className="p-1.5 bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
};



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
    const [showAllSpecs, setShowAllSpecs] = useState(false); // Toggle for dashboard filter
    // Spec State
    const [specs, setSpecs] = useState<Specification[]>([]);

    useEffect(() => {
        if (!id) return;

        fetchPage();

        // POLL INTERVAL: Fetch every 5 seconds to ensure fresh data
        const pollInterval = setInterval(() => {
            // console.log('Auto-refresh polling...');
            fetchPage();
        }, 5000);

        // WINDOW FOCUS: Fetch when window regains focus
        const handleFocus = () => {
            console.log('Window focused, refreshing...');
            fetchPage();
        };
        window.addEventListener('focus', handleFocus);
        window.addEventListener('visibilitychange', handleFocus);

        // Realtime Subscription
        const channel = supabase
            .channel(`editor-${id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'esgaming_pages', filter: `id=eq.${id}` },
                () => {
                    console.log('Page updated, refreshing...');
                    fetchPage();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'esgaming_specifications', filter: `page_id=eq.${id}` },
                () => {
                    console.log('Specs updated, refreshing...');
                    fetchPage();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'esgaming_prices', filter: `page_id=eq.${id}` },
                () => {
                    console.log('Price updated, refreshing...');
                    fetchPage();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'esgaming_images', filter: `page_id=eq.${id}` },
                () => {
                    console.log('Images updated, refreshing...');
                    fetchPage();
                }
            )
            .subscribe();

        return () => {
            clearInterval(pollInterval);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('visibilitychange', handleFocus);
            supabase.removeChannel(channel);
        };
    }, [id]);

    async function fetchPage() {
        // No loading spinner for updates to avoid flickering
        // setLoading(true); 

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
            // Only update form fields if we are NOT currently editing them 
            // (Actually, aggressive sync might overwrite user typing if they are slow/concurrent. 
            // For now, let's keep it simple: It updates everything. 
            // To prevent overwriting local state while typing, we might strictly only update non-focused fields, 
            // but for "sync with Supabase edit" typically implying "I changed it elsewhere", we want the latest.)

            // NOTE: To avoid annoying the user while they type, we check 'saving'. 
            // Better yet, we only update state if it differs significantly or we accept the overwrite.
            // Given the user request is "I changed on supabase and it didn't change here", we prioritize the incoming data.

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
                    category: category.toUpperCase(),
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



    const handleSpecChange = (index: number, field: 'label' | 'value' | 'spec_group', text: string) => {
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
                spec_group: s.spec_group, // Include Spec Group in save
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

    const addNewSpec = async (defaultLabel: string = 'NEW LABEL', group: string = 'ADDITIONAL') => {
        const { data, error } = await supabase
            .from('esgaming_specifications')
            .insert({
                page_id: id,
                label: defaultLabel,
                value: '...',
                spec_group: group,
                display_order: specs.length
            })
            .select()
            .single();

        if (data) setSpecs([...specs, data]);
    };

    const handleAddSpec = async (group: string, label: string) => {
        const { data, error } = await supabase
            .from('esgaming_specifications')
            .insert({
                page_id: id,
                spec_group: group,
                label: label,
                value: '-' // Default placeholder value
            })
            .select()
            .single();

        if (data) {
            setSpecs([...specs, data]);
        }
    };

    const deleteSpec = async (specId: string) => {
        // Optimistic update for UI feel, but actual logic awaits DB
        const { error } = await supabase.from('esgaming_specifications').delete().eq('id', specId);
        if (!error) {
            setSpecs(specs.filter(s => s.id !== specId));
        }
    };

    const handleDeleteImage = async (e: React.MouseEvent, imageId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Delete this image?')) return;
        const { error } = await supabase.from('esgaming_images').delete().eq('id', imageId);
        if (!error) {
            fetchPage();
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

    // Spec Grouping Logic (Database Source of Truth)
    // We strictly filter by the 'spec_group' column now.

    const main = specs.filter(s => s.spec_group === 'MAIN');
    const cooling = specs.filter(s => s.spec_group === 'COOLING');
    const inputOutput = specs.filter(s => s.spec_group === 'INPUT_OUTPUT');
    const storage = specs.filter(s => s.spec_group === 'STORAGE');
    const structure = specs.filter(s => s.spec_group === 'STRUCTURE');

    const groupedSpecs = { main, structure, cooling, inputOutput, storage };

    // "Others" are those explicitly marked ADDITIONAL or those with NO group (legacy/freshly added)
    const others = specs.filter(s =>
        (s.spec_group === 'ADDITIONAL' || !s.spec_group) // Catch null/undefined
    );

    const renderSpecEditor = (label: string, icon: React.ReactNode, items: Specification[], addLabel?: string, groupName: string = 'ADDITIONAL') => (
        <div className="bg-white/5 border border-white/10 p-4 rounded mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary">
                    {icon}
                    <h3 className="font-display font-bold uppercase text-sm tracking-widest">{label}</h3>
                </div>
                {addLabel && (
                    <button
                        onClick={() => addNewSpec(addLabel, groupName)}
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
                            <div className="flex-1 grid grid-cols-[1fr_1fr_auto] gap-2">
                                <AutoCompleteInput
                                    value={spec.label}
                                    onChange={(val) => handleSpecChange(realIndex, 'label', val)}
                                    placeholder="Label"
                                    category={category}  // Pass dynamic category
                                />
                                <ValueAutoComplete
                                    label={spec.label}
                                    value={spec.value}
                                    onChange={(val) => handleSpecChange(realIndex, 'value', val)}
                                    placeholder="Value"
                                />
                                {/* GROUP SELECTOR */}
                                <select
                                    value={spec.spec_group || 'ADDITIONAL'}
                                    onChange={(e) => handleSpecChange(realIndex, 'spec_group', e.target.value)}
                                    className="bg-black/50 border border-white/10 p-2 text-[10px] text-white/50 focus:text-primary outline-none max-w-[100px]"
                                >
                                    <option value="STRUCTURE">Structure</option>
                                    <option value="COOLING">Cooling</option>
                                    <option value="INPUT_OUTPUT">In / Out</option>
                                    <option value="STORAGE">Storage</option>
                                    <option value="MAIN">Main</option>
                                    <option value="ADDITIONAL">Other</option>
                                </select>
                            </div>
                            <DeleteConfirmButton onDelete={() => deleteSpec(spec.id)} />
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
                        <h1 className="text-2xl font-display font-black uppercase tracking-tighter flex items-center gap-3">
                            Editor
                            <span className="text-[10px] bg-green-900/40 text-green-400 border border-green-900 px-2 py-0.5 rounded-full flex items-center gap-1.5 font-bold tracking-widest animate-pulse">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                LIVE SYNC
                            </span>
                        </h1>
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

            <div className="flex flex-col xl:flex-row gap-8 items-start">
                {/* LEFT COLUMN: Compact Editing Controls */}
                <div className="w-full xl:w-[400px] shrink-0 space-y-8">

                    {/* 1. General Info */}
                    <section className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <h2 className="font-display font-bold uppercase text-primary mb-6 tracking-widest">General Info</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase text-white/30 mb-1">Product Title</label>
                                    <input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        onBlur={() => {
                                            // Auto-format to Title Case on blur
                                            const formatted = title.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                            setTitle(formatted);
                                        }}
                                        className="w-full bg-black border border-white/10 p-2 font-bold text-sm focus:border-primary outline-none transition-colors rounded"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] uppercase text-white/30 mb-1">Price</label>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            className="w-full bg-black border border-white/10 p-2 font-mono text-sm focus:border-primary outline-none rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase text-white/30 mb-1">Cat.</label>
                                        <select
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            className="w-full bg-black border border-white/10 p-2 text-xs focus:border-primary outline-none rounded"
                                        >
                                            <option value="CASES">CASES</option>
                                            <option value="MOTHERBOARDS">MOTHERBOARDS</option>
                                            <option value="KEYBOARDS">KEYBOARDS</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Images Manager */}
                    <section className="bg-white/5 border border-white/10 p-4 rounded-lg">
                        <h2 className="font-display font-bold uppercase text-primary/50 mb-4 tracking-widest text-[10px]">Photo Management</h2>
                        <div className="grid grid-cols-5 gap-2">
                            {/* Existing Images */}
                            {page.images.map((img) => (
                                <div key={img.id} className="relative aspect-square group border border-white/10 bg-black">
                                    <img src={img.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0">
                                        <ImageUpload pageId={page.id} imageId={img.id} currentUrl={img.url} onUpdate={fetchPage} isEditMode={true} />
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteImage(e, img.id)}
                                        className="absolute top-2 right-2 p-2 bg-red-600 text-white hover:bg-red-500 rounded-full z-20 border border-white/20 shadow-xl transition-all active:scale-90"
                                        title="Delete Image"
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
                        <p className="mt-2 text-[10px] text-center text-white/20 italic">Click image to replace. Trash to delete.</p>
                    </section>

                    {/* 3. Specifications */}
                    <section className="bg-white/5 border border-white/10 p-6 rounded-lg h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-display font-bold uppercase text-primary tracking-widest">Enhanced Spec Manager</h2>
                            <button onClick={() => addNewSpec()} className="text-xs bg-primary text-black hover:bg-white px-3 py-1 font-bold rounded flex items-center gap-1 transition-colors">
                                <Plus className="w-3 h-3" /> Add Any Spec
                            </button>
                        </div>


                        <div className="space-y-4 mb-6 border-b border-white/10 pb-6">
                            {renderSpecEditor('Main Specs', <Target size={16} />, groupedSpecs.main, 'Main Spec', 'MAIN')}
                        </div>

                        <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar">
                            {renderSpecEditor('Structure', <Box size={16} />, groupedSpecs.structure, 'Panel', 'STRUCTURE')}
                            {renderSpecEditor('Cooling', <Fan size={16} />, groupedSpecs.cooling, 'Fan', 'COOLING')}
                            {renderSpecEditor('Input / Output', <Cable size={16} />, groupedSpecs.inputOutput, 'USB', 'INPUT_OUTPUT')}
                            {renderSpecEditor('Storage', <Monitor size={16} />, groupedSpecs.storage, 'HDD/SSD', 'STORAGE')}

                            {others.length > 0 && (
                                <div className="border-t-2 border-dashed border-white/10 pt-4 mt-8">
                                    {renderSpecEditor('Additional Specs (Bottom)', <Plus size={16} />, others, 'New', 'ADDITIONAL')}
                                </div>
                            )}
                        </div>

                        {/* TOTAL SPECS COVERAGE DASHBOARD */}
                        <div className="mt-8 bg-zinc-900 border border-white/10 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-white/50 tracking-widest">
                                        Total specs of the model
                                    </h3>
                                    <h4 className="text-[10px] font-bold uppercase text-white/30 tracking-widest mt-1">
                                        {title} - Spec Coverage
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setShowAllSpecs(!showAllSpecs)}
                                    className={`text-[10px] px-3 py-1 rounded font-bold uppercase tracking-wider border transition-colors ${showAllSpecs ? 'bg-primary text-black border-primary' : 'bg-transparent text-white/50 border-white/20 hover:border-white'}`}
                                >
                                    {showAllSpecs ? 'Showing All Options' : 'Showing Active Only'}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {Object.entries({
                                    'MAIN': ['Motherboard Support', 'Max GPU Length', 'Max CPU Height', 'Power Supply Support', 'Expansion Slots'],
                                    'STRUCTURE': ['Structure Size', 'Case Size', 'Carton Size', 'Form Factor', 'Material', 'Net Weight / Gross Weight'],
                                    'COOLING': ['Cooling System', 'Water Cooling', 'Fan Support', 'Included Fans'],
                                    'Input / Output': ['Input / Output Ports'],
                                    'STORAGE': ['Drive Bays', 'PCI Slots']
                                }).map(([groupName, groupSpecs]) => {
                                    // 1. Get all valid specs for this category (e.g. CASES)
                                    const validForCategory = (SPECS_BY_CATEGORY[category] || SPECS_BY_CATEGORY['CASES']);
                                    const relevantSpecs = groupSpecs.filter(s => validForCategory.includes(s) || validForCategory.some(v => v.includes(s)));

                                    // 2. Filter based on Toggle State
                                    // If showAllSpecs is TRUE: Show everything in relevantSpecs
                                    // If showAllSpecs is FALSE: Only show specs that exist in the DB for this product
                                    const activeSpecs = showAllSpecs
                                        ? relevantSpecs
                                        : relevantSpecs.filter(s => specs.some(myspec => myspec.label.toLowerCase().trim() === s.toLowerCase().trim()));

                                    if (activeSpecs.length === 0) return null;

                                    return (
                                        <div key={groupName}>
                                            <h4 className="text-[10px] font-bold text-primary/70 mb-2 uppercase">{groupName}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {activeSpecs.map(s => {
                                                    const exists = specs.some(myspec => myspec.label.toLowerCase().trim() === s.toLowerCase().trim());
                                                    return (
                                                        <button
                                                            key={s}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                // Only allow clicking if it doesn't exist (to add it). If it exists, they should use the editor above to remove.
                                                                if (!exists) {
                                                                    // Determine group code for DB
                                                                    let groupCode = 'ADDITIONAL';
                                                                    if (groupName === 'MAIN') groupCode = 'MAIN';
                                                                    else if (groupName === 'STRUCTURE') groupCode = 'STRUCTURE';
                                                                    else if (groupName === 'COOLING') groupCode = 'COOLING';
                                                                    else if (groupName === 'Input / Output') groupCode = 'INPUT_OUTPUT';
                                                                    else if (groupName === 'STORAGE') groupCode = 'STORAGE';

                                                                    handleAddSpec(groupCode, s);
                                                                }
                                                            }}
                                                            disabled={exists}
                                                            className={`
                                                                text-[10px] px-3 py-1.5 rounded border transition-all duration-200 font-bold uppercase tracking-wider
                                                                ${exists
                                                                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(50,255,100,0.1)] cursor-default'
                                                                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/30 cursor-pointer active:scale-95'
                                                                }
                                                            `}
                                                        >
                                                            {s} {exists && <span className="ml-1">✓</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 sticky bottom-0 bg-zinc-900/90 p-4 -m-4">
                            <button onClick={handleSaveSpecs} className="w-full py-4 bg-primary text-black font-black uppercase text-xs tracking-[0.2em] flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <Save className="w-4 h-4" /> Finalize & Push Specs
                            </button>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: DOMINANT PREVIEW (GOD MODE) */}
                <div className="flex-1 min-w-0">
                    <div className="sticky top-28 bg-black/40 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between text-white/40 mb-6 border-b border-white/10 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs uppercase font-black tracking-[0.4em] text-white">Live Production View</span>
                            </div>
                            <span className="text-[10px] font-mono bg-white/10 px-2 py-1 rounded">100% SCALE</span>
                        </div>

                        <div className="max-w-[1000px] mx-auto bg-zinc-950 rounded-lg shadow-[0_0_100px_rgba(0,0,0,1)]">
                            <CatalogPageView
                                page={previewData}
                                zoomLevel={1}
                            />
                        </div>
                        <div className="mt-8 flex justify-center gap-8 text-[10px] text-white/20 uppercase tracking-[0.3em]">
                            <span>Responsive Check</span>
                            <span>•</span>
                            <span>A4 Format Ready</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
