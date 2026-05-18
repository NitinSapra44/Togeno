"use client"

import * as React from "react"
import { Toast, ToastType } from "@/components/ui/toast"

interface ToastItem {
  id: string
  message: string
  type?: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const showToast = (message: string, type?: ToastType) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToastContext must be used inside ToastProvider")
  }
  return ctx
}
