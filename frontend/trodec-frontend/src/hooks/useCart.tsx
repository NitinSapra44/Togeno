"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Product } from "@/services/products.service";
import { CartService } from "@/services/cart.services";
import { toast } from "sonner";
import { analytics } from "@/services/analytics.service";
import { useAuthStore } from "@/stores/auth.store";

export interface CartItem extends Product {
    quantity: number;
    selectedSize?: string | null;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number, selectedSize?: string | null) => void;
    removeFromCart: (productId: string, selectedSize?: string | null) => void;
    updateQuantity: (productId: string, quantity: number, selectedSize?: string | null) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
    isLoading: boolean;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Match two cart items: same product, same size (both null/undefined = same)
function sameItem(a: CartItem, productId: string, selectedSize?: string | null) {
    return a.id === productId && (a.selectedSize ?? null) === (selectedSize ?? null);
}

// Per-user storage key — never share cart state across accounts.
const cartKeyFor = (userId: string) => `trodec-cart:${userId}`;

// Wipe any cart-related localStorage that doesn't belong to the current user.
// This includes the legacy global "cart" key from older builds and any other
// users' per-user keys that may be lingering on a shared device.
function purgeForeignCartStorage(currentUserId: string | undefined) {
    if (typeof window === "undefined") return;
    try {
        const keepKey = currentUserId ? cartKeyFor(currentUserId) : null;
        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            // Legacy global key — always remove, it caused cross-account leakage.
            if (key === "cart") { toRemove.push(key); continue; }
            // Any other user's per-user key — remove.
            if (key.startsWith("trodec-cart:") && key !== keepKey) {
                toRemove.push(key);
            }
        }
        toRemove.forEach((k) => localStorage.removeItem(k));
    } catch { /* private mode — ignore */ }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Subscribe to the auth user id — when it changes (sign-in / sign-out /
    // account switch) the cart effect re-runs and rebuilds state from scratch
    // for the new user. Never reuse the previous user's items.
    const userId = useAuthStore((s) => s.user?.id);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const storageKey = useMemo(() => (userId ? cartKeyFor(userId) : null), [userId]);

    // Persist items to per-user localStorage whenever they change.
    // No userId → no persistence (we never write a shared/guest cart).
    useEffect(() => {
        if (isLoading) return;
        if (!storageKey) return;
        try {
            localStorage.setItem(storageKey, JSON.stringify(items));
        } catch { /* ignore quota / private mode */ }
    }, [items, isLoading, storageKey]);

    // Load / reset cart whenever the authenticated user changes.
    useEffect(() => {
        let cancelled = false;

        // Always reset visible state first so the previous user's items
        // can never appear under the new user, even for a frame.
        setItems([]);
        setIsLoading(true);

        // Clear stale storage from other users + the legacy global key.
        purgeForeignCartStorage(userId);

        // Not authenticated → cart is empty. No backend fetch, no local read.
        if (!isAuthenticated || !userId || !storageKey) {
            setIsLoading(false);
            return;
        }

        // 1. Hydrate instantly from this user's local cache (if any) for UX.
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved) as CartItem[];
                if (Array.isArray(parsed) && !cancelled) setItems(parsed);
            }
        } catch { /* ignore */ }

        // 2. Backend is the source of truth — it filters by auth.uid().
        (async () => {
            try {
                const backendItems = (await CartService.getCart()) ?? [];
                if (cancelled) return;
                const merged: CartItem[] = backendItems
                    .filter((bi) => !!bi.product)
                    .map((bi) => ({
                        ...bi.product!,
                        quantity: bi.quantity,
                        selectedSize: bi.selectedSize ?? null,
                    }));
                setItems(merged);
            } catch (err) {
                console.error("[Cart] Backend load failed:", err);
                // Keep the locally-hydrated items as a fallback.
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [userId, isAuthenticated, storageKey]);

    const addToCart = (product: Product, quantity = 1, selectedSize?: string | null) => {
        if (!isAuthenticated || !userId) {
            toast.error("Please sign in to add items to your cart");
            return;
        }

        try {
            analytics.track('add_to_cart', {
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                quantity,
            });
        } catch { /* analytics must not block cart */ }

        const isExisting = items.some((item) => sameItem(item, product.id, selectedSize));

        setItems((currentItems) => {
            const existing = currentItems.find((item) => sameItem(item, product.id, selectedSize));
            if (existing) {
                return currentItems.map((item) =>
                    sameItem(item, product.id, selectedSize)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...currentItems, { ...product, quantity, selectedSize: selectedSize ?? null }];
        });

        toast.success(isExisting ? "Cart quantity updated" : "Added to cart");

        CartService.addToCart({
            productId: product.id,
            quantity,
            selectedSize: selectedSize ?? null,
        }).catch((err: Error) => {
            console.error("[Cart] addToCart backend error:", err.message);
            toast.error(err.message || "Failed to save to cart");
        });
    };

    const removeFromCart = (productId: string, selectedSize?: string | null) => {
        setItems((currentItems) =>
            currentItems.filter((item) => !sameItem(item, productId, selectedSize))
        );
        toast.success("Removed from cart");

        if (isAuthenticated && userId) {
            CartService.removeItem(productId, selectedSize ?? null).catch((err: Error) => {
                console.error("[Cart] removeItem backend error:", err.message);
            });
        }
    };

    const updateQuantity = (productId: string, quantity: number, selectedSize?: string | null) => {
        if (quantity < 1) {
            removeFromCart(productId, selectedSize);
            return;
        }

        setItems((currentItems) =>
            currentItems.map((item) =>
                sameItem(item, productId, selectedSize) ? { ...item, quantity } : item
            )
        );

        if (isAuthenticated && userId) {
            CartService.updateItemQuantity(productId, quantity, selectedSize ?? null).catch((err: Error) => {
                console.error("[Cart] updateQuantity backend error:", err.message);
            });
        }
    };

    const clearCart = () => {
        setItems([]);
        if (storageKey) {
            try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
        }
        toast.success("Cart cleared");

        if (isAuthenticated && userId) {
            CartService.clearCart().catch((err: Error) => {
                console.error("[Cart] clearCart backend error:", err.message);
            });
        }
    };

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const toggleCart = () => setIsCartOpen((prev) => !prev);

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                itemCount,
                subtotal,
                isLoading,
                isCartOpen,
                openCart,
                closeCart,
                toggleCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
