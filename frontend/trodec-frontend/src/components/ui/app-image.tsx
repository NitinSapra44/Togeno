"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Package, Users, ShieldCheck, ImageIcon } from "lucide-react";

/**
 * Standardized image variants used across the app.
 *
 * product    → aspect-square, object-cover, Package icon fallback
 * avatar     → circular, object-cover, initials fallback
 * community  → rounded-xl, object-cover, Users icon fallback
 * brand-logo → object-contain (never crop logos), ShieldCheck fallback
 * cover      → full-width banner, object-cover
 * thumbnail  → small fixed square, object-cover
 */
export type AppImageVariant =
  | "product"
  | "avatar"
  | "community"
  | "brand-logo"
  | "cover"
  | "thumbnail";

interface AppImageProps {
  src?: string | null;
  alt: string;
  variant?: AppImageVariant;
  /** Initials shown when variant="avatar" and src is missing */
  initials?: string;
  /** Emoji shown when variant="community" and src is missing */
  emoji?: string;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  priority?: boolean;
}

const variantContainerStyles: Record<AppImageVariant, string> = {
  product: "relative aspect-square w-full overflow-hidden rounded-lg bg-[#0a0a0a]",
  avatar: "relative overflow-hidden rounded-full bg-zinc-800 shrink-0",
  community: "relative overflow-hidden rounded-xl bg-[#0a0a0a] shrink-0",
  "brand-logo": "relative overflow-hidden rounded-lg bg-white/5 flex items-center justify-center shrink-0",
  cover: "relative w-full overflow-hidden rounded-xl bg-zinc-900",
  thumbnail: "relative overflow-hidden rounded-xl bg-[#0a0a0a] shrink-0",
};

const variantImgStyles: Record<AppImageVariant, string> = {
  product: "w-full h-full object-cover",
  avatar: "w-full h-full object-cover",
  community: "w-full h-full object-cover",
  "brand-logo": "w-full h-full object-contain p-1",
  cover: "w-full h-full object-cover",
  thumbnail: "w-full h-full object-cover",
};

function FallbackContent({
  variant,
  initials,
  emoji,
}: Pick<AppImageProps, "variant" | "initials" | "emoji">) {
  switch (variant) {
    case "avatar":
      return initials ? (
        <span className="text-zinc-400 font-bold text-sm select-none">
          {initials.slice(0, 2).toUpperCase()}
        </span>
      ) : (
        <span className="text-zinc-600 font-bold text-sm">?</span>
      );
    case "community":
      return emoji ? (
        <span className="text-2xl">{emoji}</span>
      ) : (
        <Users className="w-6 h-6 text-zinc-600" />
      );
    case "brand-logo":
      return <ShieldCheck className="w-5 h-5 text-zinc-600" />;
    case "thumbnail":
      return <ImageIcon className="w-4 h-4 text-zinc-700" />;
    default:
      return <Package className="w-8 h-8 text-zinc-700" />;
  }
}

export function AppImage({
  src,
  alt,
  variant = "product",
  initials,
  emoji,
  className,
  containerClassName,
  priority = false,
}: AppImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const showImage = !!src && !hasError;

  return (
    <div
      className={cn(
        variantContainerStyles[variant],
        "flex items-center justify-center",
        containerClassName
      )}
    >
      {showImage ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-white/[0.03] animate-pulse" />
          )}
          <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={cn(
              variantImgStyles[variant],
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className
            )}
          />
        </>
      ) : (
        <FallbackContent variant={variant} initials={initials} emoji={emoji} />
      )}
    </div>
  );
}

/** Convenience wrapper for circular expert/user avatars */
export function AvatarImage({
  src,
  alt,
  initials,
  size = "w-10 h-10",
  className,
}: {
  src?: string | null;
  alt: string;
  initials?: string;
  size?: string;
  className?: string;
}) {
  return (
    <AppImage
      src={src}
      alt={alt}
      variant="avatar"
      initials={initials}
      containerClassName={cn(size, className)}
    />
  );
}

/** Convenience wrapper for product card/detail images */
export function ProductImage({
  src,
  alt,
  className,
  containerClassName,
  priority,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}) {
  return (
    <AppImage
      src={src}
      alt={alt}
      variant="product"
      className={className}
      containerClassName={containerClassName}
      priority={priority}
    />
  );
}

/** Convenience wrapper for community thumbnail/icon images */
export function CommunityImage({
  src,
  alt,
  emoji,
  size = "w-14 h-14",
  className,
}: {
  src?: string | null;
  alt: string;
  emoji?: string;
  size?: string;
  className?: string;
}) {
  return (
    <AppImage
      src={src}
      alt={alt}
      variant="community"
      emoji={emoji}
      containerClassName={cn(size, className)}
    />
  );
}

/** Convenience wrapper for brand logo images — always object-contain */
export function BrandLogo({
  src,
  alt,
  size = "w-10 h-10",
  className,
}: {
  src?: string | null;
  alt: string;
  size?: string;
  className?: string;
}) {
  return (
    <AppImage
      src={src}
      alt={alt}
      variant="brand-logo"
      containerClassName={cn(size, className)}
    />
  );
}
