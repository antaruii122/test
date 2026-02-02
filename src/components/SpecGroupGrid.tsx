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
    const others = specs.filter(s =>
        !groups.structure.includes(s) &&
        !groups.cooling.includes(s) &&
        !groups.io.includes(s) &&
        !groups.storage.includes(s)
    );

    const renderGroup = (title: string, icon: React.ReactNode, items: Specification[]) => {
        if (items.length === 0) return null;
        return (
            <div className="bg-white/5 border-l-4 border-primary p-4 rounded-r-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-3 text-primary border-b border-white/10 pb-2">
                    {icon}
                    <h4 className="font-display font-bold uppercase tracking-wider">{title}</h4>
                </div>
                <div className="space-y-2">
                    {items.map(s => (
                        <div key={s.id} className="flex flex-col text-sm">
                            <span className="text-white/60 font-semibold text-xs uppercase">{s.label}</span>
                            <span className="text-white pl-2 border-l-2 border-white/20">{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {renderGroup('Structure & Build', <Box className="w-5 h-5" />, groups.structure)}
            {renderGroup('Cooling System', <Fan className="w-5 h-5" />, groups.cooling)}
            {renderGroup('I/O Connectivity', <Cable className="w-5 h-5" />, groups.io)}
            {renderGroup('Storage / Expansion', <Monitor className="w-5 h-5" />, groups.storage)}

            {others.length > 0 && (
                <div className="md:col-span-2 lg:col-span-4 mt-4 bg-black/40 border border-white/10 p-4 rounded">
                    <h4 className="font-display font-bold uppercase text-white/50 text-sm mb-2">Additional Specs</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
                        {others.map(s => (
                            <div key={s.id} className="flex justify-between text-sm border-b border-white/5 py-1">
                                <span className="text-primary/80">{s.label}</span>
                                <span className="text-white text-right">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
