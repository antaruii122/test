'use client';

import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface EditableTextProps {
    value: string;
    onSave: (newValue: string) => Promise<void>;
    isEditMode: boolean;
    className?: string;
}

export default function EditableText({ value, onSave, isEditMode, className = "" }: EditableTextProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    if (!isEditMode) {
        return <span className={className}>{value}</span>;
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 w-full">
                <input
                    autoFocus
                    className={`bg-background-alt border border-primary text-white p-1 w-full focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') {
                            setIsEditing(false);
                            setCurrentValue(value);
                        }
                    }}
                />
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-1 bg-green-600 hover:bg-green-500 rounded text-white"
                >
                    <Check className="w-4 h-4" />
                </button>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setCurrentValue(value);
                    }}
                    className="p-1 bg-red-600 hover:bg-red-500 rounded text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={`cursor-pointer hover:bg-primary/10 hover:outline hover:outline-1 hover:outline-primary/50 transition-all px-1 rounded -ml-1 ${className}`}
        >
            {value}
        </div>
    );

    async function handleSave() {
        if (currentValue === value) {
            setIsEditing(false);
            return;
        }

        try {
            setSaving(true);
            await onSave(currentValue);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    }
}
