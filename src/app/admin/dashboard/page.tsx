'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ArrowLeft, Trash2, Edit, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardItem {
    id: string;
    title: string;
    category: string;
    display_order: number;
    updated_at: string;
    prices: { amount: number }[];
}

export default function AdminDashboard() {
    const [items, setItems] = useState<DashboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('esgaming_pages')
                .select('id, title, category, display_order, updated_at, prices:esgaming_prices(amount)')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching dashboard items:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        const validation = prompt('SECURITY CHECK: To confirm deletion, type "DELETE" below:');
        if (validation !== 'DELETE') {
            if (validation !== null) alert('Deletion cancelled: You must type DELETE exactly.');
            return;
        }
        try {
            const { error } = await supabase.from('esgaming_pages').delete().eq('id', id);
            if (error) throw error;
            setItems(items.filter(i => i.id !== id));
        } catch (err) {
            alert('Error deleting item');
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('esgaming_pages')
                .insert({ title: 'NEW PRODUCT', category: 'CASES' })
                .select()
                .single();

            if (error) throw error;
            router.push(`/admin/edit/${data.id}`);
        } catch (err) {
            console.error(err);
            alert('Error creating product');
            setLoading(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-black text-primary"><Loader2 className="animate-spin w-8 h-8" /></div>;

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display font-black uppercase tracking-tighter">Admin Dashboard</h1>
                        <p className="text-white/50 text-sm">Manage all GADNIC products</p>
                    </div>
                </div>
                <button onClick={handleCreate} className="bg-primary text-black px-4 py-2 font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Product
                </button>
            </header>

            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/50 text-white/50 font-display uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-4">Order</th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4 text-right">Price</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 font-mono text-white/30">#{item.display_order + 1}</td>
                                <td className="p-4 font-bold">{item.title}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${item.category === 'KEYBOARDS' ? 'bg-purple-500/20 text-purple-400' :
                                        item.category === 'MOTHERBOARDS' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-primary/20 text-primary'
                                        }`}>
                                        {item.category || 'CASE'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <span className="font-mono text-primary font-bold">
                                        {item.prices && item.prices.length > 0 ? `$${item.prices[0].amount}` : '-'}
                                    </span>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/admin/edit/${item.id}`} className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded transition-colors" title="Edit Data">
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
