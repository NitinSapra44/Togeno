"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Loader2, Save, Upload, X, ImagePlus, Star,
  Package, FileText, Hash, RefreshCw, Eye,
  TrendingUp, Check, Info, Sliders, BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import { createProduct } from "@/services/products.service";
import { getCategories, updatePitch } from "@/services";
import { uploadProductImage } from "@/services/upload.service";
import { cn } from "@/lib/utils";

// ── Attribute field types ─────────────────────────────────────────
type AttrType = "text" | "select" | "multi";

interface AttrConfig {
  label: string;
  name: string;
  type: AttrType;
  placeholder?: string;
  options?: string[];
}

// ── Per-category smart attribute definitions ──────────────────────
const CATEGORY_ATTRS: Record<string, AttrConfig[]> = {
  fashion: [
    { label: "Gender", name: "gender", type: "select", options: ["Men", "Women", "Unisex", "Boys", "Girls"] },
    { label: "Available Sizes", name: "sizes", type: "multi", options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"] },
    { label: "Material", name: "material", type: "select", options: ["Cotton", "Polyester", "Silk", "Linen", "Denim", "Wool", "Nylon", "Rayon", "Viscose", "Blend"] },
    { label: "Fit Type", name: "fitType", type: "select", options: ["Slim Fit", "Regular Fit", "Relaxed Fit", "Oversized", "Skinny", "Straight"] },
    { label: "Occasion", name: "occasion", type: "multi", options: ["Casual", "Formal", "Sports", "Party", "Wedding", "Ethnic", "Lounge"] },
  ],
  apparel: [
    { label: "Gender", name: "gender", type: "select", options: ["Men", "Women", "Unisex", "Boys", "Girls"] },
    { label: "Available Sizes", name: "sizes", type: "multi", options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"] },
    { label: "Material", name: "material", type: "select", options: ["Cotton", "Polyester", "Silk", "Linen", "Denim", "Wool", "Nylon", "Rayon", "Viscose", "Blend"] },
    { label: "Fit Type", name: "fitType", type: "select", options: ["Slim Fit", "Regular Fit", "Relaxed Fit", "Oversized", "Skinny", "Straight"] },
  ],
  electronics: [
    { label: "Brand", name: "brand", type: "text", placeholder: "e.g. Samsung, Apple" },
    { label: "Battery", name: "battery", type: "text", placeholder: "e.g. 5000 mAh" },
    { label: "RAM", name: "ram", type: "select", options: ["2 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB", "32 GB", "Not Applicable"] },
    { label: "Storage", name: "storage", type: "select", options: ["16 GB", "32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "Not Applicable"] },
    { label: "Connectivity", name: "connectivity", type: "multi", options: ["Bluetooth", "WiFi", "NFC", "USB-C", "USB-A", "HDMI", "5G", "4G", "GPS"] },
    { label: "Warranty", name: "warranty", type: "select", options: ["No Warranty", "3 Months", "6 Months", "1 Year", "2 Years", "3 Years"] },
    { label: "Compatible With", name: "compatibility", type: "multi", options: ["Android", "iOS", "Windows", "macOS", "Linux", "Smart TV", "Universal"] },
  ],
  shoes: [
    { label: "UK Sizes", name: "sizes", type: "multi", options: ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"] },
    { label: "Material", name: "material", type: "select", options: ["Leather", "Canvas", "Mesh", "Suede", "Synthetic", "Rubber"] },
    { label: "Sole Type", name: "soleType", type: "select", options: ["Rubber", "EVA", "PU", "Leather", "TPU"] },
    { label: "Usage", name: "usage", type: "multi", options: ["Casual", "Running", "Formal", "Sports", "Hiking", "Gym", "Party"] },
    { label: "Gender", name: "gender", type: "select", options: ["Men", "Women", "Unisex", "Boys", "Girls"] },
  ],
  beauty: [
    { label: "Skin Type", name: "skinType", type: "multi", options: ["Oily", "Dry", "Normal", "Combination", "Sensitive", "All Types"] },
    { label: "Key Ingredients", name: "ingredients", type: "text", placeholder: "e.g. Hyaluronic Acid, Vitamin C" },
    { label: "Fragrance", name: "fragrance", type: "select", options: ["Floral", "Fruity", "Woody", "Fresh", "Musk", "Citrus", "Unscented"] },
    { label: "Usage Time", name: "usageTime", type: "multi", options: ["Morning", "Night", "Day & Night", "Anytime"] },
    { label: "Skin Concerns", name: "concerns", type: "multi", options: ["Anti-aging", "Brightening", "Moisturizing", "Acne Control", "Dark Circles", "Sun Protection"] },
    { label: "Net Content", name: "netContent", type: "text", placeholder: "e.g. 50ml / 100g" },
  ],
  fitness: [
    { label: "Weight", name: "weight", type: "text", placeholder: "e.g. 2 kg" },
    { label: "Material", name: "material", type: "select", options: ["Rubber", "Iron", "Steel", "Neoprene", "Foam", "Nylon"] },
    { label: "Resistance Level", name: "resistance", type: "select", options: ["Light", "Medium", "Heavy", "Extra Heavy"] },
    { label: "Target Muscle", name: "targetMuscle", type: "multi", options: ["Full Body", "Arms", "Legs", "Core", "Back", "Chest", "Shoulders"] },
    { label: "Suitable For", name: "suitableFor", type: "multi", options: ["Beginners", "Intermediate", "Advanced", "All Levels"] },
  ],
  home: [
    { label: "Material", name: "material", type: "text", placeholder: "e.g. Solid Wood, Stainless Steel" },
    { label: "Style", name: "style", type: "select", options: ["Modern", "Traditional", "Bohemian", "Minimalist", "Industrial", "Scandinavian"] },
    { label: "Room Type", name: "room", type: "multi", options: ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Outdoor"] },
    { label: "Dimensions", name: "dimensions", type: "text", placeholder: "e.g. 100cm × 50cm × 80cm" },
  ],
};

function getAttrsForCategory(categoryName: string): AttrConfig[] {
  const key = categoryName.toLowerCase();
  for (const [k, attrs] of Object.entries(CATEGORY_ATTRS)) {
    if (key.includes(k)) return attrs;
  }
  return [];
}

// ── Image state ───────────────────────────────────────────────────
interface ImageFile {
  id: string; // stable UUID — used as React key so indices never cause flicker
  file: File;
  preview: string;
}

const MAX_IMAGES = 8;

// ── Multi-select chip component ───────────────────────────────────
function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const selected = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(next.join(", "));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all",
              active
                ? "border-purple-500 bg-purple-500/15 text-purple-300"
                : "border-[#2a2a2a] bg-[#111] text-zinc-400 hover:border-purple-500/40 hover:text-zinc-300"
            )}
          >
            {active && <Check className="inline h-2.5 w-2.5 mr-1" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ── Section card header ───────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-purple-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function NewProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pitchId = searchParams.get("pitchId");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    stockQuantity: "",
    categoryId: "",
    status: "draft" as "draft" | "active",
    isFeatured: false,
    stockStatus: "in_stock" as "in_stock" | "low_stock" | "out_of_stock",
  });

  const [categoryDisplay, setCategoryDisplay] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [dynamicAttrs, setDynamicAttrs] = useState<Record<string, string>>({});

  // Keep a ref that always points to the latest images array so stable
  // callbacks can read current state without stale-closure issues.
  const imagesRef = useRef<ImageFile[]>([]);
  useEffect(() => { imagesRef.current = images; }, [images]);

  // Revoke all remaining object URLs when the component unmounts.
  useEffect(() => {
    return () => { imagesRef.current.forEach((img) => URL.revokeObjectURL(img.preview)); };
  }, []);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (name === "categoryId") setDynamicAttrs({});
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // Stable callback — reads latest images from ref so no stale-closure issues.
  // All validation + toasts happen synchronously BEFORE the state update so
  // React StrictMode's double-invoke of updaters won't fire duplicate toasts.
  const handleFilesSelected = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const current = imagesRef.current;
    const slots = MAX_IMAGES - current.length;

    if (slots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images already added`);
      return;
    }

    // Build a set of fingerprints to prevent duplicates.
    const existingKeys = new Set(
      current.map((img) => `${img.file.name}|${img.file.size}|${img.file.lastModified}`)
    );

    const toAdd: ImageFile[] = [];
    let limitHit = false;

    for (const file of Array.from(files)) {
      if (toAdd.length >= slots) { limitHit = true; break; }
      if (!validTypes.has(file.type)) {
        toast.error(`${file.name}: only JPG, PNG, or WebP allowed`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: exceeds 5 MB limit`);
        continue;
      }
      const key = `${file.name}|${file.size}|${file.lastModified}`;
      if (existingKeys.has(key)) continue; // silent skip — already added
      existingKeys.add(key);
      toAdd.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
    }

    if (limitHit) toast.error(`Max ${MAX_IMAGES} images — some files were skipped`);
    if (toAdd.length === 0) return;

    const isFirstBatch = current.length === 0;
    setImages((prev) => [...prev, ...toAdd]);
    if (isFirstBatch) setPrimaryIndex(0); // auto-set first image as primary
  }, []); // stable — depends only on the ref, never on images state directly

  const removeImage = useCallback((index: number) => {
    // Revoke the removed image's object URL immediately.
    const img = imagesRef.current[index];
    if (img) URL.revokeObjectURL(img.preview);

    // State update uses functional form — safe for concurrent React.
    setImages((prev) => prev.filter((_, i) => i !== index));

    // Adjust primary index without reading stale closure state.
    setPrimaryIndex((prev) => {
      if (index < prev) return prev - 1;   // item before primary removed → shift down
      if (index === prev) return Math.max(0, prev - 1); // primary removed → previous item
      return prev;                          // item after primary removed → unchanged
    });
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const generateSKU = () => {
    const prefix = formData.name.slice(0, 3).toUpperCase().replace(/\s/g, "") || "PRD";
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    setFormData((prev) => ({ ...prev, sku: `${prefix}-${rand}` }));
  };

  const addTag = (raw: string) => {
    const t = raw.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Name, price, and category are required");
      return;
    }
    setIsLoading(true);
    try {
      const newProduct = await createProduct({
        categoryId: formData.categoryId,
        name: formData.name,
        shortDescription: formData.shortDescription,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number.parseFloat(formData.compareAtPrice) : undefined,
        sku: formData.sku || undefined,
        stockQuantity: formData.stockQuantity ? Number.parseInt(formData.stockQuantity) : 0,
        status: formData.status,
        isFeatured: formData.isFeatured,
        metadata: {
          categoryDisplay,
          tags,
          attributes: dynamicAttrs,
          stockStatus: formData.stockStatus,
        },
      });

      for (let i = 0; i < images.length; i++) {
        setUploadingIndex(i);
        try {
          await uploadProductImage(newProduct.id, images[i].file, i === primaryIndex, i);
        } catch {
          toast.error(`Failed to upload image ${i + 1}`);
        }
      }
      setUploadingIndex(null);

      if (pitchId && newProduct?.id) {
        await updatePitch(pitchId, { productId: newProduct.id });
        toast.success("Product created and linked to pitch!");
        router.push(`/brand/pitches/${pitchId}`);
      } else {
        toast.success("Product created successfully");
        router.push("/brand/products");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedCatName = categories.find((c) => c.id === formData.categoryId)?.name ?? "";
  const categoryAttrs = getAttrsForCategory(selectedCatName);
  const previewImage = images[primaryIndex]?.preview ?? null;
  const previewPrice = formData.price ? Number.parseFloat(formData.price) : null;
  const previewMRP = formData.compareAtPrice ? Number.parseFloat(formData.compareAtPrice) : null;
  const discount =
    previewMRP && previewPrice && previewMRP > previewPrice
      ? Math.round(((previewMRP - previewPrice) / previewMRP) * 100)
      : null;

  const submitLabel = isLoading
    ? uploadingIndex !== null
      ? `Uploading ${uploadingIndex + 1}/${images.length}…`
      : "Creating…"
    : "Create Product";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 text-white pb-28 lg:pb-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/10 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Complete all sections to list your product on Trodec.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* ── Left: Form sections ── */}
          <div className="space-y-5">

            {/* 1 · Product Media */}
            <Card className="bg-[#0b0b0b] border border-[#1f1f1f] p-6">
              <SectionHeader
                icon={ImagePlus}
                title="Product Media"
                subtitle="High-quality images increase conversion — use clean backgrounds"
              />

              {/* Hidden main file input */}
              <input
                ref={fileInputRef}
                id="product-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={isLoading || images.length >= MAX_IMAGES}
                className="sr-only"
                onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ""; }}
              />

              {images.length === 0 ? (
                <label
                  htmlFor="product-images"
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer group",
                    isDragging
                      ? "border-purple-500 bg-purple-500/5"
                      : "border-[#2a2a2a] hover:border-purple-500/40 hover:bg-white/[0.01]"
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mb-4">
                    <Upload className={cn("h-6 w-6 transition-colors", isDragging ? "text-purple-400" : "text-zinc-600 group-hover:text-purple-400")} />
                  </div>
                  <p className="text-sm font-medium text-zinc-300">
                    {isDragging ? "Drop to upload" : "Drag & drop images here"}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1.5">
                    or <span className="text-purple-400 font-medium">click to browse</span>
                  </p>
                  <div className="flex items-center gap-3 mt-5">
                    {["JPG", "PNG", "WebP"].map((f) => (
                      <span key={f} className="text-[10px] bg-[#111] border border-[#222] text-zinc-500 px-2 py-1 rounded">
                        {f}
                      </span>
                    ))}
                    <span className="text-[10px] text-zinc-600">Max 5 MB each</span>
                  </div>
                </label>
              ) : (
                <div className="space-y-4">
                  {/* Preview grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, idx) => {
                      const uploading = uploadingIndex === idx;
                      const primary = idx === primaryIndex;
                      return (
                        <div
                          key={img.id}
                          className={cn(
                            "relative group aspect-square rounded-xl overflow-hidden border-2 transition-all",
                            primary ? "border-purple-500" : "border-[#1f1f1f] hover:border-[#333]"
                          )}
                        >
                          <img
                            src={img.preview}
                            alt=""
                            className="w-full h-full object-contain bg-[#0a0a0a]"
                          />

                          {primary && (
                            <div className="absolute top-2 left-2 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-lg pointer-events-none">
                              <Star className="h-2.5 w-2.5 fill-white" />
                              Main
                            </div>
                          )}

                          {uploading ? (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin text-white" />
                              <span className="text-[10px] text-zinc-300 font-medium">Uploading…</span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-end p-2 gap-1.5">
                              {!primary && (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setPrimaryIndex(idx); }}
                                  className="w-full text-[10px] font-semibold bg-purple-600 hover:bg-purple-500 text-white py-1 rounded-md transition-colors"
                                >
                                  Set Main
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                className="w-full text-[10px] font-semibold bg-red-600/80 hover:bg-red-600 text-white py-1 rounded-md transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add more tile — hidden when at max capacity or uploading */}
                    {images.length < MAX_IMAGES && !isLoading && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-[#2a2a2a] hover:border-purple-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-purple-400 transition-colors"
                      >
                        <ImagePlus className="h-5 w-5" />
                        <span className="text-[10px] font-medium">Add more</span>
                      </button>
                    )}
                  </div>

                  {/* Compact drop zone — disabled when at max capacity or uploading */}
                  {images.length < MAX_IMAGES && !isLoading ? (
                    <label
                      htmlFor="product-images-extra"
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                      className={cn(
                        "flex items-center gap-3 border border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors group",
                        isDragging ? "border-purple-500 bg-purple-500/5" : "border-[#2a2a2a] hover:border-purple-500/40"
                      )}
                    >
                      <input
                        id="product-images-extra"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="sr-only"
                        onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ""; }}
                      />
                      <Upload className={cn("h-4 w-4 shrink-0 transition-colors", isDragging ? "text-purple-400" : "text-zinc-500 group-hover:text-purple-400")} />
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        Drop more images or <span className="text-purple-400">click to browse</span>
                      </span>
                      <span className="ml-auto text-xs text-zinc-700 shrink-0">{images.length} / {MAX_IMAGES}</span>
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 border border-dashed border-[#1f1f1f] rounded-xl px-4 py-3 opacity-50">
                      <Upload className="h-4 w-4 shrink-0 text-zinc-600" />
                      <span className="text-xs text-zinc-600">
                        {isLoading ? "Upload in progress…" : `Maximum ${MAX_IMAGES} images reached`}
                      </span>
                      <span className="ml-auto text-xs text-zinc-700 shrink-0">{images.length} / {MAX_IMAGES}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* 2 · Basic Information */}
            <Card className="bg-[#0b0b0b] border border-[#1f1f1f] p-6">
              <SectionHeader
                icon={FileText}
                title="Basic Information"
                subtitle="Name and description are the first things consumers read"
              />

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Product Name <span className="text-red-400 normal-case font-normal">*</span>
                  </label>
                  <Input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Premium Wireless Earbuds with ANC"
                    className="bg-[#111] border-[#1f1f1f] h-11 focus:border-purple-500/50"
                  />
                  <p className="text-[11px] text-zinc-600">Be specific — clear names improve search ranking</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Short Description</label>
                  <Textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    placeholder="One-liner shown on product cards (max 120 chars)"
                    maxLength={120}
                    rows={2}
                    className="bg-[#111] border-[#1f1f1f] focus:border-purple-500/50 resize-none"
                  />
                  <p className="text-[11px] text-zinc-600">{formData.shortDescription.length} / 120 characters</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Detailed Description</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe features, materials, use cases, and what makes this product unique…"
                    rows={6}
                    className="bg-[#111] border-[#1f1f1f] focus:border-purple-500/50"
                  />
                </div>
              </div>
            </Card>

            {/* 3 · Category & Tags */}
            <Card className="bg-[#0b0b0b] border border-[#1f1f1f] p-6">
              <SectionHeader
                icon={Hash}
                title="Category & Tags"
                subtitle="Accurate categorization improves consumer discovery"
              />

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Category <span className="text-red-400 normal-case font-normal">*</span>
                    </label>
                    <select
                      name="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="w-full h-11 rounded-lg bg-[#111] border border-[#1f1f1f] text-white px-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                      <option value="">Select category…</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Display Category</label>
                    <select
                      value={categoryDisplay}
                      onChange={(e) => setCategoryDisplay(e.target.value)}
                      className="w-full h-11 rounded-lg bg-[#111] border border-[#1f1f1f] text-white px-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                      <option value="">Select display…</option>
                      {["Electronics", "Fashion", "Accessories", "Audio", "Fitness", "Apparel", "Beauty", "Home", "Food", "Other"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tag chip input */}
                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tags</label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }
                        if (e.key === ",") { e.preventDefault(); addTag(tagInput); }
                      }}
                      placeholder="Type a tag and press Enter or comma"
                      className="bg-[#111] border-[#1f1f1f] h-10 flex-1 focus:border-purple-500/50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(tagInput)}
                      className="border-[#2a2a2a] text-zinc-400 hover:text-white h-10 px-4"
                    >
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1.5 text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                            className="hover:text-white transition-colors"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-zinc-600">Tags like "Eco-friendly", "Gift idea", "Best Seller" boost visibility</p>
                </div>
              </div>
            </Card>

            {/* 4 · Product Specifications (dynamic) */}
            {categoryAttrs.length > 0 && (
              <Card className="bg-[#0b0b0b] border border-[#1f1f1f] p-6">
                <SectionHeader
                  icon={Sliders}
                  title="Product Specifications"
                  subtitle={`Smart fields auto-loaded for ${selectedCatName}`}
                />

                <div className="space-y-6">
                  {categoryAttrs.map((attr) => (
                    <div key={attr.name} className="space-y-2">
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        {attr.label}
                      </label>

                      {attr.type === "text" && (
                        <Input
                          placeholder={attr.placeholder}
                          value={dynamicAttrs[attr.name] ?? ""}
                          onChange={(e) => setDynamicAttrs((p) => ({ ...p, [attr.name]: e.target.value }))}
                          className="bg-[#111] border-[#1f1f1f] h-10 focus:border-purple-500/50"
                        />
                      )}

                      {attr.type === "select" && (
                        <select
                          value={dynamicAttrs[attr.name] ?? ""}
                          onChange={(e) => setDynamicAttrs((p) => ({ ...p, [attr.name]: e.target.value }))}
                          className="w-full h-10 rounded-lg bg-[#111] border border-[#1f1f1f] text-white px-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                        >
                          <option value="">Select {attr.label.toLowerCase()}…</option>
                          {attr.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}

                      {attr.type === "multi" && attr.options && (
                        <ChipSelect
                          options={attr.options}
                          value={dynamicAttrs[attr.name] ?? ""}
                          onChange={(v) => setDynamicAttrs((p) => ({ ...p, [attr.name]: v }))}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 5 · Pricing & Inventory */}
            <Card className="bg-[#0b0b0b] border border-[#1f1f1f] p-6">
              <SectionHeader
                icon={BarChart2}
                title="Pricing & Inventory"
                subtitle="Set competitive pricing to attract brand partnerships"
              />

              <div className="space-y-5">
                {/* Prices */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Selling Price (₹) <span className="text-red-400 normal-case font-normal">*</span>
                    </label>
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="bg-[#111] border-[#1f1f1f] h-11 focus:border-purple-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">MRP / Compare Price (₹)</label>
                    <Input
                      name="compareAtPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.compareAtPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="bg-[#111] border-[#1f1f1f] h-11 focus:border-purple-500/50"
                    />
                  </div>
                </div>

                {/* Discount callout */}
                {discount !== null && (
                  <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-400 font-medium">
                      {discount}% discount badge will show on consumer-facing product cards
                    </span>
                  </div>
                )}

                {/* SKU + Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">SKU</label>
                    <div className="flex gap-2">
                      <Input
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="Auto-generate or type"
                        className="bg-[#111] border-[#1f1f1f] h-10 flex-1 focus:border-purple-500/50"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={generateSKU}
                        title="Auto-generate SKU"
                        className="border-[#2a2a2a] text-zinc-400 hover:text-white h-10 w-10 shrink-0"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Stock Quantity</label>
                    <Input
                      name="stockQuantity"
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      placeholder="0"
                      className="bg-[#111] border-[#1f1f1f] h-10 focus:border-purple-500/50"
                    />
                  </div>
                </div>

                {/* Stock Status */}
                <div className="space-y-2 max-w-xs">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Stock Status</label>
                  <select
                    name="stockStatus"
                    value={formData.stockStatus}
                    onChange={handleChange}
                    className="w-full h-10 rounded-lg bg-[#111] border border-[#1f1f1f] text-white px-3 text-sm focus:outline-none"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* 6 · Visibility & Settings */}
            <Card className="bg-[#0b0b0b] border border-[#1f1f1f] p-6">
              <SectionHeader
                icon={Eye}
                title="Visibility & Settings"
                subtitle="Control how this product appears to consumers"
              />

              <div className="grid grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full h-11 rounded-lg bg-[#111] border border-[#1f1f1f] text-white px-3 text-sm focus:outline-none"
                  >
                    <option value="draft">Draft — not visible</option>
                    <option value="active">Active — visible to all</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, isFeatured: !p.isFeatured }))}
                  className="flex items-center gap-3 h-11 cursor-pointer group text-left"
                >
                  <div
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative shrink-0",
                      formData.isFeatured ? "bg-purple-600" : "bg-[#222] border border-[#333]"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                        formData.isFeatured ? "left-6" : "left-1"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300 font-medium group-hover:text-white transition-colors">Featured Product</p>
                    <p className="text-[11px] text-zinc-600">Shows Trending badge</p>
                  </div>
                </button>
              </div>
            </Card>

          </div>

          {/* ── Right: Live Preview + Submit (desktop) ── */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-4">

              {/* Preview card */}
              <Card className="bg-[#0b0b0b] border border-[#1f1f1f] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-3.5 w-3.5 text-zinc-600" />
                  <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">Live Preview</span>
                </div>

                <div className="rounded-xl overflow-hidden bg-[#0f0f10] border border-white/10 shadow-xl shadow-black/50">
                  {/* Image area */}
                  <div className="relative aspect-square w-full bg-[#0a0a0a] p-2">
                    <div className="w-full h-full rounded-lg bg-[#050505] overflow-hidden flex items-center justify-center">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-zinc-700">
                          <Package className="w-10 h-10" />
                          <span className="text-[10px]">No image yet</span>
                        </div>
                      )}
                      {formData.isFeatured && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <TrendingUp className="w-2.5 h-2.5" />
                          Trending
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="p-3 space-y-2">
                    {categoryDisplay && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                        {categoryDisplay}
                      </span>
                    )}
                    <h3 className="font-semibold text-sm leading-tight text-white line-clamp-2 min-h-[2.5rem]">
                      {formData.name || (
                        <span className="text-zinc-700 italic font-normal">Product name…</span>
                      )}
                    </h3>
                    {formData.shortDescription && (
                      <p className="text-[10px] text-zinc-500 line-clamp-2">{formData.shortDescription}</p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] bg-white/5 border border-white/8 text-zinc-600 px-1.5 py-0.5 rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span className="text-[9px] text-zinc-700">+{tags.length - 3}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-baseline justify-between pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-white">
                          {previewPrice ? `₹${previewPrice.toLocaleString("en-IN")}` : (
                            <span className="text-zinc-600 font-normal text-sm">₹ —</span>
                          )}
                        </span>
                        {discount !== null && (
                          <span className="text-xs text-emerald-400 font-bold">{discount}% off</span>
                        )}
                      </div>
                      {previewMRP && previewMRP > (previewPrice ?? 0) && (
                        <span className="text-xs text-zinc-600 line-through">
                          ₹{previewMRP.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <Button className="w-full text-xs font-bold h-8 rounded-lg bg-white text-black hover:bg-gray-200 mt-1">
                      View Product
                    </Button>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-700 text-center mt-3">Updates as you fill the form</p>
              </Card>

              {/* Desktop submit */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-purple-600 hover:bg-purple-700 font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {submitLabel}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Product
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="w-full text-zinc-500 hover:text-white"
                >
                  Cancel
                </Button>
              </div>

              {/* Tip */}
              <div className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <Info className="h-3.5 w-3.5 text-zinc-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Products saved as <span className="text-zinc-500 font-semibold">Draft</span> won't appear to consumers until you activate them.
                </p>
              </div>
            </div>
          </div>

        </div>
      </form>

      {/* Mobile sticky footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 py-3 bg-[#0b0b0b]/95 backdrop-blur-sm border-t border-[#1f1f1f] z-50 flex gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="flex-1 border border-[#222] text-zinc-400"
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={isLoading}
          onClick={handleSubmit}
          className="flex-1 bg-purple-600 hover:bg-purple-700 font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {submitLabel}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Product
            </>
          )}
        </Button>
      </div>

    </div>
  );
}
