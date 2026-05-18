"use client";

import { useEffect, useRef, FC } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useModalStore } from "@/stores/modal.store";
import { MarketplaceHero } from "@/components/landing/MarketplaceHero";
import { SocialProofStrip } from "@/components/landing/SocialProofStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ExpertSpotlight } from "@/components/landing/ExpertSpotlight";
import { MarketplaceTrendingProducts } from "@/components/landing/MarketplaceTrendingProducts";
import { MarketplaceTrendingCommunities } from "@/components/landing/MarketplaceTrendingCommunities";
import { MarketplaceTrendingVideos } from "@/components/landing/MarketplaceTrendingVideos";
import { MarketplaceDiscussions } from "@/components/landing/MarketplaceDiscussions";
import { MarketplaceFinalCTA } from "@/components/landing/MarketplaceFinalCTA";

const Home: FC = () => {
  const router = useRouter();
  const { isAuthenticated, profile } = useAuthStore();
  const { openLoginModal } = useModalStore();

  // 🔥 Smart Redirect Logic: Browse First
  const handleEnterMarket = () => {
    if (!isAuthenticated) {
      // Unauthenticated users can explore products freely
      router.push("/consumer/products");
      return;
    }

    // Role-based redirect
    if (profile?.role === "brand_admin" || profile?.role === "admin") {
      router.push("/brand/dashboard");
    } else if (profile?.role === undefined) {
      router.push("/admin/dashboard");
    } else {
      router.push("/consumer/dashboard");
    }
  };

  const handleJoinCommunity = () => {
    router.push("/consumer/communities");
  };

  const handleFinalCTA = () => {
    if (!isAuthenticated) {
      openLoginModal({ message: "Login to unlock premium features" });
    } else {
      router.push("/consumer/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">

      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      </div>

      <main className="relative z-10 w-full flex flex-col items-center">
        
        {/* ================= HERO SECTION ================= */}
        <MarketplaceHero 
          onEnterMarket={handleEnterMarket}
          onJoinCommunity={handleJoinCommunity}
        />

        <SocialProofStrip />
        
        {/* ================= OTHER SECTIONS ================= */}
        <div className="w-full relative z-20 bg-[#0a0a0a] backdrop-blur-3xl border-t border-white/5">
          
          <HowItWorks />

          <MarketplaceTrendingVideos />

          <MarketplaceTrendingProducts />

          <ExpertSpotlight />
          
          <MarketplaceTrendingCommunities />
          
          <MarketplaceDiscussions />
          
          <MarketplaceFinalCTA 
            onSignUp={handleFinalCTA}
          />
        </div>

      </main>
    </div>
  );
};

// ================= STARFIELD =================
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; size: number; speed: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 3000);
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5,
          speed: Math.random() * 0.2 + 0.05,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";

      stars.forEach((star) => {
        ctx.globalAlpha = Math.random() * 0.5 + 0.3;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y -= star.speed;
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-30 mix-blend-screen"
    />
  );
}

export default Home;
