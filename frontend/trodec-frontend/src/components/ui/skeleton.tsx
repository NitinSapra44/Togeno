import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-lg",
        "bg-white/[0.06]",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/[0.08] before:to-transparent",
        "before:-translate-x-full before:animate-[shimmer_1.8s_ease-in-out_infinite]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
