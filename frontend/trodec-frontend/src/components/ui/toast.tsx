"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "info"

interface ToastProps {
  id: string
  message: string
  type?: ToastType
}

export function Toast({ message, type = "info" }: ToastProps) {
  return (
    <div
      className={cn(
        "rounded-md px-4 py-2 text-sm shadow-md",
        type === "success" && "bg-green-600 text-white",
        type === "error" && "bg-red-600 text-white",
        type === "info" && "bg-gray-900 text-white"
      )}
    >
      {message}
    </div>
  )
}
