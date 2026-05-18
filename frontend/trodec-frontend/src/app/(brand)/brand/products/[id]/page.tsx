"use client";

import { FC, useState, useEffect, use } from "react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import {
  ArrowLeft,
  Edit,
  ShoppingBag,
  Star,
  Tag,
  Package,
  Loader2,
  BarChart2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getProductById, Product } from "@/services";
import { ProductAttributesCard } from "@/components/product/ProductAttributesCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

const BrandProductViewPage: FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  async function loadProduct() {
    try {
      setLoading(true);
      const data = await getProductById(productId);
      setProduct(data);
    } catch {
      toast.error("Product not found");
      router.push("/brand/products");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  if (!product) return null;

  const images = product.images ?? [];

  const statusColor =
    product.status === "active"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : product.status === "draft"
      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  return (
    <div className="max-w-6xl mx-auto px-4 pb-32 space-y-10 text-white">

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="pl-0 text-zinc-400 hover:text-white"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        <Button
          className="bg-white text-black hover:bg-zinc-200 font-semibold gap-2"
          onClick={() => router.push(`/brand/products/${productId}/edit`)}
        >
          <Edit className="w-4 h-4" />
          Edit Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Images */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-square rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden shadow-2xl">
            {images[selectedImage] ? (
              <img
                src={images[selectedImage].imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ShoppingBag className="w-24 h-24 text-zinc-600" />
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border transition ${
                    selectedImage === i
                      ? "border-white"
                      : "border-white/10 hover:border-white/40"
                  }`}
                >
                  <img src={img.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="space-y-3 pt-4">
            <h2 className="text-xl font-bold">Description</h2>
            <p className="text-zinc-400 leading-relaxed">{product.description}</p>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-5">

          {/* Main info */}
          <Card className="bg-zinc-900/80 border-white/5 shadow-xl">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-1">
                <div className="text-xs text-purple-400 font-medium">
                  {product.category?.name ?? "Uncategorized"}
                </div>
                <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>
              </div>

              <Badge variant="outline" className={`capitalize ${statusColor}`}>
                {product.status}
              </Badge>

              <div className="flex items-center gap-2 text-3xl font-bold">
                <span className="text-zinc-400 text-2xl">₹</span>
                {product.price.toFixed(2)}
              </div>

              {product.compareAtPrice && (
                <div className="text-sm text-zinc-500 line-through">
                  Compare at: ₹{product.compareAtPrice.toFixed(2)}
                </div>
              )}

              <div className="space-y-3 pt-4 border-t border-white/10 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span className="flex items-center gap-2"><Tag className="w-4 h-4" /> SKU</span>
                  <span className="text-white font-medium">{product.sku ?? "—"}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span className="flex items-center gap-2"><Package className="w-4 h-4" /> Stock</span>
                  <span className={`font-medium ${product.stockQuantity === 0 ? "text-red-400" : "text-white"}`}>
                    {product.stockQuantity} units
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span className="flex items-center gap-2"><Star className="w-4 h-4" /> Rating</span>
                  <span className="text-white font-medium">
                    {product.averageRating} ({product.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span className="flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Featured</span>
                  <span className="text-white font-medium">{product.isFeatured ? "Yes" : "No"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata / Specifications */}
          <ProductAttributesCard metadata={product.metadata} />

        </div>
      </div>
    </div>
  );
};

export default BrandProductViewPage;
