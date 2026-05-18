"use client";

import { Star, CheckCircle2 } from "lucide-react";
import { PostWithDetails } from "@/services/post.service";

export function ProductExpertReview({ post }: Readonly<{ post: PostWithDetails }>) {
  const expert = post.expert!;
  return (
    <div className="pt-12 mt-12 border-t border-white/5 space-y-6">
      <h3 className="text-2xl font-black text-white flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-purple-400" />
        Expert Review
      </h3>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <img
              src={expert.avatarUrl || `https://ui-avatars.com/api/?name=${expert.fullName || "Expert"}&background=random`}
              alt={expert.fullName || "Expert"}
              className="w-12 h-12 rounded-full border border-white/10 object-cover"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold text-[15px]">{expert.fullName}</span>
                <span className="text-purple-400 text-[9px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED EXPERT
                </span>
              </div>
              {post.community && (
                <span className="text-xs text-emerald-400/80 font-medium mt-0.5 block">
                  Community: <strong className="text-emerald-400">{post.community.name}</strong>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                className={`w-4 h-4 ${s <= (post.rating ?? 5) ? "fill-amber-400 text-amber-400" : "fill-white/10 text-white/10"}`}
              />
            ))}
            <span className="text-sm font-bold text-white ml-1">{post.rating ? post.rating.toFixed(1) : "5.0"}</span>
          </div>
        </div>

        {post.title && (
          <div className="bg-white/3 border border-white/5 rounded-xl px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Why We Tested This</p>
            <p className="text-zinc-200 text-sm font-medium leading-relaxed">{post.title}</p>
          </div>
        )}

        {post.verdict && (
          <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1.5">Expert Opinion</p>
            <p className="text-zinc-200 text-sm italic leading-relaxed">&quot;{post.verdict}&quot;</p>
          </div>
        )}

        {post.content && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Usage Experience</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{post.content}</p>
          </div>
        )}

        {(post.pros?.length || post.cons?.length) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            {post.pros?.length ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Pros</p>
                {post.pros.map(p => (
                  <p key={p} className="text-zinc-300 text-sm flex items-start gap-2">
                    <span className="text-emerald-400 font-bold mt-0.5">+</span>{p}
                  </p>
                ))}
              </div>
            ) : null}
            {post.cons?.length ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Cons</p>
                {post.cons.map(c => (
                  <p key={c} className="text-zinc-300 text-sm flex items-start gap-2">
                    <span className="text-red-400 font-bold mt-0.5">−</span>{c}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
