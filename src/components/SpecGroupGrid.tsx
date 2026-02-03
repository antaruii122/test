import { CatalogPage, Specification } from '@/lib/types';
import { Box, Fan, Cable, Monitor, Cpu, Target } from 'lucide-react';

interface SpecGroupGridProps {
    specs?: Specification[];
    page?: CatalogPage; // Added page to access main specs
}

export default function SpecGroupGrid({ specs = [], page }: SpecGroupGridProps) {

    // Helper to bucketize specs using Database Grouping
    // We now trust the DB 'spec_group' column instead of regex guessing.

    const cooling = specs.filter(s => s.spec_group === 'COOLING');
    const inputOutput = specs.filter(s => s.spec_group === 'INPUT_OUTPUT');
    const storage = specs.filter(s => s.spec_group === 'STORAGE');
    const structure = specs.filter(s => s.spec_group === 'STRUCTURE');

    // Fallback: Others (ADDITIONAL or null/undefined, excluding Main Specs if they happen to be in the list)
    // Note: Main Specs are usually filtered out at the page level or not in this list, 
    // but if they are, we ensure we don't double show them if they are marked MAIN.
    const rawOthers = specs.filter(s =>
        (s.spec_group === 'ADDITIONAL' || !s.spec_group)
    );

    // Group object for rendering
    const groups = { structure, cooling, inputOutput, storage };

    // Deduplicate: If multiple specs have exact same Label AND Value, only show one.
    const others = rawOthers.filter((spec, index, self) =>
        index === self.findIndex((t) => (
            t.label.trim().toLowerCase() === spec.label.trim().toLowerCase() &&
            t.value.trim().toLowerCase() === spec.value.trim().toLowerCase()
        ))
    );

    const renderGroup = (title: string, icon: React.ReactNode, items: Specification[]) => {
        if (items.length === 0) return null;
        return (
            <div className="bg-white/5 border-t-2 border-primary/50 hover:border-primary p-6 transition-all hover:bg-white/10 group">
                <div className="flex items-center gap-3 mb-4 text-white/50 group-hover:text-primary transition-colors">
                    {icon}
                    <h4 className="font-display font-bold uppercase tracking-wider text-lg text-white">{title}</h4>
                </div>
                <div className="space-y-3">
                    {items.map(s => (
                        <div key={s.id} className="grid grid-cols-[1fr_auto] gap-4 text-sm border-b border-white/5 pb-2 last:border-0 hover:bg-white/5 px-2 -mx-2 rounded">
                            <span className="text-white/40 font-semibold text-xs uppercase self-center">{s.label}</span>
                            <span className="text-white font-medium text-right">{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Changed from grid-cols-4 to grid-cols-2 for wider viewing experience
    return (
        <div className="flex flex-col gap-6 mt-8">
            {/* MAIN SPECS (PREMIUM GRID LAYOUT) */}
            {/* MAIN SPECS (PREMIUM GRID LAYOUT - DYNAMIC FROM 'MAIN' GROUP) */}
            {specs.filter(s => s.spec_group === 'MAIN').length > 0 && (
                <div className="bg-gradient-to-br from-primary/5 to-transparent border border-white/10 p-8 rounded-xl mb-8 relative overflow-hidden group">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-[80px] translate-y-1/2 -translate-x-1/3" />

                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="font-display font-bold uppercase tracking-[0.2em] text-lg text-white">Main Specs</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 relative z-10">
                        {specs.filter(s => s.spec_group === 'MAIN').map(s => (
                            <div key={s.id} className="flex flex-col group/item">
                                <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-2 group-hover/item:text-primary/70 transition-colors">{s.label}</span>
                                <span className="text-white font-mono text-lg tracking-tight border-l-2 border-primary/30 pl-3 leading-none py-1">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* LEFT COLUMN: STRUCTURE (TALL) */}
                <div className="h-full">
                    {renderGroup('Structure & Build', <Box className="w-6 h-6" />, groups.structure)}
                </div>

                {/* RIGHT COLUMN: COOLING + I/O + STORAGE */}
                <div className="flex flex-col gap-6">
                    {renderGroup('Cooling System', <Fan className="w-6 h-6" />, groups.cooling)}
                    {renderGroup('Input / Output', <Cable className="w-6 h-6" />, groups.inputOutput)}
                    {renderGroup('Storage / Expansion', <Monitor className="w-6 h-6" />, groups.storage)}
                </div>
            </div>

            {/* FULL WIDTH BOTTOM: ADDITIONAL SPECS */}
            {others.length > 0 && (
                <div className="bg-black/40 border-t border-white/10 p-6">
                    <h4 className="font-display font-bold uppercase text-white/50 text-sm mb-4 tracking-widest">Additional Specs</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-3">
                        {others.map(s => (
                            <div key={s.id} className="flex justify-between text-sm border-b border-white/5 py-1">
                                <span className="text-primary/60 text-xs uppercase">{s.label}</span>
                                <span className="text-white text-right">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
