"use client";

import { FC, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, Star, Users, CheckCircle2, ChevronDown } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useExperiment } from "@/hooks/useExperiment";

interface MarketplaceHeroProps {
  onEnterMarket?: () => void;
  onJoinCommunity?: () => void;
}

export const MarketplaceHero: FC<MarketplaceHeroProps> = ({
  onEnterMarket,
  onJoinCommunity,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const heroCtaVariant = useExperiment('hero_cta_text');
  
  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || isMobile) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 30; 
      const y = (clientY / innerHeight - 0.5) * 30;
      setMousePosition({ x, y });
    };

    if (!isMobile) {
       window.addEventListener("mousemove", handleMouseMove);
    }
    
    return () => {
       window.removeEventListener("resize", checkMobile);
       window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[95vh] w-full flex items-center bg-[#0a0a0a] overflow-hidden pt-24 pb-16 selection:bg-blue-500/30"
    >
      {/* --- BACKGROUND EFFECTS --- */}
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      
      {/* Deep Glows */}
      <div className="absolute top-0 left-[20%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-[10%] w-[40%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative z-10 max-w-[1300px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        
        {/* --- LEFT: COPY & CTAs --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-7 max-w-xl relative z-20 pt-10 lg:pl-4"
        >
          {/* Subtle Glow Behind Headline */}
          <div className="absolute top-10 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Line 1: Label */}
          <motion.div variants={itemVariants} className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
            Expert-Led Commerce
          </motion.div>

          {/* Line 2 & 3 & 4: Headline */}
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-sm relative z-10">
            Stop Guessing.<br />
            Buy What Actually Works.<br />
            <span className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 tracking-normal mt-2 block">
              Tested By Experts, Powered By AI
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={itemVariants} className="text-zinc-400 text-lg leading-relaxed font-medium">
            Real reviews. Real discussions. No ads. Just trusted decisions.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-5 pt-3">
            <Button
              size="lg"
              onClick={onEnterMarket}
              className="group w-full sm:w-auto bg-white text-black hover:bg-zinc-100 rounded-full px-7 h-12 text-[15px] font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {heroCtaVariant === 'A' ? 'Explore Products' : 'Shop Top Gear'}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={onJoinCommunity}
              className="w-full sm:w-auto h-12 px-7 rounded-full border border-white/15 bg-transparent backdrop-blur-sm text-white hover:bg-white/5 hover:border-white/30 transition-all duration-300 text-[15px] font-bold active:scale-[0.98]"
            >
              {heroCtaVariant === 'A' ? 'Watch Reviews' : 'Join Communities'}
            </Button>
          </motion.div>

          {/* Clean Trust Line */}
          <motion.div variants={itemVariants} className="pt-6 text-[13px] font-medium text-zinc-500 flex items-center flex-wrap gap-2.5">
             <span className="flex items-center gap-1 text-zinc-300"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.8 rating</span>
             <span className="text-zinc-600">•</span>
             <span className="text-zinc-300">50K+ users</span>
             <span className="text-zinc-600">•</span>
             <span className="text-zinc-300">Verified by experts</span>
          </motion.div>
        </motion.div>

        {/* --- RIGHT: FLOATING PARALLAX CARDS --- */}
        <div className="relative w-full h-[500px] lg:h-[700px] flex items-center justify-center perspective-1000">
          <motion.div 
            animate={{ 
              x: isMobile ? 0 : mousePosition.x * -1, 
              y: isMobile ? 0 : mousePosition.y * -1,
              rotateY: isMobile ? 0 : mousePosition.x * 0.5,
              rotateX: isMobile ? 0 : mousePosition.y * 0.5,
            }}
            transition={{ type: "spring", stiffness: 70, damping: 30 }}
            className="relative w-full h-full flex items-center justify-center transform-style-3d"
          >
            {/* Card 1 (Top Left) */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: -8 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              whileHover={{ scale: 1.05, rotate: -2, zIndex: 40 }}
              className="absolute left-[5%] top-[15%] w-[260px] bg-[#111] border border-white/10 rounded-[1.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-20 cursor-pointer group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative rounded-xl overflow-hidden mb-4">
                 <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600" className="w-full h-[160px] object-cover transition-transform duration-700 group-hover:scale-110" alt="Audio Setup" />
                 <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9
                 </div>
              </div>
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=12" loading="lazy" className="w-8 h-8 rounded-full border-2 border-[#111] object-cover" alt="Curator" />
                <div className="flex flex-col">
                   <span className="text-sm font-bold text-white line-clamp-1">"Unbeatable clarity"</span>
                   <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Audio Expert</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2 (Center Main) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 2 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 50, boxShadow: "0 0 80px rgba(96,165,250,0.2)" }}
              className="absolute z-30 w-[300px] bg-gradient-to-b from-[#161618] to-[#0a0a0a] border border-white/10 rounded-[1.5rem] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.9)] backdrop-blur-3xl cursor-pointer group"
            >
              <div className="absolute -inset-[1px] rounded-[1.5rem] bg-gradient-to-b from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <div className="relative rounded-xl overflow-hidden mb-4">
                 <img src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800" className="w-full h-[200px] object-cover transition-transform duration-700 group-hover:scale-105" alt="Product Main" />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                 <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-lg">
                    <CheckCircle2 className="w-3 h-3" /> Expert Pick
                 </div>
              </div>
              <h3 className="text-white font-bold text-lg leading-tight mb-1">Productivity Setup Pro</h3>
              <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                 <Users className="w-3.5 h-3.5" /> Verified by 14 Curators
              </p>
            </motion.div>

            {/* Card 3 (Bottom Right) */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: 40, rotate: 10 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 8 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.05, rotate: 4, zIndex: 40 }}
              className="absolute right-[5%] bottom-[10%] w-[240px] bg-[#111] border border-white/10 rounded-[1.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-10 cursor-pointer group"
            >
               <div className="relative rounded-xl overflow-hidden mb-4">
                 <img src="https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?q=80&w=600" className="w-full h-[140px] object-cover transition-transform duration-700 group-hover:scale-110" alt="Workspace" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 shrink-0">
                  <img src="https://i.pravatar.cc/100?img=33" loading="lazy" className="w-7 h-7 rounded-full border-2 border-[#111] object-cover" alt="Curator" />
                  <img src="https://i.pravatar.cc/100?img=47" loading="lazy" className="w-7 h-7 rounded-full border-2 border-[#111] object-cover" alt="Curator" />
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-[#111] flex items-center justify-center text-[8px] font-bold text-white">+5</div>
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-white">Highly Rated</span>
                   <span className="text-[10px] text-zinc-500 font-medium">Workspace Gear</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* Scroll Indicator */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 1.5, duration: 1 }}
         className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
         <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Scroll</span>
         <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
         >
            <ChevronDown className="w-4 h-4 text-zinc-500" />
         </motion.div>
      </motion.div>
    </section>
  );
};