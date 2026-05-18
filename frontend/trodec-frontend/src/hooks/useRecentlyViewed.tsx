"use client";

import { useState, useEffect } from "react";
import { Product } from "@/services";

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("trodec_recently_viewed");
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recently viewed items:", error);
    }
  }, []);

  const addViewedProduct = (product: Product) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists so we can push it to the front
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 10); // keep max 10
      localStorage.setItem("trodec_recently_viewed", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem("trodec_recently_viewed");
  };

  return {
    recentlyViewed,
    addViewedProduct,
    clearRecentlyViewed,
  };
}
