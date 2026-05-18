"use client";

import type { FC } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { ArrowRight, ShieldCheck, Users, Zap, Search } from "lucide-react";

const About: FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-100/30 overflow-x-hidden">
      <main className="relative">

        {/* ================= HERO ================= */}
        <section className="relative min-h-[85vh] flex items-center justify-center border-b border-white/5 overflow-hidden">
          {/* Animated glow */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-1/3 left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(180,255,220,0.1),_transparent_60%)] blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,_rgba(100,100,255,0.08),_transparent_60%)] blur-[80px]" />
          </div>

          <div className="container mx-auto px-6 pt-20 pb-24 relative z-10">
            <div className="mx-auto max-w-5xl text-center space-y-8">
              <p className="text-xs uppercase tracking-[0.5em] text-zinc-400 animate-fade-in-up">
                Our Mission
              </p>

              <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-[1.05]">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500">
                  Trust is the only
                </span>
                <br />
                <span className="block text-zinc-600">currency left.</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed pt-4">
                We are building the definitive trust layer for modern commerce.
                Where products aren't just sold, they are <span className="text-emerald-400/80 font-medium">proven</span>.
              </p>

              <div className="flex justify-center gap-5 pt-8">
                <Button
                  size="lg"
                  className="bg-white text-black h-14 px-10 rounded-full font-bold hover:bg-zinc-200 transition-all hover:scale-105"
                  onClick={() => router.push("/contact")}
                >
                  Get in Touch
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= THE PROBLEM ================= */}
        <section className="py-32 border-b border-white/5 bg-[#070707]">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-6">
                    <Zap className="text-red-400 h-6 w-6" />
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
                    The internet broke <br />
                    <span className="text-zinc-500">how we buy.</span>
                  </h2>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                    Fake reviews. Sponsored "top 10" lists. Influencers paid to read scripts.
                    The signal-to-noise ratio in e-commerce has hit zero. Discovering quality
                    products has become an investigative job for the consumer.
                  </p>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                    We believe this is a structural failure. When visibility is for sale,
                    quality becomes irrelevant.
                  </p>
                </div>
                <div className="sticky top-24">
                  <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm overflow-hidden min-h-[400px] flex flex-col justify-center gap-6">
                    <div className="absolute top-0 right-0 p-32 bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="flex items-center gap-4 opacity-50">
                      <div className="h-2 w-24 bg-zinc-700 rounded-full" />
                      <div className="h-2 w-12 bg-zinc-800 rounded-full" />
                    </div>
                    <div className="flex items-center gap-4 opacity-40">
                      <div className="h-2 w-32 bg-zinc-700 rounded-full" />
                      <div className="h-2 w-8 bg-zinc-800 rounded-full" />
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium text-center">
                      "Best Product 2024" (Sponsored)
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium text-center">
                      ⭐⭐⭐⭐⭐ (Bot generated)
                    </div>
                    <div className="text-center text-zinc-500 text-xs uppercase tracking-widest mt-auto">
                      The Current Status Quo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= THE SOLUTION ================= */}
        <section className="py-32 border-b border-white/5">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="order-2 md:order-1">
                  <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm overflow-hidden min-h-[400px] flex flex-col justify-center gap-6">
                    <div className="absolute bottom-0 left-0 p-32 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <span className="text-emerald-100 font-medium">Expert Analysis</span>
                        <ShieldCheck className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <span className="text-emerald-100 font-medium">Owner Validation</span>
                        <Users className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <span className="text-emerald-100 font-medium">Transparent Data</span>
                        <Search className="h-5 w-5 text-emerald-400" />
                      </div>
                    </div>

                    <div className="text-center text-zinc-500 text-xs uppercase tracking-widest mt-auto">
                      The Trodec Standard
                    </div>
                  </div>
                </div>

                <div className="space-y-6 order-1 md:order-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6">
                    <ShieldCheck className="text-emerald-400 h-6 w-6" />
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
                    Proof replaces <br />
                    <span className="text-zinc-500">promotion.</span>
                  </h2>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                    We built an infrastructure where influence can't be bought.
                    Manufacturers must submit to rigorous expert testing and real-world
                    owner validation before they can sell.
                  </p>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                    The result? A catalog where every single item has earned its right
                    to be there. No ads. No placements. Just the best products.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= VALUES ================= */}
        <section className="py-32 bg-[#070707]">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center mb-20 space-y-4">
              <p className="text-xs uppercase tracking-[0.45em] text-zinc-400">
                Core Values
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold">
                What we stand for.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: "Radical Transparency",
                  desc: "We show the data. The good, the bad, and the ugly. If a product fails, we tell you why."
                },
                {
                  title: "Zero Incentives",
                  desc: "We do not take money for rankings. We do not accept sponsored posts. Our revenue comes from value, not visibility."
                },
                {
                  title: "Community First",
                  desc: "The voice of the owner outweighs the voice of the brand. Real experience is the ultimate validator."
                }
              ].map((item, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-emerald-200 transition-colors">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-32">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl text-center rounded-[3rem] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-white/10 px-12 py-24 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.05),_transparent_70%)]" />

              <h2 className="text-4xl sm:text-6xl font-bold relative z-10">
                Join the movement.
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto relative z-10">
                Whether you're a creator, an expert, or someone who just wants things that work — there is a place for you here.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 pt-4">
                <Button
                  size="lg"
                  className="bg-white text-black h-14 px-12 rounded-full font-bold hover:bg-zinc-200"
                  onClick={() => router.push("/consumer")}
                >
                  Start Browsing
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/10 bg-white/5 h-14 px-12 rounded-full font-semibold hover:bg-white/10"
                  onClick={() => router.push("/contact")}
                >
                  Partner with Us
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default About;
