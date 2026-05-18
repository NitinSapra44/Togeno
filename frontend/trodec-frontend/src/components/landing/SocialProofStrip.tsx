"use client";

import { motion } from "framer-motion";
import { Star, ShoppingBag, Users } from "lucide-react";

export function SocialProofStrip() {
  return (
    <div className="w-full border-y border-white/5 bg-[#0a0a0a] relative z-20 py-6 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Trusted By Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4"
        >
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="w-10 h-10 rounded-full border-2 border-[#0a0a0a] bg-zinc-800 overflow-hidden"
              >
                <img 
                  src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                  alt="Expert avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm">Trusted by 12,000+ experts</span>
            <span className="text-zinc-500 text-xs">Curating the best products</span>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-8 text-zinc-400"
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-white">4.8</span>
            <span className="text-sm">avg rating</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">25K+</span>
            <span className="text-sm">purchases</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
          <div className="items-center gap-2 hidden sm:flex">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-white">50K+</span>
            <span className="text-sm">users</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
