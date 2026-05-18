"use client";

import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useRouter } from "next/navigation";
import { Star, Package } from "lucide-react";

export function RecentlyViewedSection() {
  const { recentlyViewed } = useRecentlyViewed();
  const router = useRouter();

  if (recentlyViewed.length === 0) return null;

  return (
    <div className="pt-16 pb-8 border-t border-white/5">
      <h2 className="text-xl font-bold text-white tracking-tight mb-8">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
        {recentlyViewed.map((product) => {
          const hasImage = !!product.images?.[0]?.imageUrl;
          return (
            <button
              key={product.id}
              type="button"
              className="group flex flex-col bg-[#0f0f10] rounded-xl border border-white/10 overflow-hidden hover:border-white/20 hover:bg-[#141416] shadow-lg transition-all duration-300 text-left w-full"
              onClick={() => router.push(`/consumer/products/${product.id}`)}
            >
              <div className="aspect-square w-full overflow-hidden bg-[#0a0a0a]">
                {hasImage ? (
                  <img
                    src={product.images![0].imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#050505]">
                    <Package className="w-8 h-8 text-zinc-800" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2 flex flex-col flex-1">
                <h4 className="text-sm font-semibold text-white line-clamp-1">{product.name}</h4>
                <div className="flex items-center gap-1.5 mt-auto">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-gray-400 font-medium">
                    {product.averageRating > 0 ? product.averageRating.toFixed(1) : "New"}
                  </span>
                </div>
                <p className="font-bold text-white">₹{product.price.toFixed(2)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
