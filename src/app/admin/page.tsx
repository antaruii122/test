'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Terminal } from 'lucide-react';

export default function AdminLogin() {
    const router = useRouter();
    const [accessing, setAccessing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const handleAccess = () => {
        setAccessing(true);
        const steps = [
            'Establishing secure connection...',
            'Bypassing firewall...',
            'Injecting admin privileges...',
            'Access Protocol: GRANTED.'
        ];

        let delay = 0;
        steps.forEach((step, i) => {
            delay += 800;
            setTimeout(() => {
                setLogs(prev => [...prev, step]);
                if (i === steps.length - 1) {
                    localStorage.setItem('admin_access', 'true');
                    setTimeout(() => {
                        router.push('/');
                    }, 1000);
                }
            }, delay);
        });
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-primary p-4">
            <div className="border border-primary/50 p-8 max-w-md w-full bg-black/50 backdrop-blur shadow-[0_0_50px_rgba(255,0,0,0.2)]">
                <div className="flex items-center gap-4 mb-8 border-b border-primary/30 pb-4">
                    <Terminal className="w-8 h-8 animate-pulse" />
                    <h1 className="text-2xl font-bold tracking-widest">MSI ADMIN PROTOCOL</h1>
                </div>

                {!accessing ? (
                    <button
                        onClick={handleAccess}
                        className="w-full py-4 border border-primary text-primary hover:bg-primary hover:text-black transition-all font-bold tracking-[0.2em] uppercase group relative overflow-hidden"
                    >
                        <span className="relative z-10">Initialize Access</span>
                        <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                ) : (
                    <div className="space-y-2 font-xs h-40">
                        {logs.map((log, i) => (
                            <div key={i} className="flex items-center gap-2 text-green-500">
                                <span>&gt;</span>
                                <span className="typing-effect">{log}</span>
                            </div>
                        ))}
                        {logs.length === 4 && (
                            <div className="mt-4 flex items-center gap-2 text-primary font-bold animate-pulse">
                                <ShieldCheck className="w-5 h-5" />
                                <span>REDIRECTING TO CATALOG...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[-1] bg-[length:100%_2px,3px_100%]"></div>
        </div>
    );
}
