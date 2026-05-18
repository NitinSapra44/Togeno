"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
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

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const synced = useRef(false);

    // Persist items to localStorage whenever they change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem("cart", JSON.stringify(items));
        }
    }, [items, isLoading]);

    // On mount / auth change: load localStorage first, then sync with backend
    useEffect(() => {
        let cancelled = false;
        synced.current = false;

        async function init() {
            // 1. Load localStorage immediately for instant display
            let localItems: CartItem[] = [];
            try {
                const saved = localStorage.getItem("cart");
                if (saved) localItems = JSON.parse(saved);
            } catch { /* ignore */ }
            setItems(localItems);

            // 2. If authenticated, sync with backend
            if (isAuthenticated) {
                try {
                    const backendItems = await CartService.getCart();
                    if (cancelled) return;

                    // Key = productId + ":" + (selectedSize or "")
                    const backendKey = (productId: string, size: string | null | undefined) =>
                        `${productId}:${size ?? ""}`;
                    const backendMap = new Map(
                        backendItems.map((i) => [backendKey(i.productId, i.selectedSize), i])
                    );

                    // Build merged list from backend, restoring selectedSize from local when
                    // the backend now returns it too (both sources should match post-migration).
                    const merged: CartItem[] = backendItems
                        .filter((bi) => !!bi.product)
                        .map((bi) => {
                            // Backend now stores selectedSize; also cross-check local as fallback
                            const localItem = localItems.find(
                                (li) => li.id === bi.productId &&
                                    (li.selectedSize ?? null) === (bi.selectedSize ?? null)
                            );
                            return {
                                ...bi.product!,
                                quantity: bi.quantity,
                                selectedSize: bi.selectedSize ?? localItem?.selectedSize ?? null,
                            };
                        });

                    // Push localStorage-only items to backend (fire and forget)
                    for (const local of localItems) {
                        const key = backendKey(local.id, local.selectedSize);
                        if (!backendMap.has(key)) {
                            merged.push(local);
                            CartService.addToCart({
                                productId: local.id,
                                quantity: local.quantity,
                                selectedSize: local.selectedSize ?? null,
                            }).catch((err: Error) => {
                                console.error("[Cart] Failed to sync local item to backend:", err.message);
                            });
                        }
                    }

                    if (!cancelled) {
                        // Use functional update so items added AFTER init started are preserved
                        setItems((currentItems) => {
                            const mergedKeys = new Set(
                                merged.map((m) => backendKey(m.id, m.selectedSize))
                            );
                            const newlyAdded = currentItems.filter(
                                (ci) => !mergedKeys.has(backendKey(ci.id, ci.selectedSize))
                            );
                            return [...merged, ...newlyAdded];
                        });
                        synced.current = true;
                    }
                } catch (err) {
                    console.error("[Cart] Backend sync failed, using localStorage:", err);
                }
            }

            if (!cancelled) setIsLoading(false);
        }

        init();
        return () => { cancelled = true; };
    }, [isAuthenticated]);

    const addToCart = (product: Product, quantity = 1, selectedSize?: string | null) => {
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

        if (isAuthenticated) {
            CartService.addToCart({
                productId: product.id,
                quantity,
                selectedSize: selectedSize ?? null,
            }).catch((err: Error) => {
                console.error("[Cart] addToCart backend error:", err.message);
                toast.error(err.message || "Failed to save to cart");
            });
        }
    };

    const removeFromCart = (productId: string, selectedSize?: string | null) => {
        setItems((currentItems) =>
            currentItems.filter((item) => !sameItem(item, productId, selectedSize))
        );
        toast.success("Removed from cart");

        if (isAuthenticated) {
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

        if (isAuthenticated) {
            CartService.updateItemQuantity(productId, quantity, selectedSize ?? null).catch((err: Error) => {
                console.error("[Cart] updateQuantity backend error:", err.message);
            });
        }
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem("cart");
        toast.success("Cart cleared");

        if (isAuthenticated) {
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
