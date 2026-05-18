"use client";

import { cn } from "@/lib/utils";
import { Play, Camera, Video, ZoomIn } from "lucide-react";

export interface MediaItem {
  type: "video" | "image";
  url: string;
  id: string;
  isExpert: boolean;
  title: string;
  thumbnail: string;
}

interface ProductMediaPanelProps {
  heroMedia: MediaItem;
  videoItems: MediaItem[];
  expertImageItems: MediaItem[];
  imageItems: MediaItem[];
  productName: string;
  onSelectMedia: (item: MediaItem) => void;
  onOpenModal: (item: MediaItem) => void;
}

export function ProductMediaPanel({
  heroMedia,
  videoItems,
  expertImageItems,
  imageItems,
  productName,
  onSelectMedia,
  onOpenModal,
}: Readonly<ProductMediaPanelProps>) {
  return (
    <div className="lg:col-span-7 space-y-5">
      <button
        type="button"
        className="relative w-full aspect-4/3 rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-xl flex items-center justify-center group cursor-pointer"
        onClick={() => onOpenModal(heroMedia)}
      >
        {heroMedia.type === "video" ? (
          <>
            <video
              src={heroMedia.url}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              autoPlay
              muted
              loop
              playsInline
            >
              <track kind="captions" />
            </video>
            <div className="absolute top-4 left-4 bg-purple-600/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none">
              <Play className="w-3.5 h-3.5 text-white fill-white" />
              <span className="text-white text-[10px] font-bold uppercase tracking-wider">Expert Review</span>
            </div>
          </>
        ) : (
          <img
            src={heroMedia.url}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        )}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4" />
        </div>
      </button>

      {(videoItems.length > 0 || expertImageItems.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Expert Review</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x pb-1">
            {[...videoItems, ...expertImageItems].map(item => (
              <button
                key={item.id}
                onClick={() => onSelectMedia(item)}
                className={cn(
                  "snap-start relative w-20 h-20 shrink-0 rounded-xl overflow-hidden transition-all duration-300 bg-[#0a0a0a] group/thumb",
                  heroMedia.id === item.id
                    ? "border-2 border-purple-500 ring-2 ring-purple-500/20"
                    : "border border-white/10 opacity-60 hover:opacity-100"
                )}
              >
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="Expert review" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <Play className="w-5 h-5 text-zinc-600" />
                  </div>
                )}
                {item.type === "video" && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white drop-shadow-lg" />
                  </div>
                )}
                {heroMedia.id === item.id && (
                  <div className="absolute bottom-1 left-1 right-1 h-0.5 bg-purple-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {imageItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Product Photos <span className="text-zinc-700">({imageItems.length})</span>
            </span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide snap-x pb-1">
            {imageItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => onSelectMedia(item)}
                className={cn(
                  "snap-start relative w-20 h-20 shrink-0 rounded-xl overflow-hidden transition-all duration-300 bg-[#0a0a0a] group/thumb",
                  heroMedia.id === item.id
                    ? "border-2 border-white/70 ring-2 ring-white/10"
                    : "border border-white/10 opacity-50 hover:opacity-100"
                )}
              >
                <img
                  src={item.thumbnail}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                />
                {heroMedia.id === item.id && (
                  <div className="absolute bottom-1 left-1 right-1 h-0.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {imageItems.length === 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Product Photos</span>
          </div>
          <div className="flex gap-2.5">
            {["p0", "p1", "p2"].map(k => (
              <div key={k} className="w-20 h-20 rounded-xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center">
                <Camera className="w-6 h-6 text-zinc-700" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
