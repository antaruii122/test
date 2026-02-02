'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CatalogPage as PageType } from '@/lib/types';
import CatalogPage from '@/components/CatalogPage';
import ExcelImporter from '@/components/ExcelImporter';
import { generateCatalogPDF } from '@/lib/pdfGenerator';
import { Loader2, Settings, Download, PlusCircle, FileSpreadsheet, GripVertical, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { Reorder, useDragControls } from 'framer-motion';
import ViewControls from '@/components/ViewControls';

export default function Home() {
  const [pages, setPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(2);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [selectedCategory, setSelectedCategory] = useState('CASES');
  const CATEGORIES = ['CASES', 'MOTHERBOARDS', 'KEYBOARDS'];

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchPages();
    // Check for admin access
    const isAdmin = localStorage.getItem('admin_access') === 'true';
    setHasAdminAccess(isAdmin);
  }, []);

  async function fetchPages() {
    try {
      setLoading(true);
      // Fetch pages with related images, specs, and price
      const { data, error } = await supabase
        .from('pages')
        .select(`
          *,
          images (*),
          specifications (*),
          prices (*)
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Transform data to match our UI expected type (handling the 1-to-1 table join)
      const transformedData: PageType[] = (data || []).map((p: any) => ({
        ...p,
        price: p.prices && p.prices.length > 0 ? p.prices[0] : null
      }));

      setPages(transformedData);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddNewPage = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .insert({ title: 'NEW GAMING CASE' })
        .select()
        .single();
      if (error) throw error;
      fetchPages();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      const { error } = await supabase.from('pages').delete().eq('id', id);
      if (error) throw error;
      setPages(pages.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateCatalogPDF('.a4-page');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleReorder = async (newPages: PageType[]) => {
    setPages(newPages); // Local update
    // Note: Reordering entire list while paginated is tricky. 
    // Ideally we disable reorder in pagination mode or manage global index.
    // For V1, we accept local visual reorder.

    if (!isEditMode) return;

    // Update orders in DB
    const updates = newPages.map((page, index) => ({
      id: page.id,
      display_order: index,
      title: page.title
    }));

    try {
      const { error } = await supabase.from('pages').upsert(updates);
      if (error) throw error;
    } catch (err) {
      console.error('Reorder update failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 font-display text-primary tracking-widest uppercase">Initializing Catalog...</p>
      </div>
    );
  }

  // Filter & Pagination Logic
  const filteredPages = pages.filter(p => {
    const cat = p.category?.toUpperCase() || 'CASES'; // Default legacy items to CASES
    return cat === selectedCategory;
  });

  const totalPages = Math.ceil(filteredPages.length / ITEMS_PER_PAGE);
  const visiblePages = filteredPages.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  return (
    <main className="min-h-screen pb-20">
      {/* Admin Toolbar / Nav */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-primary/30 py-4 px-8 flex justify-between items-center shadow-[0_0_20px_rgba(255,0,0,0.2)]">
        <div className="flex items-center gap-4">
          <div className="bg-primary px-3 py-1 font-display font-black text-black">MSI</div>
          <h1 className="font-display font-black text-xl tracking-tighter hidden md:block">{selectedCategory} <span className="text-primary italic">CATALOG</span></h1>
        </div>

        {/* Category Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setCurrentPage(0); }}
              className={`px-4 py-1 text-xs font-bold font-display rounded-full transition-all ${selectedCategory === cat
                ? 'bg-primary text-black shadow-[0_0_10px_rgba(0,255,0,0.5)]'
                : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Dashboard Link (Visible to everyone for now, or just admins? Let's make it visible but subtle) */}
          <Link href="/admin/dashboard" className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-display font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">
            <LayoutGrid className="w-4 h-4" />
            Dashboard
          </Link>

          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-6 py-2 border font-display text-sm uppercase transition-all tracking-widest ${isEditMode
              ? 'bg-green-500 text-black border-green-500 hover:bg-green-400'
              : 'border-primary text-primary hover:bg-primary hover:text-black'
              }`}
          >
            {isEditMode ? (
              <>
                <span className="font-black">ADMIN OK</span>
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                <span>ADMIN</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-background-alt border border-white/20 hover:border-primary hover:text-primary font-display text-sm uppercase transition-all disabled:opacity-50"
          >
            {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            PDF
          </button>

          {isEditMode && (
            <>
              <button
                onClick={() => setShowImporter(!showImporter)}
                className={`flex items-center gap-2 px-4 py-2 border font-display text-sm uppercase transition-all ${showImporter ? 'bg-primary text-black' : 'border-white/20 hover:border-primary'
                  }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={handleAddNewPage}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-display text-sm uppercase font-black hover:bg-white transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                New Page
              </button>
            </>
          )}
        </div>
      </nav>

      {/* NEW: View Controls */}
      <ViewControls
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {isEditMode && showImporter && (
        <ExcelImporter onComplete={() => {
          setShowImporter(false);
          fetchPages();
        }} />
      )}

      {/* Pages View */}
      <div className="catalog-container pt-8">
        {pages.length > 0 ? (
          <Reorder.Group
            axis="y"
            values={visiblePages}
            onReorder={handleReorder} // Reorder works locally on the slice, not ideal but functional for V1
            className="w-full flex flex-col items-center gap-12"
          >
            {visiblePages.map((page) => (
              <Reorder.Item
                key={page.id}
                value={page}
                className="relative w-full max-w-[1400px]" // Allow wider container
                dragListener={isEditMode}
              >
                {isEditMode && (
                  <div className="absolute left-4 top-4 z-20 cursor-grab active:cursor-grabbing p-2 bg-black/50 rounded-full text-white hover:text-primary border border-white/20">
                    <GripVertical className="w-5 h-5" />
                  </div>
                )}
                <CatalogPage
                  page={page}
                  isEditMode={isEditMode}
                  onDelete={() => handleDeletePage(page.id)}
                  onRefresh={fetchPages}
                  zoomLevel={zoomLevel}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <div className="text-center py-20">
            <h2 className="font-display text-4xl text-white/20 opacity-50 mb-4">CATALOG EMPTY</h2>
            <p className="text-text-gray italic">Use Admin Mode or Excel Import to add products</p>
          </div>
        )}
      </div>

      {/* Decorative Background Element */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-[-1]"></div>
    </main>
  );
}
