"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
  ImagePlus,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  updateProductImage,
  type ProductImage,
} from "@/services/products.service";
import { getCategories } from "@/services";
import { uploadProductImage } from "@/services/upload.service";

const CATEGORY_ATTRIBUTES: Record<string, { label: string; name: string; placeholder?: string }[]> = {
  fashion: [
    { label: "Gender", name: "gender", placeholder: "Male / Female / Unisex" },
    { label: "Size", name: "size", placeholder: "S, M, L, XL" },
    { label: "Color", name: "color", placeholder: "e.g. Navy Blue" },
    { label: "Material", name: "material", placeholder: "e.g. Cotton" },
  ],
  apparel: [
    { label: "Gender", name: "gender", placeholder: "Male / Female / Unisex" },
    { label: "Size", name: "size", placeholder: "S, M, L, XL" },
    { label: "Color", name: "color", placeholder: "e.g. Black" },
    { label: "Material", name: "material", placeholder: "e.g. Polyester" },
  ],
  electronics: [
    { label: "Battery Power", name: "batteryPower", placeholder: "e.g. 5000 mAh" },
    { label: "RAM", name: "ram", placeholder: "e.g. 8 GB" },
    { label: "Storage", name: "storage", placeholder: "e.g. 128 GB" },
    { label: "Connectivity", name: "connectivity", placeholder: "e.g. Bluetooth 5.0, WiFi 6" },
  ],
  shoes: [
    { label: "Size", name: "size", placeholder: "e.g. UK 8 / EU 42" },
    { label: "Sole Type", name: "soleType", placeholder: "e.g. Rubber, EVA" },
    { label: "Usage Type", name: "usageType", placeholder: "e.g. Running, Casual" },
  ],
};

function getAttributesForCategory(categoryName: string) {
  const key = categoryName.toLowerCase();
  for (const [k, attrs] of Object.entries(CATEGORY_ATTRIBUTES)) {
    if (key.includes(k)) return attrs;
  }
  return [];
}

interface NewImageFile {
  uid: string;
  file: File;
  preview: string;
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [dynamicAttributes, setDynamicAttributes] = useState<Record<string, string>>({});

  // Image state
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newImages, setNewImages] = useState<NewImageFile[]>([]);
  // primaryKey = existing image ID or new image UID
  const [primaryKey, setPrimaryKey] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [uploadingUids, setUploadingUids] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    stockQuantity: "",
    categoryId: "",
    status: "active",
    isFeatured: false,
  });

  const [metadata, setMetadata] = useState({
    categoryDisplay: "",
    tags: "",
  });

  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [productId]);

  // Revoke preview URLs on unmount
  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCategories() {
    try {
      const result = await getCategories();
      setCategories(result);
    } catch {
      toast.error("Failed to load categories");
    }
  }

  async function loadProduct() {
    try {
      setIsLoading(true);
      const data = await getProductById(productId);

      setFormData({
        name: data.name,
        description: data.description || "",
        shortDescription: data.shortDescription || "",
        price: data.price.toString(),
        compareAtPrice: data.compareAtPrice?.toString() || "",
        sku: data.sku || "",
        stockQuantity: data.stockQuantity?.toString() || "0",
        categoryId: data.categoryId,
        status: data.status,
        isFeatured: data.isFeatured || false,
      });

      const m = (data.metadata as Record<string, any>) || {};
      setMetadata({
        categoryDisplay: m.categoryDisplay || "",
        tags: Array.isArray(m.tags) ? m.tags.join(", ") : (m.tags || ""),
      });
      setDynamicAttributes(m.attributes || {});

      const sorted = [...(data.images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
      setExistingImages(sorted);
      const primary = sorted.find((i) => i.isPrimary);
      setPrimaryKey(primary?.id ?? sorted[0]?.id ?? null);
    } catch {
      toast.error("Product not found");
      router.push("/brand/products");
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleMetadataChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttributeChange = (name: string, value: string) => {
    setDynamicAttributes((prev) => ({ ...prev, [name]: value }));
  };

  // ── Image handlers ──────────────────────────────────────────────────────────

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const validTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
      const added: NewImageFile[] = [];

      Array.from(files).forEach((file) => {
        if (!validTypes.has(file.type)) {
          toast.error(`${file.name}: only JPG, PNG, WebP allowed`);
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: max 5MB`);
          return;
        }
        added.push({
          uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          preview: URL.createObjectURL(file),
        });
      });

      if (added.length === 0) return;

      setNewImages((prev) => [...prev, ...added]);
      // Auto-assign primary if nothing is set yet
      setPrimaryKey((pk) => (pk ? pk : added[0].uid));
    },
    []
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  async function handleRemoveExisting(imageId: string) {
    setRemovingId(imageId);
    try {
      await deleteProductImage(productId, imageId);
      setExistingImages((prev) => {
        const next = prev.filter((i) => i.id !== imageId);
        if (primaryKey === imageId) {
          setPrimaryKey(next[0]?.id ?? newImages[0]?.uid ?? null);
        }
        return next;
      });
    } catch {
      toast.error("Failed to remove image");
    } finally {
      setRemovingId(null);
    }
  }

  function handleRemoveNew(uid: string) {
    setNewImages((prev) => {
      const target = prev.find((i) => i.uid === uid);
      if (target) URL.revokeObjectURL(target.preview);
      const next = prev.filter((i) => i.uid !== uid);
      if (primaryKey === uid) {
        setPrimaryKey(next[0]?.uid ?? existingImages[0]?.id ?? null);
      }
      return next;
    });
  }

  async function handleSetPrimary(key: string) {
    const isExisting = existingImages.some((i) => i.id === key);
    if (isExisting && key !== primaryKey) {
      try {
        await updateProductImage(productId, key, { isPrimary: true });
        setExistingImages((prev) =>
          prev.map((img) => ({ ...img, isPrimary: img.id === key }))
        );
      } catch {
        toast.error("Failed to set primary image");
        return;
      }
    }
    setPrimaryKey(key);
  }

  // ──────────────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSaving(true);

    try {
      await updateProduct(productId, {
        categoryId: formData.categoryId,
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: Number.parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number.parseFloat(formData.compareAtPrice) : undefined,
        sku: formData.sku || undefined,
        stockQuantity: formData.stockQuantity ? Number.parseInt(formData.stockQuantity) : 0,
        status: formData.status as any,
        isFeatured: formData.isFeatured,
        metadata: {
          categoryDisplay: metadata.categoryDisplay,
          tags: metadata.tags ? metadata.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          attributes: dynamicAttributes,
        },
      });

      // Upload pending new images
      if (newImages.length > 0) {
        const baseOrder = existingImages.length;
        for (let i = 0; i < newImages.length; i++) {
          const img = newImages[i];
          const isPrimary = primaryKey === img.uid;

          setUploadingUids((prev) => new Set([...prev, img.uid]));
          try {
            await uploadProductImage(productId, img.file, isPrimary, baseOrder + i);
          } catch {
            toast.error(`Failed to upload image ${i + 1}`);
          } finally {
            setUploadingUids((prev) => {
              const next = new Set(prev);
              next.delete(img.uid);
              return next;
            });
          }
        }
        newImages.forEach((img) => URL.revokeObjectURL(img.preview));
        setNewImages([]);
      }

      toast.success("Product updated successfully");
      router.push("/brand/products");
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
      router.push("/brand/products");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
      setIsDeleting(false);
    }
  }

  const selectedCatName = categories.find((c) => c.id === formData.categoryId)?.name ?? "";
  const categoryAttrs = getAttributesForCategory(selectedCatName);
  const totalImages = existingImages.length + newImages.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 text-white">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Product</h1>
          <p className="text-sm text-zinc-400">Update product details and images</p>
        </div>
      </div>

      <Card className="bg-[#0b0b0b] border border-[#1f1f1f] p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Product Images ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">
                Product Photos
                {totalImages > 0 && (
                  <span className="ml-2 text-xs text-zinc-500">
                    ({totalImages} image{totalImages !== 1 ? "s" : ""})
                  </span>
                )}
              </label>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ""; }}
            />

            {totalImages > 0 ? (
              <div className="space-y-4">
                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    {newImages.length > 0 && (
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Uploaded</p>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {existingImages.map((img) => {
                        const isPrimary = primaryKey === img.id;
                        const isRemoving = removingId === img.id;
                        return (
                          <div key={img.id} className="relative group aspect-square">
                            <img
                              src={img.imageUrl}
                              alt={img.altText || "Product image"}
                              className={`w-full h-full object-cover rounded-lg border transition-all ${
                                isPrimary ? "border-purple-500" : "border-[#2a2a2a]"
                              }`}
                            />
                            {isPrimary && (
                              <div className="absolute top-1.5 left-1.5 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <Star className="h-2.5 w-2.5" />
                                Main
                              </div>
                            )}
                            {isRemoving ? (
                              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-white" />
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPrimary(img.id)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-md transition-colors"
                                  >
                                    Set Main
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExisting(img.id)}
                                  className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-md transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* New (pending upload) images */}
                {newImages.length > 0 && (
                  <div className="space-y-2">
                    {existingImages.length > 0 && (
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                        New — will upload on save
                      </p>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {newImages.map((img) => {
                        const isPrimary = primaryKey === img.uid;
                        const isUploading = uploadingUids.has(img.uid);
                        return (
                          <div key={img.uid} className="relative group aspect-square">
                            <img
                              src={img.preview}
                              alt=""
                              className={`w-full h-full object-cover rounded-lg border transition-all ${
                                isPrimary ? "border-purple-500" : "border-dashed border-[#3a3a3a]"
                              }`}
                            />
                            <div className="absolute bottom-1.5 right-1.5 bg-zinc-800/90 text-zinc-400 text-[9px] font-medium px-1.5 py-0.5 rounded-md">
                              Pending
                            </div>
                            {isPrimary && (
                              <div className="absolute top-1.5 left-1.5 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <Star className="h-2.5 w-2.5" />
                                Main
                              </div>
                            )}
                            {isUploading ? (
                              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-white" />
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                {!isPrimary && (
                                  <button
                                    type="button"
                                    onClick={() => setPrimaryKey(img.uid)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-md transition-colors"
                                  >
                                    Set Main
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNew(img.uid)}
                                  className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-md transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Compact add-more zone */}
                <label
                  htmlFor="edit-add-more"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex items-center gap-3 border border-dashed rounded-xl px-5 py-4 cursor-pointer transition-colors group ${
                    isDragging
                      ? "border-purple-500 bg-purple-500/5"
                      : "border-[#2a2a2a] hover:border-purple-500/50"
                  }`}
                >
                  <input
                    id="edit-add-more"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ""; }}
                  />
                  <ImagePlus className={`h-5 w-5 shrink-0 transition-colors ${isDragging ? "text-purple-400" : "text-zinc-500 group-hover:text-purple-400"}`} />
                  <span className={`text-sm transition-colors ${isDragging ? "text-zinc-300" : "text-zinc-400 group-hover:text-zinc-300"}`}>
                    Drop images here or{" "}
                    <span className="text-purple-400 font-medium">click to add more</span>
                    <span className="ml-2 text-zinc-600 text-xs">JPG, PNG, WebP · max 5MB</span>
                  </span>
                </label>
              </div>
            ) : (
              /* Empty state — full drop zone */
              <label
                htmlFor="edit-product-images"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative flex flex-col items-center border-2 border-dashed rounded-xl p-10 text-center transition-colors group cursor-pointer ${
                  isDragging
                    ? "border-purple-500 bg-purple-500/5"
                    : "border-[#2a2a2a] hover:border-purple-500/50"
                }`}
              >
                <input
                  id="edit-product-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ""; }}
                />
                <Upload className={`h-8 w-8 mb-3 transition-colors ${isDragging ? "text-purple-400" : "text-zinc-600 group-hover:text-purple-400"}`} />
                <p className={`text-sm transition-colors ${isDragging ? "text-zinc-300" : "text-zinc-400 group-hover:text-zinc-300"}`}>
                  Drop images here or{" "}
                  <span className="text-purple-400 font-medium">click to browse</span>
                </p>
                <p className="text-xs text-zinc-600 mt-1">JPG, PNG, WebP — max 5MB each</p>
              </label>
            )}
          </div>

          {/* ── Name ── */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Product Name <span className="text-red-400">*</span></label>
            <Input name="name" required value={formData.name} onChange={handleChange} className="bg-[#111111] border-[#1f1f1f]" />
          </div>

          {/* ── Short Description ── */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Short Description</label>
            <Input name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="bg-[#111111] border-[#1f1f1f]" placeholder="Brief one-line summary" />
          </div>

          {/* ── Description ── */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Description</label>
            <Textarea name="description" value={formData.description} onChange={handleChange} className="bg-[#111111] border-[#1f1f1f] min-h-30" />
          </div>

          {/* ── Price & Category ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Price (₹) <span className="text-red-400">*</span></label>
              <Input name="price" type="number" step="0.01" required value={formData.price} onChange={handleChange} className="bg-[#111111] border-[#1f1f1f]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Category <span className="text-red-400">*</span></label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full rounded-md bg-[#111111] border border-[#1f1f1f] text-white px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Compare Price ── */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Compare at Price (₹)</label>
            <Input name="compareAtPrice" type="number" step="0.01" value={formData.compareAtPrice} onChange={handleChange} className="bg-[#111111] border-[#1f1f1f]" placeholder="Original price (for showing discount)" />
          </div>

          {/* ── Categorization ── */}
          <div className="pt-4 border-t border-[#1f1f1f] space-y-6">
            <h3 className="text-lg font-medium text-white">Categorization</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Primary Category (Display)</label>
                <select
                  name="categoryDisplay"
                  value={metadata.categoryDisplay}
                  onChange={handleMetadataChange}
                  className="w-full rounded-xl bg-[#111111] border border-[#1f1f1f] text-white px-4 py-3 text-sm"
                >
                  <option value="">Select category...</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Audio">Audio</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Home">Home</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Tags (comma separated)</label>
                <Input
                  name="tags"
                  placeholder="e.g. Eco-friendly, Best Seller"
                  value={metadata.tags}
                  onChange={handleMetadataChange}
                  className="bg-[#111111] border-[#1f1f1f] rounded-xl h-12"
                />
              </div>
            </div>
          </div>

          {/* ── Dynamic Product Attributes ── */}
          {categoryAttrs.length > 0 && (
            <div className="pt-4 border-t border-[#1f1f1f] space-y-4">
              <h3 className="text-lg font-medium text-white">Product Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryAttrs.map((attr) => (
                  <div key={attr.name} className="space-y-2">
                    <label className="text-sm text-zinc-300">{attr.label}</label>
                    <Input
                      placeholder={attr.placeholder}
                      value={dynamicAttributes[attr.name] ?? ""}
                      onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                      className="bg-[#111111] border-[#1f1f1f] rounded-xl"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Inventory ── */}
          <div className="pt-4 border-t border-[#1f1f1f] grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">SKU</label>
              <Input name="sku" value={formData.sku} onChange={handleChange} className="bg-[#111111] border-[#1f1f1f]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Stock</label>
              <Input name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} className="bg-[#111111] border-[#1f1f1f]" />
            </div>
          </div>

          {/* ── Status ── */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md bg-[#111111] border border-[#1f1f1f] text-white px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* ── Footer ── */}
          <div className="pt-6 flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-400 hover:bg-red-500/10"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </Button>

            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadingUids.size > 0 ? "Uploading images…" : "Saving…"}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {newImages.length > 0
                      ? `Save & Upload ${newImages.length} Image${newImages.length !== 1 ? "s" : ""}`
                      : "Save Changes"}
                  </>
                )}
              </Button>
            </div>
          </div>

        </form>
      </Card>
    </div>
  );
}
