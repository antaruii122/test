import React from 'react';
import { Specification } from '@/lib/types';
import { Box, Fan, Cable, Monitor } from 'lucide-react';

interface SpecGroupGridProps {
    specs?: Specification[];
}

export default function SpecGroupGrid({ specs = [] }: SpecGroupGridProps) {

    // Helper to bucketize specs
    const groups = {
        structure: specs.filter(s => /structure|size|dimension|mm|material|panel/i.test(s.label) || /mm|steel|glass/i.test(s.value)),
        cooling: specs.filter(s => /fan|cool|radiator|water|rgb/i.test(s.label)),
        io: specs.filter(s => /usb|audio|port|jack/i.test(s.label) || /usb/i.test(s.value)),
        storage: specs.filter(s => /hdd|ssd|drive|bay|slot/i.test(s.label))
    };

    // Fallback for leftovers
    const rawOthers = specs.filter(s =>
        !groups.structure.includes(s) &&
        !groups.cooling.includes(s) &&
        !groups.io.includes(s) &&
        !groups.storage.includes(s) &&
        !/moq|cant|min/i.test(s.label) && // Hide MOQ (Supported in Footer)
        !/precio|price|fob/i.test(s.label) // Hide Price (Supported in Footer)
    );

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* LEFT COLUMN: STRUCTURE (TALL) */}
                <div className="h-full">
                    {renderGroup('Structure & Build', <Box className="w-6 h-6" />, groups.structure)}
                </div>

                {/* RIGHT COLUMN: COOLING + I/O + STORAGE */}
                <div className="flex flex-col gap-6">
                    {renderGroup('Cooling System', <Fan className="w-6 h-6" />, groups.cooling)}
                    {renderGroup('I/O Connectivity', <Cable className="w-6 h-6" />, groups.io)}
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
