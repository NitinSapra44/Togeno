import { FC } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface MarketplaceFinalCTAProps {
  onSignUp?: () => void;
}

export const MarketplaceFinalCTA: FC<MarketplaceFinalCTAProps> = ({ onSignUp }) => {
  return (
    <section className="relative w-full py-32 md:py-48 overflow-hidden bg-[#0a0a0a] border-t border-white/5">
      {/* High-Impact Cinematic Gradient Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0a] to-[#0a0a0a] bg-[length:200%_200%]"
        />
        
        {/* Subtle Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[1000px] h-[400px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent rounded-[100%] blur-[120px] mix-blend-screen pointer-events-none" />
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-4xl text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col items-center space-y-10">
            
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-zinc-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
              Start Your Journey
            </div>

            <div className="relative">
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] py-2">
                Stop guessing. <br className="hidden md:block" /> Start buying smart.
              </h2>
            </div>
            
            <p className="text-lg md:text-xl text-zinc-400 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
              Join a curated network of experts and passionate consumers. Make every purchase count.
            </p>
            
            <div className="pt-6 w-full max-w-sm mx-auto">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={onSignUp}
                  className="w-full h-16 rounded-full font-semibold text-lg text-black bg-white shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:bg-gray-200 hover:shadow-[0_20px_40px_rgba(255,255,255,0.25)] transition-all duration-300"
                >
                  Explore Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </section>
  );
};

