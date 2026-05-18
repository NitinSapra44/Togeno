"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShoppingBag, Beaker, Building2, ArrowUpRight } from "lucide-react";

const roles = [
    {
        title: "Consumers",
        body: "Buy only what has been proven, not promoted. Stop guessing.",
        icon: ShoppingBag,
        gradient: "from-blue-500/20 to-transparent",
        color: "text-blue-400",
        border: "group-hover:border-blue-500/50"
    },
    {
        title: "Experts",
        body: "Test products rigorously. Define the standards that decide credibility.",
        icon: Beaker,
        gradient: "from-purple-500/20 to-transparent",
        color: "text-purple-400",
        border: "group-hover:border-purple-500/50"
    },
    {
        title: "Brands",
        body: "Earn trust through evidence. Let product performance drive sales.",
        icon: Building2,
        gradient: "from-emerald-500/20 to-transparent",
        color: "text-emerald-400",
        border: "group-hover:border-emerald-500/50"
    },
];

export function WhoSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section ref={containerRef} className="py-32 relative overflow-hidden bg-[#050505]">
            {/* Background Light Lines */}
            <div className="absolute inset-0 pointer-events-none">
                <BackgroundLines />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="mx-auto max-w-6xl space-y-20">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center md:text-left border-l-2 border-zinc-800 pl-6"
                    >
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
                            Built for those who
                            <span className="block text-zinc-500 mt-2">demand the truth.</span>
                        </h2>
                    </motion.div>

                    <div className="grid gap-6 sm:grid-cols-3">
                        {roles.map((item, i) => (
                            <RoleCard key={item.title} item={item} index={i} />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}

function RoleCard({ item, index }: { item: typeof roles[0]; index: number }) {
    const Icon = item.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
            className={`group relative rounded-3xl border border-white/5 bg-zinc-900/10 backdrop-blur-sm p-8 hover:bg-zinc-900/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden ${item.border}`}
        >
            {/* Hover Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Light Beam Effect on Hover */}
            <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-gradient-to-b from-white/5 to-transparent rotate-45 translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-2">
                        {item.title}
                    </h3>

                    <p className="text-zinc-400 leading-relaxed text-sm group-hover:text-zinc-300 transition-colors">
                        {item.body}
                    </p>
                </div>

                <div className={`mt-8 flex items-center gap-2 text-xs font-mono uppercase tracking-widest ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0`}>
                    Join Protocol <ArrowUpRight className="w-3 h-3" />
                </div>
            </div>
        </motion.div>
    )
}

function BackgroundLines() {
    return (
        <div className="absolute inset-0 overflow-hidden opacity-30">
            {/* Vertical Lines */}
            <div className="absolute left-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
            <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
            <div className="absolute right-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />

            {/* Moving Light Beads */}
            <motion.div
                animate={{ y: ["-100%", "100%"] }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 2 }}
                className="absolute left-[10%] top-0 w-px h-32 bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-50"
            />
            <motion.div
                animate={{ y: ["-100%", "100%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute left-[50%] top-0 w-px h-32 bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-50"
            />
            <motion.div
                animate={{ y: ["-100%", "100%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 4 }}
                className="absolute right-[10%] top-0 w-px h-32 bg-gradient-to-b from-transparent via-emerald-500 to-transparent opacity-50"
            />
        </div>
    )
}
