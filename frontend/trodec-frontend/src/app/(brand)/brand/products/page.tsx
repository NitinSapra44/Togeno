"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Package,
    Plus,
    Search,
    Loader2,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    DollarSign,
    Tag
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getBrandProducts, Product } from "@/services";
import { deleteProduct } from "@/services/products.service";
import { ProductTags } from "@/components/product/product-tags";

export default function BrandProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    async function fetchProducts() {
        try {
            setIsLoading(true);
            const params: any = {};
            if (statusFilter !== "all") {
                params.status = statusFilter;
            }
            const result = await getBrandProducts(params);
            setProducts(result.data);
        } catch (error: any) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to load products");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, [statusFilter]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            setDeletingId(id);
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
            toast.success("Product deleted successfully");
        } catch (error: any) {
            console.error("Failed to delete product:", error);
            toast.error("Failed to delete product");
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case 'draft': return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            case 'inactive': return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
            default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">My Products</h1>
                    <p className="text-zinc-400 mt-1">
                        Manage your product catalog and inventory
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/brand/products/new')}
                    className="h-9 text-sm bg-white text-black hover:bg-zinc-200 font-medium"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                    placeholder="Search products..."
                    className="pl-9 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Products List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="bg-zinc-900/50 border-white/5 flex flex-col h-[280px]">
                            <CardContent className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <Skeleton className="w-16 h-16 rounded-lg bg-white/5" />
                                    <Skeleton className="w-8 h-8 rounded-md bg-white/5" />
                                </div>
                                <div className="mb-4 flex-1 space-y-3">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-20 bg-white/5" />
                                        <Skeleton className="h-4 w-16 bg-white/5" />
                                    </div>
                                    <Skeleton className="h-5 w-3/4 bg-white/5" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
                                        <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
                                    </div>
                                </div>
                                <div className="space-y-3 pt-4 border-t border-white/5 mt-auto flex justify-between items-center">
                                    <Skeleton className="h-6 w-16 rounded-full bg-white/5" />
                                    <Skeleton className="h-4 w-20 bg-white/5" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <Card className="bg-[#0b0b0b] border border-white/5 shadow-lg rounded-3xl overflow-hidden">
                    <CardContent className="py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                            <Package className="h-10 w-10 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-white">
                            {searchQuery ? "No products match your search" : "No products yet"}
                        </h3>
                        <p className="text-zinc-400 mb-8 max-w-sm">
                            {searchQuery
                                ? `We couldn't find any products matching "${searchQuery}".`
                                : "Add your first product to start selling and collaborating."}
                        </p>
                        {!searchQuery && (
                            <Button
                                onClick={() => router.push('/brand/products/new')}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl px-8 h-12 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Product
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                        <Card
                            key={product.id}
                            className="bg-zinc-900/50 border-white/5 hover:border-white/10 transition-colors group flex flex-col"
                        >
                            <CardContent className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                                        {product.images?.[0]?.imageUrl ? (
                                            <img src={product.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                                <Package className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/10"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10">
                                            <DropdownMenuItem
                                                onClick={() => router.push(`/brand/products/${product.id}`)}
                                                className="text-zinc-300 focus:text-white focus:bg-white/10 cursor-pointer"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => router.push(`/brand/products/${product.id}/edit`)}
                                                className="text-zinc-300 focus:text-white focus:bg-white/10 cursor-pointer"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                                                disabled={deletingId === product.id}
                                            >
                                                {deletingId === product.id ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                )}
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="mb-4 flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="text-xs text-purple-400 font-medium">{product.category?.name || "Uncategorized"}</div>
                                        <div className="text-sm font-bold text-white">₹{product.price.toFixed(2)}</div>
                                    </div>
                                    <h3 className="font-semibold text-white mb-2 line-clamp-1" title={product.name}>
                                        {product.name}
                                    </h3>

                                    <ProductTags tags={(product.metadata as any)?.tags} />
                                    <p className="text-sm text-zinc-400 line-clamp-2">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-white/5 mt-auto">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className={`capitalize ${getStatusColor(product.status)}`}>
                                            {product.status}
                                        </Badge>
                                        <div className="flex items-center text-xs text-zinc-500">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {product.stockQuantity} in stock
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
