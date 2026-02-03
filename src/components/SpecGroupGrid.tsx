import { CatalogPage, Specification } from '@/lib/types';
import { Box, Fan, Cable, Monitor, Cpu, Target } from 'lucide-react';

interface SpecGroupGridProps {
    specs?: Specification[];
    page?: CatalogPage; // Added page to access main specs
}

export default function SpecGroupGrid({ specs = [], page }: SpecGroupGridProps) {

    // Helper to bucketize specs
    // Priority 1: Cooling
    const cooling = specs.filter(s => /fan|cool|radiator|water|rgb|ventilad|trasero|frontal|arriba|top|rear|front/i.test(s.label));

    // Priority 2: I/O (Exclude Cooling) -> Fixed regex to avoid 'soporta' matching 'port'
    const io = specs.filter(s =>
        !cooling.includes(s) &&
        (/usb|audio|jack/i.test(s.label) || /\bport/i.test(s.label) || /usb/i.test(s.value))
    );

    // Priority 3: Storage (Exclude previous)
    const storage = specs.filter(s =>
        !cooling.includes(s) && !io.includes(s) &&
        /hdd|ssd|drive|bay|slot|storage|disco|almacen/i.test(s.label)
    );

    // Priority 4: Structure (Exclude previous) - Catches dimensions/materials but won't grab fans just because of 'mm'
    // Also explicitly filtering out "Placa Madre" / "Motherboard" / "GPU" / "CPU" related items as they belong to Main Specs now
    const structure = specs.filter(s =>
        !cooling.includes(s) && !io.includes(s) && !storage.includes(s) &&
        (/structure|size|dimension|mm|material|panel|chassis|peso|weight|tamaño|gabinete|caja|ancho|alto|largo/i.test(s.label) || /mm|steel|glass/i.test(s.value)) &&
        !/placa|madre|motherboard|gpu|grafica|cpu|cooler|vga/i.test(s.label) // Exclude Main Specs items from Structure
    );

    // Group object for rendering
    const groups = { structure, cooling, io, storage };

    // Fallback: Others (Exclude all groups AND Main Specs keywords)
    const rawOthers = specs.filter(s =>
        !groups.structure.includes(s) &&
        !groups.cooling.includes(s) &&
        !groups.io.includes(s) &&
        !groups.storage.includes(s) &&
        !/moq|cant|min/i.test(s.label) &&
        !/precio|price|fob/i.test(s.label) &&
        !/placa|madre|motherboard|gpu|grafica|cpu|cooler|vga|fan|ventilad|air|flujo/i.test(s.label) // STRICTLY exclude Main Specs keywords
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
            {/* MAIN SPECS (NEW TOP SECTION) */}
            {(page?.max_gpu_length || page?.max_cpu_cooler_height || page?.motherboard_form_factor || page?.cooling_airflow || page?.fan_count) && (
                <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 p-6 rounded-lg mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center gap-3 mb-6 text-primary">
                        <Target className="w-6 h-6" />
                        <h4 className="font-display font-bold uppercase tracking-wider text-xl">Main Specs</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                        {page.max_gpu_length && (
                            <div className="flex justify-between border-b border-primary/10 pb-2">
                                <span className="text-primary/60 text-xs font-bold uppercase">Max GPU Length</span>
                                <span className="text-white font-mono">{page.max_gpu_length}</span>
                            </div>
                        )}
                        {page.max_cpu_cooler_height && (
                            <div className="flex justify-between border-b border-primary/10 pb-2">
                                <span className="text-primary/60 text-xs font-bold uppercase">Max CPU Cooler</span>
                                <span className="text-white font-mono">{page.max_cpu_cooler_height}</span>
                            </div>
                        )}
                        {page.motherboard_form_factor && (
                            <div className="flex justify-between border-b border-primary/10 pb-2">
                                <span className="text-primary/60 text-xs font-bold uppercase">Motherboard</span>
                                <span className="text-white font-mono">{page.motherboard_form_factor}</span>
                            </div>
                        )}
                        {page.cooling_airflow && (
                            <div className="flex justify-between border-b border-primary/10 pb-2">
                                <span className="text-primary/60 text-xs font-bold uppercase">Airflow</span>
                                <span className="text-white font-mono">{page.cooling_airflow}</span>
                            </div>
                        )}
                        {page.fan_count && (
                            <div className="flex justify-between border-b border-primary/10 pb-2">
                                <span className="text-primary/60 text-xs font-bold uppercase">Fan Count</span>
                                <span className="text-white font-mono">{page.fan_count}</span>
                            </div>
                        )}
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
