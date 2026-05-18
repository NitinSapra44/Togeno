"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft, Users, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCommunities, Community } from "@/services";
import { MarketplaceTrendingCommunities } from "@/components/landing/MarketplaceTrendingCommunities";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-24 space-y-24">
      {/* SUCCESS BANNER */}
      <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_40px_rgba(52,211,153,0.15)] relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-20"></div>
          <CheckCircle2 className="w-12 h-12 text-emerald-400 relative z-10" />
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-white">
          Order Confirmed
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl mb-10 font-medium leading-relaxed max-w-xl mx-auto">
          Thank you for your purchase! Your order <span className="text-white font-bold">#{orderNumber || "Pending"}</span> has been securely processed and is now being prepared.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 px-8 h-14 rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-base"
            onClick={() => router.push("/consumer/orders")}
          >
            View Order Status
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto border-white/10 hover:bg-white/5 px-8 h-14 rounded-xl font-bold transition-all text-base"
            onClick={() => router.push("/consumer/products")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Continue Browsing
          </Button>
        </div>
      </div>

      {/* WHAT'S NEXT FLOW */}
      <div className="max-w-5xl mx-auto space-y-10 px-4">
         <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">What's Next?</h2>
            <p className="text-gray-500 text-sm">Stay engaged with the community while we prepare your shipment.</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0f0f10] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all group cursor-pointer" onClick={() => router.push("/consumer/communities")}>
               <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
               </div>
               <h3 className="font-bold text-white mb-3 text-lg">Join Discussion</h3>
               <p className="text-sm text-gray-500 leading-relaxed mb-6 italic">"Talk to other builders who bought this item in the community."</p>
               <div className="flex items-center text-blue-400 text-xs font-black uppercase tracking-widest gap-2">
                  View Community <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
            
            <div className="bg-[#0f0f10] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all group cursor-pointer" onClick={() => router.push("/consumer/orders")}>
               <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6" />
               </div>
               <h3 className="font-bold text-white mb-3 text-lg">Write a Review</h3>
               <p className="text-sm text-gray-500 leading-relaxed mb-6">Share your experience once it arrives to earn 50 builder points.</p>
               <div className="flex items-center text-emerald-400 text-xs font-black uppercase tracking-widest gap-2">
                  Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>

            <div className="bg-[#0f0f10] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all group cursor-pointer" onClick={() => router.push("/consumer/orders")}>
               <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
               </div>
               <h3 className="font-bold text-white mb-3 text-lg">Track Shipments</h3>
               <p className="text-sm text-gray-500 leading-relaxed mb-6">Real-time GPS tracking will be available in your dashboard soon.</p>
               <div className="flex items-center text-purple-400 text-xs font-black uppercase tracking-widest gap-2">
                  Track Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
         </div>
      </div>

      {/* SUGGESTED COMMUNITIES SECTION */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <MarketplaceTrendingCommunities />
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
