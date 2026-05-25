"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Package, TrendingUp, Flame, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui";
import { Product } from "@/services";
import { PostWithDetails } from "@/services/post.service";

interface PremiumProductCardProps {
  product: Product;
  expertPost?: PostWithDetails;
  communityData?: { id: string; name: string };
  onCommunityClick?: (communityId: string) => void;
  className?: string;
}

export function PremiumProductCard({
  product,
  expertPost,
  communityData,
  onCommunityClick,
  className = "",
}: PremiumProductCardProps) {
  const router = useRouter();
  const initialUrl = product.images?.[0]?.imageUrl ?? null;
  const [imageOk, setImageOk] = useState<boolean>(Boolean(initialUrl));
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`group relative h-full w-full flex flex-col cursor-pointer overflow-hidden rounded-xl bg-[#0c0c0d] border border-white/[0.07] hover:border-white/15 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_6px_24px_-12px_rgba(0,0,0,0.7)] hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.85)] ${className}`}
      onClick={() => router.push(`/consumer/products/${product.id}`)}
    >
      {/* ── IMAGE AREA ─────────────────────────────────────────── */}
      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-[#15151a] via-[#0e0e11] to-[#08080a]">
        {/* Subtle radial highlight — premium product-shot feel */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.045),transparent_60%)]" />

        {imageOk && initialUrl ? (
          <>
            {!loaded && <div className="absolute inset-0 skeleton shimmer" />}
            <img
              src={initialUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-contain p-5 sm:p-6 transition-all duration-500 group-hover:scale-[1.04] ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setLoaded(true)}
              onError={() => setImageOk(false)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <Package className="w-8 h-8 text-zinc-700" />
            <span className="text-[9px] uppercase tracking-widest text-zinc-700 font-bold">
              No image
            </span>
          </div>
        )}

        {/* Top-left: Trending / Popular badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.isFeatured && (
            <div className="flex items-center gap-1 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border bg-purple-500/10 text-purple-300 border-purple-500/20">
              <TrendingUp className="w-2.5 h-2.5" />
              Trending
            </div>
          )}
          {product.reviewCount > 100 && (
            <div className="flex items-center gap-1 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border bg-orange-500/10 text-orange-300 border-orange-500/20">
              <Flame className="w-2.5 h-2.5" />
              Popular
            </div>
          )}
        </div>

        {/* Top-right: Tested by Expert badge */}
        {expertPost && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 backdrop-blur-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-md">
            <ShieldCheck className="w-2.5 h-2.5" />
            <span className="hidden sm:inline">Tested</span>
          </div>
        )}
      </div>

      {/* ── CONTENT ────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Brand · Category */}
        <div className="flex items-center gap-1.5 min-w-0 mb-1.5">
          {product.brand?.brandName && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 truncate">
              {product.brand.brandName}
            </span>
          )}
          {product.brand?.brandName && product.category?.name && (
            <span className="text-zinc-700 text-[9px] shrink-0">·</span>
          )}
          {product.category?.name && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 truncate">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[13px] leading-snug text-white line-clamp-2 mb-2 min-h-[2.4em]">
          {product.name}
        </h3>

        {/* Expert attribution */}
        {expertPost?.expert?.fullName && (
          <div className="flex items-center gap-1.5 min-w-0 mb-2">
            <img
              src={
                expertPost.expert.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(expertPost.expert.fullName)}&size=24`
              }
              alt={expertPost.expert.fullName}
              loading="lazy"
              decoding="async"
              className="w-4 h-4 rounded-full border border-white/10 shrink-0 object-cover"
            />
            <span className="text-[10px] font-semibold text-purple-300 truncate">
              {expertPost.expert.fullName}
            </span>
            {expertPost.community && (
              <span className="text-[10px] text-zinc-500 shrink-0 truncate max-w-[80px]">
                · {expertPost.community.name}
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${
                    s <= Math.round(product.averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-zinc-500">({product.reviewCount})</span>
          </div>
        )}

        {/* Spacer pushes price + button to the bottom for equal-height cards */}
        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <div className="text-base sm:text-[17px] font-bold tracking-tight text-white">
            ₹{product.price.toFixed(2)}
          </div>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[11px] text-zinc-500 line-through">
              ₹{product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* View Product — always at the bottom */}
        <Button
          className="w-full h-9 text-[11px] font-bold rounded-lg bg-white text-black hover:bg-zinc-200 active:scale-[0.98] transition-all"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/consumer/products/${product.id}`);
          }}
        >
          View Product
        </Button>
      </div>

      {/* Optional Community Join CTA */}
      {communityData && onCommunityClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCommunityClick(communityData.id);
          }}
          className="flex items-center justify-between gap-2 px-3.5 py-2 bg-emerald-500/5 border-t border-emerald-500/15 hover:bg-emerald-500/10 transition-colors"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Users className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-bold text-emerald-400 truncate">
              {communityData.name}
            </span>
          </div>
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider shrink-0 bg-emerald-500/20 px-1.5 py-0.5 rounded">
            Join →
          </span>
        </button>
      )}
    </div>
  );
}

export function PremiumProductCardSkeleton() {
  return (
    <div className="h-full flex flex-col rounded-xl border border-white/[0.07] bg-[#0c0c0d] overflow-hidden">
      <div className="w-full aspect-square skeleton shimmer" />
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 gap-2">
        <div className="h-2.5 w-1/3 skeleton rounded" />
        <div className="h-4 w-4/5 skeleton rounded" />
        <div className="h-3 w-1/2 skeleton rounded" />
        <div className="flex-1" />
        <div className="flex justify-between items-center mt-2">
          <div className="h-5 w-14 skeleton rounded" />
          <div className="h-3 w-10 skeleton rounded" />
        </div>
        <div className="h-9 w-full skeleton rounded-lg mt-1" />
      </div>
    </div>
  );
}
