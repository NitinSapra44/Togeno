"use client";

import { useRef, useState, useEffect } from "react";
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    useMotionValue,
    useMotionTemplate,
    AnimatePresence,
} from "framer-motion";

export function ScrollBreakSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        mouseX.set(clientX / innerWidth - 0.5);
        mouseY.set(clientY / innerHeight - 0.5);
    };

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 60,
        damping: 20,
        mass: 0.5,
    });

    const y = useTransform(smoothProgress, [0, 1], [100, -100]);
    const opacity = useTransform(smoothProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0]);
    const scale = useTransform(smoothProgress, [0.1, 0.5], [0.9, 1]);

    const [glitchActive, setGlitchActive] = useState(false);

    useEffect(() => {
        const unsubscribe = smoothProgress.on("change", (v) => {
            if (v > 0.3 && v < 0.6) {
                if (!glitchActive) setGlitchActive(true);
            } else {
                if (glitchActive) setGlitchActive(false);
            }
        });
        return () => unsubscribe();
    }, [smoothProgress, glitchActive]);

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[#050505] perspective-1000 -mt-42"
        >
            {/* Dynamic Background Lines */}
            <ScanningLines />

            {/* Background Construct Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            {/* Floating Infrastructure Blocks with Content */}
            <InfrastructureBlock
                mouseX={mouseX}
                mouseY={mouseY}
                scrollProgress={smoothProgress}
                depth={20}
                className="top-[20%] left-[15%] w-32 h-32 border-emerald-500/20"
                delay={0}
            >
                <div className="text-[8px] font-mono text-emerald-500/60 p-2 space-y-1">
                    <div>STATUS: ONLINE</div>
                    <div>UPTIME: 99.99%</div>
                    <div className="w-full h-1 bg-emerald-500/20 mt-2 relative overflow-hidden">
                        <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-emerald-500/50"
                        />
                    </div>
                </div>
            </InfrastructureBlock>

            <InfrastructureBlock
                mouseX={mouseX}
                mouseY={mouseY}
                scrollProgress={smoothProgress}
                depth={-15}
                className="bottom-[25%] right-[10%] w-40 h-40 border-purple-500/20"
                delay={0.2}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 border border-purple-500/10 rounded-full animate-[spin_10s_linear_infinite] border-t-purple-500/50" />
                    <div className="absolute text-[8px] font-mono text-purple-500/60">ANALYZING</div>
                </div>
            </InfrastructureBlock>

            <InfrastructureBlock
                mouseX={mouseX}
                mouseY={mouseY}
                scrollProgress={smoothProgress}
                depth={10}
                className="top-[60%] left-[8%] w-24 h-24 border-blue-500/20 hidden md:flex items-center justify-center"
                delay={0.4}
            >
                <div className="grid grid-cols-3 gap-1 opacity-30">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
            </InfrastructureBlock>

            {/* Random Data Elements */}
            <DataFloaters />

            {/* Central Content */}
            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    style={{ opacity, y, scale }}
                    className="text-center relative"
                >
                    {/* Center Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

                    <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold leading-none tracking-tighter text-white mb-6">
                        Trust is not a feature.
                    </h2>

                    <div className="relative inline-block">
                        <motion.span
                            className={`block text-4xl sm:text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-400 ${glitchActive ? "animate-[pulse_0.1s_ease-in-out_infinite]" : ""}`}
                        >
                            It’s infrastructure.
                        </motion.span>

                        {/* Glitch Overlay */}
                        {glitchActive && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0, 1, 0], x: [-2, 2, -2, 0] }}
                                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.1 }}
                                className="absolute inset-0 text-emerald-500/30 blur-[2px] translate-x-[2px] mix-blend-screen"
                            >
                                It’s infrastructure.
                            </motion.span>
                        )}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-8 font-mono text-xs text-zinc-500 tracking-[0.3em] uppercase"
                    >
                        System Integrity :: Verified
                    </motion.div>
                </motion.div>
            </div>

            {/* Blurry foreground elements */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

        </section>
    );
}

// --- Sub-components ---

function InfrastructureBlock({
    mouseX,
    mouseY,
    scrollProgress,
    depth,
    className,
    delay,
    children
}: {
    mouseX: any;
    mouseY: any;
    scrollProgress: any;
    depth: number;
    className?: string;
    delay: number;
    children?: React.ReactNode;
}) {
    const x = useTransform(mouseX, [-0.5, 0.5], [-depth, depth]);
    const y = useTransform(mouseY, [-0.5, 0.5], [-depth, depth]);
    const scrollY = useTransform(scrollProgress, [0, 1], [depth * 3, -depth * 3]);
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [-15, 15]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

    return (
        <motion.div
            style={{ x, y: useMotionTemplate`calc(${y}px + ${scrollY}px)`, rotateX, rotateY }}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay, ease: "easeOut" }}
            className={`absolute flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] backdrop-blur-[2px] rounded-2xl shadow-2xl overflow-hidden ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
            <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">{children}</div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
        </motion.div>
    );
}

function ScanningLines() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent blur-[1px]"
            />
            <motion.div
                animate={{ top: ["100%", "0%"] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/10 to-transparent blur-[1px]"
            />
        </div>
    )
}

function DataFloaters() {
    return (
        <>
            <motion.div
                style={{ top: "15%", right: "20%" }}
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute font-mono text-[9px] text-zinc-600 tracking-widest hidden lg:block"
            >
                MX-992 // NODE_SYNC
            </motion.div>
            <motion.div
                style={{ bottom: "20%", left: "10%" }}
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute font-mono text-[9px] text-zinc-600 tracking-widest hidden lg:block"
            >
                PROTOCOL::V4.22
            </motion.div>
        </>
    )
}
