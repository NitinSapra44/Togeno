"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useModalStore } from "@/stores/modal.store";

interface VideoCardProps {
  id: string;
  name: string;
  rating: number;
  tagline: string;
  author: string;
  views: number;
  image: string;
  productImage: string;
}

const mockVideos: VideoCardProps[] = [
  {
    id: "1",
    name: "Restoring a 1965 Chronograph",
    rating: 9.8,
    tagline: "The hidden beauty of vintage.",
    author: "Marcus Chen",
    views: 12400,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1200",
    productImage: "https://images.unsplash.com/photo-1524592094714-cb9c5e405206?q=80&w=400",
  },
  {
    id: "2",
    name: "Perfect Espresso Extraction",
    rating: 9.6,
    tagline: "Science meets coffee.",
    author: "Coffee Artisans",
    views: 8900,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200",
    productImage: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=400",
  },
  {
    id: "3",
    name: "Minimalist Tech: Design",
    rating: 9.9,
    tagline: "Tech that disappears.",
    author: "Tech Atelier",
    views: 15200,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200",
    productImage: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400",
  },
  {
    id: "4",
    name: "The Ultimate Desk Setup",
    rating: 9.7,
    tagline: "Productivity redefined.",
    author: "Workspace Setup",
    views: 22100,
    image: "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?q=80&w=1200",
    productImage: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400",
  }
];

export const MarketplaceTrendingVideos: FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useModalStore();

  const handleVideoClick = () => {
    if (!isAuthenticated) {
      openLoginModal({ message: "Login to watch videos and explore products" });
      return;
    }
    router.push("/consumer/products"); // Or route to a specific video/review page
  };

  return (
    <section className="py-24 relative z-10 w-full overflow-hidden bg-[#0a0a0a]">
      <div className="max-w-[1200px] mx-auto px-6">

        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Expert Video Reviews
            </h2>
            <p className="text-zinc-400 text-lg font-light tracking-wide leading-relaxed">
              Watch deep dives and rigorous testing from verified industry professionals.
            </p>
          </div>

          <Button variant="ghost" className="text-zinc-400 hover:text-white hidden md:flex items-center gap-2 hover:bg-white/5 rounded-full px-6 py-2 text-sm font-semibold transition-all group border border-transparent hover:border-white/10">
            View All Reviews <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* ===== NETFLIX STYLE HORIZONTAL SCROLL ===== */}
        <div className="flex overflow-x-auto pb-10 -mx-6 px-6 snap-x snap-mandatory gap-6 hide-scrollbar relative">
          
          {mockVideos.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onClick={handleVideoClick}
              className="flex-none w-[320px] lg:w-[420px] snap-center group relative flex flex-col bg-[#111] border border-white/5 rounded-[1.5rem] overflow-hidden hover:border-white/20 transition-all duration-300 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* ===== VIDEO PREVIEW ===== */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#0a0a0a]">
                {/* Thumbnail Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                {/* Deep Dark Gradients for Premium Feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                
                {/* Center Play Button & Title Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div 
                    className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 mb-4"
                  >
                    <div className="w-0 h-0 border-l-[14px] border-l-white border-y-[9px] border-y-transparent ml-1" />
                  </div>
                  <h3 className="text-white font-bold text-2xl leading-tight line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {item.name}
                  </h3>
                </div>
              </div>

              {/* ===== VIDEO INFO ===== */}
              <div className="p-6 flex flex-col flex-1 relative z-10 bg-[#111]">
                <div className="flex-1 mb-4">
                  <h3 className="text-white font-bold text-xl leading-tight line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                    {item.tagline}
                  </h3>
                  <p className="text-sm text-zinc-400 font-medium flex items-center gap-2">
                    {item.author} <span className="opacity-50">•</span> {(item.views / 1000).toFixed(1)}K views
                  </p>
                </div>

                {/* ===== TAGGED PRODUCT CARD ===== */}
                <div className="mt-auto pt-4 border-t border-white/10 relative">
                  <div className="flex items-center justify-between cursor-pointer group/product">
                    {/* Left: Image & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-inner group-hover/product:border-white/30 transition-colors">
                        <img src={item.productImage} loading="lazy" decoding="async" className="w-full h-full object-cover" alt="Tagged product" />
                      </div>
                      
                      <div className="min-w-0 text-left">
                        <p className="text-white text-sm font-bold truncate tracking-tight group-hover/product:text-blue-400 transition-colors">{item.name}</p>
                        <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                          Featured Product
                        </p>
                      </div>
                    </div>

                    {/* Right: Rating Badge */}
                    <div className="shrink-0 flex items-center justify-center bg-white/5 text-white text-xs font-bold px-2 py-1.5 rounded-lg border border-white/10 gap-1 group-hover/product:bg-white/10 transition-colors shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {item.rating.toFixed(1)}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}

        </div>
        
        {/* Mobile secondary CTA */}
        <div className="mt-6 flex justify-center md:hidden">
          <Button variant="ghost" className="text-zinc-400 hover:text-white flex items-center gap-2 hover:bg-white/5 rounded-full px-6 py-3 text-sm font-semibold transition-all group border border-white/5">
            View All Reviews <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

      </div>
      
      {/* Required style to hide scrollbar on mobile scroll view */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};
