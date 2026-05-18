"use client";

import { Button, Card, CardContent, Separator, Input } from "@/components/ui";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Flame,
  Heart,
  CheckCircle2,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderService from "@/services/order.service";

const FREE_SHIPPING_THRESHOLD = 50;

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "success" | "invalid">("idle");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPct: number; label: string } | null>(null);

  const discountAmount = appliedPromo ? (subtotal * appliedPromo.discountPct) / 100 : 0;
  const total = subtotal - discountAmount;

  const remainingForFreeShipping =
    subtotal < FREE_SHIPPING_THRESHOLD
      ? FREE_SHIPPING_THRESHOLD - subtotal
      : 0;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoStatus("loading");
    try {
      const promo = await OrderService.validatePromo(promoCode.trim());
      setAppliedPromo(promo);
      setPromoStatus("success");
    } catch {
      setAppliedPromo(null);
      setPromoStatus("invalid");
      setTimeout(() => setPromoStatus("idle"), 3000);
    }
  };


  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Your Cart</h1>
          <p className="text-gray-400 mt-2 font-medium">
            Review your premium selections before checkout.
          </p>
        </div>

        {items.length > 0 && (
          <Button
            variant="ghost"
            className="text-red-400 hover:bg-red-400/10"
            onClick={() => items.forEach((i) => removeFromCart(i.id, i.selectedSize))}
          >
            Clear Cart
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">

        {/* LEFT SIDE - ITEMS */}
        <div className="lg:col-span-2 space-y-8">

          {items.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-3 rounded-xl mb-4">
              <Flame className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold tracking-wide flex-1 mr-2">Items in your cart are in high demand. Checkout now before stock runs out!</p>
            </div>
          )}

          <div className="space-y-4">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card
                    className="group relative bg-[#0f0f10] border border-white/10 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-300 rounded-3xl overflow-hidden hover:bg-[#141416]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    
                    <CardContent className="p-5 md:p-6 flex flex-col sm:flex-row gap-5 md:gap-6 relative z-10">

                      {/* IMAGE */}
                      <div className="w-full sm:w-32 h-32 rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {item.images?.[0]?.imageUrl ? (
                          <img
                            src={item.images[0].imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-gray-700" />
                        )}
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 flex flex-col justify-between">

                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div>
                             <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                               {item.name}
                             </h3>
                             <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-xs text-gray-500 font-medium tracking-wide lowercase">Expert verified • {item.category?.name || item.brand?.brandName || 'Accessory'}</span>
                                {item.selectedSize && (
                                  <span className="text-xs font-bold text-white bg-white/10 border border-white/15 px-2 py-0.5 rounded-md">Size: {item.selectedSize}</span>
                                )}
                             </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-2xl font-black text-white">
                              ₹{item.price.toFixed(2)}
                            </p>
                            <p className="text-xs font-semibold text-emerald-400 mt-1">
                              In Stock
                            </p>
                          </div>
                        </div>

                        {/* QUANTITY & ACTIONS */}
                        <div className="flex flex-wrap sm:flex-nowrap justify-between items-end gap-4 mt-6 pt-5 border-t border-white/[0.05]">
                          
                          {/* QUICK ACTIONS */}
                           <div className="flex items-center gap-4 text-xs font-semibold">
                              <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                                 <Heart className="w-4 h-4" /> Save for later
                              </button>
                             <button
                               onClick={() => removeFromCart(item.id, item.selectedSize)}
                               className="flex items-center gap-1.5 text-red-500 hover:text-red-400 transition-colors"
                             >
                                <Trash2 className="w-4 h-4" /> Remove
                             </button>
                          </div>

                           {/* PILL QUANTITY SELECTOR */}
                           <div className="flex items-center bg-black border border-white/10 rounded-full p-1 w-fit group-hover:border-white/20 transition-colors">
                            <Button
                              variant="ghost"
                              className="h-10 w-10 sm:h-8 sm:w-8 rounded-full p-0 flex items-center justify-center bg-black/40 hover:bg-white hover:text-black transition-colors"
                              disabled={item.quantity <= 1}
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                            >
                              <Minus className="w-5 h-5 sm:w-4 sm:h-4" />
                            </Button>

                            <span className="w-12 sm:w-10 text-center font-bold text-base sm:text-sm text-white">
                              {item.quantity}
                            </span>

                            <Button
                              variant="ghost"
                              className="h-10 w-10 sm:h-8 sm:w-8 rounded-full p-0 flex items-center justify-center bg-black/40 hover:bg-white hover:text-black transition-colors"
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                            >
                              <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                            </Button>
                          </div>

                        </div>

                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>


          {/* EMPTY STATE */}
          {items.length === 0 && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
               className="flex flex-col items-center justify-center text-center py-32 bg-[#050505] border border-white/[0.05] rounded-[3rem]"
            >
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <ShoppingBag className="w-10 h-10 text-gray-500" />
               </div>
               <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                 Your cart is empty
               </h2>
               <p className="text-gray-400 mb-8 max-w-sm">
                 Looks like you haven't added anything yet. Discover curated products from our experts.
               </p>
              <Button
                className="bg-white text-black hover:bg-zinc-200 font-bold h-14 px-10 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95 transition-all text-base"
                onClick={() => router.push("/consumer/products")}
              >
                Explore Products
              </Button>
            </motion.div>
          )}

        </div>

        {/* RIGHT SIDE - SUMMARY */}
        {items.length > 0 && (
          <div className="lg:col-span-1">
            <Card className="sticky top-28 bg-[#141416] backdrop-blur-3xl shadow-2xl border border-white/10 rounded-[2rem] overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
              <CardContent className="p-8 space-y-7 relative z-10">

                <h2 className="text-2xl font-bold text-white">
                  Order Summary
                </h2>

                <div className="space-y-4">

                  <div className="flex justify-between items-center text-gray-400 font-medium">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Subtotal</span>
                    <span className="text-white">₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-400 font-medium">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Shipping</span>
                    {remainingForFreeShipping > 0 ? (
                       <span className="text-white font-semibold">TBD</span>
                    ) : (
                       <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border border-emerald-500/20">Free Shipping</span>
                    )}
                  </div>

                  {appliedPromo && (
                    <div className="flex justify-between items-center text-emerald-400 font-medium">
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Promo ({appliedPromo.code})</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {remainingForFreeShipping > 0 && (
                    <div className="w-full bg-white/5 rounded-full h-2 mt-2 mb-1 overflow-hidden">
                       <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${(subtotal / FREE_SHIPPING_THRESHOLD) * 100}%` }} />
                    </div>
                  )}
                   {remainingForFreeShipping > 0 && (
                    <p className="text-xs text-gray-400">Add <span className="text-white font-bold">₹{remainingForFreeShipping.toFixed(2)}</span> more to unlock free shipping.</p>
                  )}

                  <Separator className="bg-white/10 my-6" />

                  <div className="flex justify-between items-end">
                    <span className="text-lg text-gray-400 font-semibold">Total</span>
                    <span className="text-4xl font-black text-white tracking-tighter">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* TRUST BADGES */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 mt-6">
                   <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure encrypted checkout
                   </div>
                   <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
                      <RotateCcw className="w-4 h-4 text-emerald-400" /> 30-Day money-back guarantee
                   </div>
                   <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
                      <ShoppingBag className="w-4 h-4 text-emerald-400" /> Free returns on native orders
                   </div>
                </div>

                {/* PROMO */}
                <div className="pt-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Promo code"
                      className={`bg-black/50 h-12 rounded-xl text-white outline-none focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-white/30 transition-all ${
                         promoStatus === "success" ? "border-emerald-500/50 focus-visible:ring-emerald-500/30" :
                         promoStatus === "invalid" ? "border-red-500/50 focus-visible:ring-red-500/30" :
                         "border-white/10"
                      }`}
                      value={promoCode}
                      disabled={promoStatus === "success"}
                      onChange={(e) => setPromoCode(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleApplyPromo(); }}
                    />
                    {promoStatus === "success" ? (
                      <Button
                        variant="outline"
                        onClick={() => { setAppliedPromo(null); setPromoCode(""); setPromoStatus("idle"); }}
                        className="h-12 px-4 rounded-xl border-white/10 text-red-400 hover:bg-red-500/10 border font-bold transition-colors"
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleApplyPromo}
                        disabled={promoStatus === "loading"}
                        className="h-12 px-6 rounded-xl border-white/10 text-white hover:bg-white border hover:text-black font-bold transition-colors"
                      >
                        {promoStatus === "loading" ? "..." : "Apply"}
                      </Button>
                    )}
                  </div>
                  {promoStatus === "success" && appliedPromo && (
                     <p className="text-xs text-emerald-400 mt-2 font-semibold">{appliedPromo.label} applied!</p>
                  )}
                  {promoStatus === "invalid" && (
                     <p className="text-xs text-red-400 mt-2 font-semibold">Invalid or expired promo code.</p>
                  )}
                </div>

                {/* CHECKOUT BUTTON */}
                <Button
                  className="w-full h-14 text-lg font-bold bg-white text-black rounded-xl hover:bg-gray-200 mt-4 group transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => router.push("/consumer/checkout")}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>

              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* MOBILE STICKY BOTTOM CHECKOUT */}
      {items.length > 0 && (
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+64px)] left-0 right-0 z-30 lg:hidden bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 p-4 flex justify-between items-center shadow-[0_-20px_40px_rgba(0,0,0,0.7)]">
          <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                 <ShieldCheck className="w-3 h-3 text-emerald-400" />
                 <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Secure</span>
              </div>
              <span className="text-2xl font-black text-white leading-none">
                ₹{total.toFixed(2)}
              </span>
           </div>
          <Button
            className="bg-white text-black hover:bg-zinc-200 font-bold rounded-xl h-12 px-8 active:scale-95 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
            onClick={() => router.push("/consumer/checkout")}
          >
            Checkout <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

    </div>
  );
}
