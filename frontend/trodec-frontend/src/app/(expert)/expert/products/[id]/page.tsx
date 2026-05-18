"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Star,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  X,
  ShieldCheck,
  TrendingUp,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getProductById, Product } from "@/services";
import { PostService, PostWithDetails } from "@/services/post.service";
import { ProductMediaPanel, MediaItem } from "@/components/product/ProductMediaPanel";
import { ProductExpertReview } from "@/components/product/ProductExpertReview";
import { ProductDiscussions } from "@/components/product/ProductDiscussions";
import { ProductAttributesCard } from "@/components/product/ProductAttributesCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ExpertProductDetailPage({ params }: Readonly<PageProps>) {
  const { id: productId } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [expertPost, setExpertPost] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  async function loadProduct() {
    try {
      setLoading(true);
      const data = await getProductById(productId);
      setProduct(data);

      try {
        const postsResponse = await PostService.getPosts({
          productId: data.id,
          isPublished: "true",
          limit: 1,
        });
        if (postsResponse.data.length > 0) {
          setExpertPost(postsResponse.data[0]);
        }
      } catch {
        // expert post is optional
      }
    } catch {
      toast.error("Product not found");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-10 space-y-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-4/3 bg-zinc-900 animate-pulse rounded-2xl" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-20 bg-zinc-900 animate-pulse rounded-xl" />)}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-10 w-3/4 bg-zinc-900 animate-pulse rounded-lg" />
            <div className="h-4 w-1/3 bg-zinc-900 animate-pulse rounded-lg" />
            <div className="h-24 w-full bg-zinc-900 animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images ?? [];
  const expertMedia = expertPost?.media ?? [];

  const videoItems: MediaItem[] = expertMedia
    .filter(m => m.mediaType === "video")
    .map(m => ({
      type: "video" as const,
      url: m.mediaUrl,
      id: m.id,
      isExpert: true,
      title: "Expert Review",
      thumbnail: images[0]?.imageUrl || "",
    }));

  const expertImageItems: MediaItem[] = expertMedia
    .filter(m => m.mediaType === "image")
    .map(m => ({
      type: "image" as const,
      url: m.mediaUrl,
      id: m.id,
      isExpert: true,
      title: "",
      thumbnail: m.mediaUrl,
    }));

  const imageItems: MediaItem[] = images.map(img => ({
    type: "image" as const,
    url: img.imageUrl,
    id: img.id,
    isExpert: false,
    title: "",
    thumbnail: img.imageUrl,
  }));

  const allMedia: MediaItem[] = [...videoItems, ...expertImageItems, ...imageItems];
  const heroMedia: MediaItem = selectedMedia ?? (videoItems[0] || imageItems[0] || expertImageItems[0]);

  if (!heroMedia) {
    return (
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-10 pb-16 text-white">
        <button
          className="text-zinc-500 hover:text-white transition-colors text-sm font-semibold flex items-center gap-1.5 mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <p className="text-zinc-500 text-sm">No media available for this product.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-16 pt-6">

        {/* Back + Expert badge */}
        <div className="flex items-center justify-between mb-6">
          <button
            className="text-zinc-500 hover:text-white transition-colors text-sm font-semibold flex items-center gap-1.5"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Expert View
          </span>
        </div>

        {/* 2-COL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          <ProductMediaPanel
            heroMedia={heroMedia}
            videoItems={videoItems}
            expertImageItems={expertImageItems}
            imageItems={imageItems}
            productName={product.name}
            onSelectMedia={setSelectedMedia}
            onOpenModal={m => { setSelectedMedia(m); setIsModalOpen(true); }}
          />

          {/* RIGHT: PRODUCT INFO (read-only for experts) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Category tag */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium pb-2 border-b border-white/5">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Trending in <strong className="text-white">{product.category?.name || "All Categories"}</strong></span>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {product.brand?.brandName && (
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  {product.brand.brandName}
                </p>
              )}

              <h1 className="text-3xl md:text-[32px] font-black text-white leading-[1.1] tracking-tight">
                {product.name}
              </h1>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Expert Verified</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Community Trusted</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Real Reviews</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(product.averageRating) ? "fill-amber-400 text-amber-400" : "fill-white/10 text-white/10"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-zinc-400">
                  {product.averageRating > 0 ? product.averageRating.toFixed(1) : "0.0"}{" "}
                  <span className="text-zinc-600">({product.reviewCount} reviews)</span>
                </span>
              </div>

              {/* Description */}
              {(product.description || product.shortDescription) && (
                <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">About this product</p>
                  <p className="text-zinc-200 text-sm leading-relaxed font-medium">
                    {product.shortDescription || product.description}
                  </p>
                  {product.shortDescription && product.description && product.description !== product.shortDescription && (
                    <p className="text-zinc-400 text-sm leading-relaxed pt-1">{product.description}</p>
                  )}
                </div>
              )}

              <ProductAttributesCard metadata={product.metadata} />
            </div>

            {/* Price (read-only display) */}
            <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-xl space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Market Price</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-white tracking-tight">
                  ₹{product.price.toFixed(2)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-base text-zinc-500 line-through mb-0.5">
                    ₹{product.compareAtPrice.toFixed(2)}
                  </span>
                )}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mb-0.5">
                    {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Brand */}
            <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] border border-white/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                {product.brand?.logoUrl
                  ? <img src={product.brand.logoUrl} className="w-full h-full object-contain" alt={product.brand?.brandName ?? "Brand"} />
                  : <ShieldCheck className="w-5 h-5 text-zinc-500" />
                }
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{product.brand?.brandName || "Unknown Brand"}</h4>
                <p className="text-[11px] text-zinc-500 font-medium">Official Partner &bull; Verified Brand</p>
              </div>
            </div>

            {/* Expert action hint */}
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
              <p className="text-xs text-emerald-400 font-semibold mb-1">Expert Panel</p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                You are viewing this product in expert mode. Go to your community to post a review or insight about this product.
              </p>
              <Button
                className="mt-3 w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg"
                onClick={() => router.push("/expert/communities")}
              >
                Go to My Communities
              </Button>
            </div>

          </div>
        </div>

        {expertPost?.expert && <ProductExpertReview post={expertPost} />}

        <ProductDiscussions productId={productId} />

      </div>

      {/* MEDIA LIGHTBOX MODAL */}
      <AnimatePresence>
        {isModalOpen && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-5xl bg-[#050505] rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-purple-500/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="aspect-video">
                {selectedMedia.type === "video" ? (
                  <video src={selectedMedia.url} className="w-full h-full object-contain" controls autoPlay>
                    <track kind="captions" />
                  </video>
                ) : (
                  <img src={selectedMedia.url} className="w-full h-full object-contain" alt="Gallery" />
                )}
              </div>

              {allMedia.length > 1 && (
                <div className="flex gap-2 p-3 bg-black/60 overflow-x-auto scrollbar-hide">
                  {allMedia.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      className={cn(
                        "relative w-14 h-14 shrink-0 rounded-lg overflow-hidden transition-all",
                        selectedMedia.id === item.id
                          ? "border-2 border-purple-500 opacity-100"
                          : "border border-white/10 opacity-40 hover:opacity-80"
                      )}
                    >
                      <img src={item.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                      {item.type === "video" && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-3 h-3 text-white fill-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <button
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full p-2.5 transition border border-white/10"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
