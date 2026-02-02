import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteModalProps {
    isOpen: boolean;
    itemName: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteModal({ isOpen, itemName, onClose, onConfirm }: DeleteModalProps) {
    const [input, setInput] = useState('');

    // Reset input when modal opens
    useEffect(() => {
        if (isOpen) setInput('');
    }, [isOpen]);

    if (!isOpen) return null;

    const isConfirmed = input === 'DELETE';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-zinc-900 border border-red-500/30 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-red-500/10 border-b border-red-500/20">
                    <div className="flex items-center gap-3 text-red-500">
                        <AlertTriangle className="w-6 h-6" />
                        <h2 className="font-bold text-lg font-display tracking-wider uppercase">Danger Zone</h2>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p className="text-zinc-300 text-sm">
                        You are about to permanently delete:
                        <br />
                        <span className="font-bold text-white text-base block mt-1">{itemName}</span>
                    </p>

                    <div className="bg-black/50 p-4 rounded border border-white/5">
                        <label className="block text-xs uppercase text-white/40 mb-2">
                            Type <span className="text-red-500 font-bold select-none">DELETE</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="DELETE"
                            className="w-full bg-black border border-white/20 p-2 text-center font-bold text-red-500 focus:border-red-500 outline-none rounded transition-all placeholder:text-white/10"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-black/40 border-t border-white/5 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!isConfirmed}
                        className={`px-6 py-2 text-sm font-bold rounded transition-all flex items-center gap-2 ${isConfirmed
                                ? 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                                : 'bg-white/5 text-white/30 cursor-not-allowed'
                            }`}
                    >
                        CONFIRM DELETION
                    </button>
                </div>
            </div>
        </div>
    );
}
