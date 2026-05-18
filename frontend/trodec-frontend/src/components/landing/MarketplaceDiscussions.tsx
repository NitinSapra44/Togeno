import { FC } from "react";
import { MessageSquare, ThumbsUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface DiscussionProps {
  id: string;
  author: string;
  avatar: string;
  timeAgo: string;
  community: string;
  question: string;
  previewReply: {
    author: string;
    avatar: string;
    content: string;
    likes: number;
    timeAgo: string;
  };
  likes: number;
  replyCount: number;
}

const mockDiscussions: DiscussionProps[] = [
  {
    id: "disc_1",
    author: "Alex Rivers",
    avatar: "AR",
    timeAgo: "2h ago",
    community: "Audiophiles Elite",
    question: "Is the Aura Premium Wireless worth the upgrade from the Sony XM5s? Considering the price tag, I need to know if the soundstage is actually wider.",
    previewReply: {
      author: "Sarah Chen",
      avatar: "SC",
      content: "Absolutely. The planar magnetic drivers on the Aura offer significantly better instrument separation. I did a side-by-side yesterday and the difference in the mid-range is night and day.",
      likes: 42,
      timeAgo: "1h ago",
    },
    likes: 128,
    replyCount: 15,
  },
  {
    id: "disc_2",
    author: "Jordan Lee",
    avatar: "JL",
    timeAgo: "5h ago",
    community: "Mechanical Keebs",
    question: "What's the best tactile switch right now? Looking for something with a sharp bump but smooth travel. Not a fan of the Boba U4Ts.",
    previewReply: {
      author: "Tech Enthusiast",
      avatar: "TE",
      content: "Try the Neapolitan Ice Creams. They have a very distinct, sharp \"D\" shaped bump at the very top, and the housing is incredibly smooth stock.",
      likes: 89,
      timeAgo: "3h ago",
    },
    likes: 215,
    replyCount: 34,
  },
];

export const MarketplaceDiscussions: FC = () => {
  return (
    <section className="py-40 relative z-10 w-full bg-[#0a0a0a] overflow-hidden">
      {/* Editorial Background Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[30vw] h-[30vw] bg-zinc-800/20 blur-[200px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-blue-900/10 blur-[200px] rounded-full mix-blend-screen" />
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-[1400px]">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-24">
          <div className="space-y-6 max-w-3xl">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] text-white drop-shadow-sm">
              Community Discussions
            </h2>
            <p className="text-zinc-400 text-xl font-light tracking-wide leading-relaxed">
              Dive deep into the insights and debates driving informed commerce. Curated threads from top experts.
            </p>
          </div>
          <button className="text-zinc-300 hover:text-white hidden md:flex items-center gap-3 group px-8 py-4 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/[0.08] transition-all backdrop-blur-2xl hover:shadow-[0_15px_40px_rgba(255,255,255,0.06)] text-xs font-bold uppercase tracking-[0.2em] flex-shrink-0">
            View Thread Index <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Cinematic Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {mockDiscussions.map((disc, idx) => (
            <motion.div
              key={disc.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.9, delay: idx * 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="group relative bg-[#111] backdrop-blur-xl border border-white/[0.03] rounded-[3rem] p-12 hover:border-white/[0.1] transition-all duration-[0.8s] hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] flex flex-col shadow-2xl"
            >
              {/* Cinematic Border Highlight (Subtle Left Glow) */}
              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {/* Inner ambient glow on hover */}
              <div className="absolute inset-0 bg-blue-500/[0.015] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl rounded-[3rem] pointer-events-none" />

              {/* Question Area */}
              <div className="flex items-start gap-6 mb-12 relative z-10">
                <div className="w-14 h-14 rounded-full bg-black border border-white/10 flex items-center justify-center text-sm font-bold tracking-widest text-white shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-[0.6s] ease-[cubic-bezier(0.16,1,0.3,1)]">
                  {disc.avatar}
                </div>
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center gap-3 text-xs mb-4 font-semibold tracking-widest uppercase">
                    <span className="text-white bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">{disc.author}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-500">{disc.timeAgo}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-blue-400/90">{disc.community}</span>
                  </div>
                  <h3 className="text-zinc-100 text-2xl leading-[1.4] font-medium tracking-tight pr-4">
                    {disc.question}
                  </h3>
                </div>
              </div>

              {/* Nested Reply Card (Extreme Depth) */}
              <div className="ml-20 relative z-10">
                {/* Visual Connection Line */}
                <div className="absolute -top-12 -left-10 w-8 h-12 border-l border-b border-white/[0.08] rounded-bl-3xl group-hover:border-blue-500/20 transition-colors duration-700" />
                
                <div className="relative bg-black/40 backdrop-blur-3xl rounded-[2rem] p-8 border border-white/[0.04] group-hover:border-blue-500/20 transition-colors duration-[0.8s] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),_0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                  
                  {/* Subtle Inner Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div className="relative flex items-start gap-5">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-bold tracking-widest text-zinc-300 shrink-0 shadow-inner">
                      {disc.previewReply.avatar}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 text-xs mb-3 font-semibold uppercase tracking-widest">
                        <span className="text-emerald-400">Expert Reply</span>
                        <span className="text-zinc-700">|</span>
                        <span className="text-zinc-300">{disc.previewReply.author}</span>
                      </div>
                      
                      <p className="text-zinc-400 text-base leading-[1.6] font-light mb-5">
                        {disc.previewReply.content}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold tracking-wide">
                        <ThumbsUp className="w-4 h-4 text-emerald-500/80 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                        {disc.previewReply.likes} Helpful
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar (Footing) */}
              <div className="ml-20 mt-10 flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-zinc-500 pt-6 border-t border-white/[0.03]">
                <button className="flex items-center gap-3 hover:text-white transition-colors group/btn">
                  <div className="p-2.5 rounded-full bg-white/5 border border-white/5 group-hover/btn:bg-blue-500/20 group-hover/btn:border-blue-500/30 group-hover/btn:text-blue-400 transition-all shadow-sm">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                  <span className="group-hover/btn:text-blue-400 transition-colors">{disc.likes}</span>
                </button>
                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                <button className="flex items-center gap-3 hover:text-white transition-colors group/btn flex-1">
                  <div className="p-2.5 rounded-full bg-white/5 border border-white/5 group-hover/btn:bg-white/10 group-hover/btn:border-white/20 transition-all shadow-sm">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span>{disc.replyCount} Replies</span>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
