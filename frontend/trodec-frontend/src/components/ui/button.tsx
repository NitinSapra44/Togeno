import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl",
    "text-sm font-semibold tracking-tight",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.97]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        /* "default" alias kept for backward compat — maps to primary */
        default:
          "bg-white text-black hover:bg-zinc-100 shadow-[0_2px_12px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.18)]",
        primary:
          "bg-white text-black hover:bg-zinc-100 shadow-[0_2px_12px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.18)]",
        secondary:
          "bg-white/[0.06] border border-white/[0.12] text-white hover:bg-white/[0.10] hover:border-white/[0.20]",
        outline:
          "border border-white/[0.12] bg-transparent text-white hover:bg-white/[0.06] hover:border-white/[0.20]",
        ghost:
          "bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06]",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 shadow-[0_2px_12px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.4)]",
        emerald:
          "bg-emerald-500 text-black font-bold hover:bg-emerald-400 shadow-[0_2px_12px_rgba(16,185,129,0.3)]",
        link:
          "text-zinc-400 hover:text-white underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        xs:  "h-7 px-2.5 text-xs rounded-lg",
        sm:  "h-8 px-3.5 text-xs",
        md:  "h-9 px-4 text-sm",
        default: "h-10 px-5 text-sm",
        lg:  "h-11 px-6 text-[14px]",
        xl:  "h-14 px-8 text-base rounded-2xl",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-lg",
        "icon-lg": "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
