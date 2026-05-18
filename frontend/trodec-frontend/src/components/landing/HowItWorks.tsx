"use client";

import { motion, Variants } from "framer-motion";
import { ShieldCheck, MessageCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useModalStore } from "@/stores/modal.store";

export function HowItWorks() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useModalStore();

  const handleNavigation = (path: string) => {
    if (!isAuthenticated) {
      openLoginModal({
        message: "Login to explore Trodec",
        onComplete: () => router.push(path),
      });
    } else {
      router.push(path);
    }
  };

  const steps = [
    {
      icon: <ShieldCheck className="w-7 h-7 text-emerald-400" />,
      title: "Experts review products",
      description: "Verified creators rigorously test and review products in their niche, filtering out the noise.",
      badge: "VERIFIED EXPERTS",
      badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      path: "/consumer/products",
      extra: (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.04]">
          <div className="flex -space-x-2">
            <img src="https://i.pravatar.cc/100?img=11" loading="lazy" className="w-6 h-6 rounded-full border border-[#0f0f0f] object-cover" alt="Expert" />
            <img src="https://i.pravatar.cc/100?img=32" loading="lazy" className="w-6 h-6 rounded-full border border-[#0f0f0f] object-cover" alt="Expert" />
            <img src="https://i.pravatar.cc/100?img=44" loading="lazy" className="w-6 h-6 rounded-full border border-[#0f0f0f] object-cover" alt="Expert" />
          </div>
          <span className="text-[11px] font-semibold text-zinc-500 tracking-wider uppercase">Active Curators</span>
        </div>
      )
    },
    {
      icon: <MessageCircle className="w-7 h-7 text-blue-400" />,
      title: "Community discusses honestly",
      description: "Real users share their unvarnished experiences, creating a transparent feedback loop.",
      badge: "ACTIVE COMMUNITIES",
      badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      path: "/consumer/communities",
      extra: (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.04]">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-400/90 bg-orange-400/10 px-2.5 py-1 rounded-full">
            🔥 120+ discussions today
          </span>
        </div>
      )
    },
    {
      icon: <ShoppingBag className="w-7 h-7 text-purple-400" />,
      title: "You buy confidently",
      description: "Make informed decisions backed by authentic consensus, not algorithmic hype.",
      badge: "INFORMED PURCHASES",
      badgeColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
      path: "/consumer/products",
      extra: (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.04]">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Backed by real reviews, not ads
          </span>
        </div>
      )
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="w-full bg-[#0a0a0a] py-28 relative z-20 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="text-center mb-16 md:mb-20 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500 mb-2">The Process</p>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            How Trodec Works
          </h2>
          <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Our AI-powered system ensures experts provide rigorous, unbiased product feedback — so you can buy with confidence.
          </p>
        </div>

        <motion.div 
           variants={containerVariants}
           initial="hidden"
           whileInView="show"
           viewport={{ once: true, margin: "-100px" }}
           className="relative"
        >
          {/* Horizontal Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[150px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                onClick={() => handleNavigation(step.path)}
                className="group relative bg-[#0f0f0f] border border-white/[0.08] rounded-3xl p-8 hover:-translate-y-2 hover:border-white/20 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col h-full active:scale-[0.98]"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Step Number Badge */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-[#141416] border border-white/10 flex items-center justify-center font-black text-white text-lg shadow-xl z-20">
                  {index + 1}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#141416] border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {step.icon}
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${step.badgeColor}`}>
                    {step.badge}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-blue-400 transition-colors duration-300">
                  {step.title}
                </h3>
                
                <p className="text-zinc-400 text-sm leading-relaxed mb-4 flex-1">
                  {step.description}
                </p>

                {step.extra}

                {/* Arrow Indicator on Hover */}
                <div className="absolute bottom-8 right-8 opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
