import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8 text-zinc-400" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">404</p>
          <h1 className="text-2xl font-bold text-white">Page not found</h1>
          <p className="text-sm text-zinc-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
          <Link
            href="/consumer/products"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all active:scale-95"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}
