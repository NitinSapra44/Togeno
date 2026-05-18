"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Microscope, Users, ShieldCheck } from "lucide-react";

const steps = [
    {
        step: "01",
        title: "Expert Testing",
        body: "Products go through structured trials, stress tests, and benchmarks by verified specialists.",
        icon: Microscope,
        color: "text-blue-400",
        beam: "from-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        step: "02",
        title: "Community Validation",
        body: "Real owners confirm performance and durability in real-world use.",
        icon: Users,
        color: "text-purple-400",
        beam: "from-purple-500",
        bg: "bg-purple-500/10"
    },
    {
        step: "03",
        title: "Trust Release",
        body: "Only products that survive scrutiny enter the TRODEC market.",
        icon: ShieldCheck,
        color: "text-emerald-400",
        beam: "from-emerald-500",
        bg: "bg-emerald-500/10"
    },
];

export function TrustFlowSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section ref={containerRef} className="py-32 bg-[#050505] relative overflow-hidden">
            <RadarBackground />

            <div className="container mx-auto px-6 relative z-10">
                <div className="mx-auto max-w-6xl">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20 space-y-4"
                    >
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
                            Protocol <span className="text-zinc-600">Verification</span>
                        </h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            The three-stage filter that separates products from noise.
                        </p>
                    </motion.div>

                    <div className="grid gap-8 md:grid-cols-3 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent -translate-y-1/2" />

                        {steps.map((item, i) => (
                            <HolographicCard key={i} item={item} index={i} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function HolographicCard({ item, index }: { item: typeof steps[0]; index: number }) {
    const Icon = item.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            className="group relative h-full"
        >
            <div className="relative h-full bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden">

                {/* Border Beam */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div className={`absolute -inset-[500%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                </div>

                {/* Inner Glow */}
                <div className={`absolute inset-0 bg-gradient-to-b ${item.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative p-8 flex flex-col items-center text-center h-full">

                    {/* Floating Icon */}
                    <div className="relative mb-8">
                        <div className={`absolute inset-0 blur-xl opacity-20 ${item.bg}`} />
                        <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent border border-white/10 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-500`}>
                            <Icon className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="text-xs font-mono text-zinc-500 mb-2">{item.step}</div>
                        <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            {item.body}
                        </p>
                    </div>

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] opacity-10" />
                </div>
            </div>
        </motion.div>
    )
}

function RadarBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
            <div className="absolute w-[800px] h-[800px] bg-emerald-500/5 blur-[100px] rounded-full opacity-20" />
            <motion.div
                animate={{ scale: [1, 2], opacity: [0.1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute w-[400px] h-[400px] border border-white/5 rounded-full"
            />
            <motion.div
                animate={{ scale: [1, 2], opacity: [0.1, 0] }}
                transition={{ duration: 4, delay: 2, repeat: Infinity, ease: "linear" }}
                className="absolute w-[400px] h-[400px] border border-white/5 rounded-full"
            />
        </div>
    )
}
