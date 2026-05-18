"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from "framer-motion";
import { useRef, useEffect } from "react";
import { ShieldCheck, Lock, CheckCircle, ArrowRight } from "lucide-react";

export function FinalCTASection() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0.1, 0.5], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
    const y = useTransform(scrollYProgress, [0.1, 0.5], [100, 0]);

    // Mouse interactive effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        mouseX.set((clientX - left) / width - 0.5);
        mouseY.set((clientY - top) / height - 0.5);
    };

    return (
        <section
            ref={containerRef}
            className="py-12 relative overflow-hidden min-h-[80vh] flex items-center justify-center"
            onMouseMove={handleMouseMove}
        >

            <BackgroundConvergence />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    style={{ scale, opacity, y }}
                    className="mx-auto max-w-5xl text-center relative"
                >
                    {/* The Portal Card */}
                    <div className="relative rounded-[3rem] overflow-hidden group">

                        {/* Animated Border Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 opacity-50 blur-xl group-hover:opacity-100 transition-opacity duration-1000" />

                        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[3rem] px-6 sm:px-12 py-24 sm:py-32 overflow-hidden">

                            {/* Inner Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

                            {/* Floating Icons Background */}
                            <FloatingIcons />

                            <div className="relative z-10 space-y-10">

                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-4">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    System Ready
                                </div>

                                <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white">
                                    Ready to buy with <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                                        absolute proof?
                                    </span>
                                </h2>

                                <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                                    Join TRODEC. Use the only marketplace where every product earns its place through data, not ad spend.
                                </p>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="pt-8"
                                >
                                    <Button
                                        size="lg"
                                        className="relative group bg-white text-black h-20 px-16 rounded-full font-bold text-xl hover:bg-zinc-200 transition-all shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] overflow-hidden"
                                        onClick={() => router.push("/login")}
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Enter Verified Market <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>

                                        {/* Button Shine Effect */}
                                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent z-0" />
                                    </Button>
                                </motion.div>

                                <div className="pt-8 flex justify-center gap-8 text-xs text-zinc-500 font-mono tracking-widest uppercase">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" /> Verified
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-emerald-500" /> Secure
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Guaranteed
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function BackgroundConvergence() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Rays */}
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute left-1/2 top-1/2 w-[200vw] h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent origin-left"
                    style={{
                        transform: `translate(-50%, -50%) rotate(${i * 18}deg)`,
                    }}
                />
            ))}

            {/* Pulsing Center Glow */}
            <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial-gradient from-emerald-500/10 to-transparent blur-3xl opacity-30"
            />
        </div>
    )
}

function FloatingIcons() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FloatIcon icon={ShieldCheck} x="10%" y="20%" delay={0} />
            <FloatIcon icon={Lock} x="85%" y="15%" delay={1} />
            <FloatIcon icon={CheckCircle} x="20%" y="80%" delay={2} />
            <FloatIcon icon={ArrowRight} x="80%" y="70%" delay={3} />
        </div>
    )
}

function FloatIcon({ icon: Icon, x, y, delay }: { icon: any, x: string, y: string, delay: number }) {
    return (
        <motion.div
            style={{ left: x, top: y }}
            animate={{
                y: [0, -20, 0],
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.1, 1]
            }}
            transition={{ duration: 5, delay, repeat: Infinity, ease: "easeInOut" }}
            className="absolute text-white/5"
        >
            <Icon className="w-16 h-16 sm:w-24 sm:h-24" />
        </motion.div>
    )
}
