"use client";

import { motion } from "framer-motion";
import { Star, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    quote: "I've reviewed audio gear for 15 years. This is the first platform where I feel my detailed breakdowns actually matter.",
    author: "Marcus H.",
    role: "Senior Audio Engineer",
    initials: "MH",
    color: "from-blue-500/30 to-purple-500/20",
    verified: true,
  },
  {
    quote: "Finally, a place where a 5-star rating isn't bought. If verified experts say it's good, I know it's good.",
    author: "Sarah L.",
    role: "Professional Chef",
    initials: "SL",
    color: "from-emerald-500/30 to-teal-500/20",
    verified: true,
  },
  {
    quote: "Trodec killed buyer's remorse for me. I only buy from the curated expert lists now.",
    author: "Davide R.",
    role: "Cinematographer",
    initials: "DR",
    color: "from-orange-500/30 to-red-500/20",
    verified: true,
  },
];

export function SocialProofSection() {
  return (
    <section className="py-24 bg-[#070707] relative border-y border-white/[0.05]">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_50%,rgba(16,185,129,0.04),transparent)] pointer-events-none" />

      <div className="container px-5 md:px-6 relative z-10">

        {/* Heading */}
        <div className="text-center mb-16 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500">
            Trusted by Professionals
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Voices of the Vanguard
          </h2>
          <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Real experts. Real validation. No fluff.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="group flex flex-col p-7 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[15px] leading-relaxed text-zinc-300 flex-grow mb-7">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto">
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} border border-white/10 flex items-center justify-center shrink-0`}
                >
                  <span className="text-[11px] font-black text-white">{t.initials}</span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white text-sm flex items-center gap-1.5 truncate">
                    {t.author}
                    {t.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium mt-0.5 truncate">
                    {t.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof strip */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-center">
          {[
            { value: "5,000+", label: "Verified Users" },
            { value: "200+", label: "Expert Reviewers" },
            { value: "98%", label: "Satisfaction Rate" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black text-white tracking-tight">{stat.value}</span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
