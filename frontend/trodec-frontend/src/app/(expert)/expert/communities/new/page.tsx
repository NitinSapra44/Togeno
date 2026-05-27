"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCommunity, getCategories, getCommunities, Category } from "@/services";
import { toast } from "sonner";

export default function NewCommunityPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [hasExistingCommunity, setHasExistingCommunity] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [cats, commResult] = await Promise.all([
          getCategories(),
          getCommunities({ limit: 1, mine: true }),
        ]);
        setCategories(cats);
        if (commResult.data.length >= 1) {
          setHasExistingCommunity(true);
        }
      } catch {
        toast.error("Failed to load data");
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchData();
  }, []);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Community name is required");
      return;
    }

    if (!formData.categoryId) {
      setError("Please select a category");
      return;
    }

    try {
      setIsSubmitting(true);
      const community = await createCommunity({
        name: formData.name.trim(),
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description.trim() || null,
        categoryId: formData.categoryId,
        imageUrl: null,
        coverImageUrl: null,
      });

      toast.success("Community created! Add your images now.");
      router.push(`/expert/communities/${community.id}/edit`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create community"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasExistingCommunity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Users className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="text-xl font-semibold text-white">Community Already Exists</h1>
        <p className="text-sm text-zinc-400 max-w-sm">
          Each expert can only run one community. Manage your existing community instead.
        </p>
        <Button
          onClick={() => router.push("/expert/communities")}
          className="bg-white text-black hover:bg-zinc-200 font-medium"
        >
          Go to My Community
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="h-10 w-10 p-0 text-zinc-400 hover:text-white hover:bg-white/5"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Create Community</h1>
          <p className="text-zinc-500 mt-1">
            Start a new expert-led community
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-[#0b0b0b] border-[#1a1a1a]">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-emerald-500" />
            Community Details
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-zinc-300">
                Community Name <span className="text-red-400">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g., Photography Enthusiasts"
                className="bg-[#111111] border-[#1a1a1a] text-white focus-visible:ring-1 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label className="text-zinc-300">URL Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="bg-[#111111] border-[#1a1a1a] text-white focus-visible:ring-emerald-500/50"
              />
              <p className="text-xs text-zinc-600">
                Used in: /community/{formData.slug || "your-slug"}
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-zinc-300">
                Category <span className="text-red-400">*</span>
              </Label>

              {isLoadingCategories ? (
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading categories...
                </div>
              ) : (
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger className="bg-[#111111] border-[#1a1a1a] text-white focus:ring-emerald-500/50">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-[#1a1a1a]">
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="text-zinc-300"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Describe what your community is about..."
                className="bg-[#111111] border-[#1a1a1a] text-white min-h-[120px] focus-visible:ring-emerald-500/50"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 border-[#1a1a1a] text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || isLoadingCategories}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Community"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
