"use client";

import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";

const experts = [
  {
    name: "Sarah Jenkins",
    niche: "Tech & Gadgets",
    quote: "I only recommend what I personally use and rigorously test. Hype doesn't last, quality does.",
    image: "https://i.pravatar.cc/150?img=47",
    followers: "124K",
  },
  {
    name: "Marcus Chen",
    niche: "Fitness Gear",
    quote: "Most supplements are snake oil. I'm here to find the 1% that actually move the needle.",
    image: "https://i.pravatar.cc/150?img=11",
    followers: "89K",
  },
  {
    name: "Elena Rodriguez",
    niche: "Home Office Setup",
    quote: "Your environment dictates your output. Let's build workspaces that inspire.",
    image: "https://i.pravatar.cc/150?img=32",
    followers: "210K",
  },
];

export function ExpertSpotlight() {
  return (
    <section className="w-full bg-[#0a0a0a] py-24 relative z-20 overflow-hidden border-t border-white/5">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-wider uppercase border border-blue-500/20">
              Expert Network
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Meet the Experts
            </h2>
            <p className="text-zinc-400 text-lg">
              Industry veterans who separate the signal from the noise.
            </p>
          </div>
          <button className="text-sm font-semibold text-white hover:text-blue-400 transition-colors bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-full border border-white/10 shrink-0">
            View All Expert
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {experts.map((expert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative bg-[#111] border border-white/[0.08] rounded-2xl p-6 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#111] ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all duration-300">
                    <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
                  </div>
                  <BadgeCheck className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-400 bg-[#111] rounded-full" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">{expert.name}</h3>
                  <div className="text-sm text-blue-400 font-medium">{expert.niche}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{expert.followers} Followers</div>
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-zinc-300 italic leading-relaxed text-sm">
                  "{expert.quote}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
