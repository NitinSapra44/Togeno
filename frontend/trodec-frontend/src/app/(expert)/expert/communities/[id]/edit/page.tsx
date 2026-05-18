"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getCommunityById, updateCommunity, Community } from "@/services";
import {
  uploadCommunityImage,
  removeCommunityImage,
} from "@/services/upload.service";

export default function EditCommunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);

  // Upload states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "" as string | null,
    coverImageUrl: "" as string | null,
    isActive: true,
  });

  // ─── Fetch community data ────────────────────────────────────────
  useEffect(() => {
    async function fetchCommunity() {
      try {
        const data = await getCommunityById(id);
        setCommunity(data);
        setFormData({
          name: data.name,
          description: data.description || "",
          imageUrl: data.imageUrl || null,
          coverImageUrl: data.coverImageUrl || null,
          isActive: data.isActive,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load community"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchCommunity();
  }, [id]);

  // ─── Avatar upload ───────────────────────────────────────────────
  const handleAvatarUpload = useCallback(
    async (file: File) => {
      setAvatarError(null);
      setIsUploadingAvatar(true);
      try {
        const url = await uploadCommunityImage(id, file, "avatar");
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        toast.success("Avatar uploaded");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Avatar upload failed";
        setAvatarError(msg);
        toast.error(msg);
        throw err; // re-throw so ImageUpload can clear its preview
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [id]
  );

  const handleAvatarRemove = useCallback(async () => {
    try {
      await removeCommunityImage(id, "avatar");
      setFormData((prev) => ({ ...prev, imageUrl: null }));
      toast.success("Avatar removed");
    } catch (err) {
      toast.error("Failed to remove avatar");
    }
  }, [id]);

  // ─── Cover upload ────────────────────────────────────────────────
  const handleCoverUpload = useCallback(
    async (file: File) => {
      setCoverError(null);
      setIsUploadingCover(true);
      try {
        const url = await uploadCommunityImage(id, file, "cover");
        setFormData((prev) => ({ ...prev, coverImageUrl: url }));
        toast.success("Cover image uploaded");
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Cover upload failed";
        setCoverError(msg);
        toast.error(msg);
        throw err;
      } finally {
        setIsUploadingCover(false);
      }
    },
    [id]
  );

  const handleCoverRemove = useCallback(async () => {
    try {
      await removeCommunityImage(id, "cover");
      setFormData((prev) => ({ ...prev, coverImageUrl: null }));
      toast.success("Cover image removed");
    } catch (err) {
      toast.error("Failed to remove cover image");
    }
  }, [id]);

  // ─── Save changes ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Community name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      await updateCommunity(id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        imageUrl: formData.imageUrl || null,
        coverImageUrl: formData.coverImageUrl || null,
        isActive: formData.isActive,
      });

      toast.success("Community updated successfully");
      router.push("/expert/communities");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update community"
      );
      toast.error("Failed to save changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Loading state ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // ─── Not found state ─────────────────────────────────────────────
  if (!community && !isLoading) {
    return (
      <div className="space-y-8 text-white max-w-2xl mx-auto">
        <Card className="bg-[#0b0b0b] border-[#1a1a1a]">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Community not found
            </h3>
            <p className="text-zinc-400 mb-4">
              {error || "The community you're looking for doesn't exist."}
            </p>
            <Button
              onClick={() => router.push("/expert/communities")}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Back to Communities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Edit Form ───────────────────────────────────────────────────
  return (
    <div className="space-y-8 text-white max-w-2xl mx-auto">
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
          <h1 className="text-3xl font-bold">Edit Community</h1>
          <p className="text-zinc-400 mt-1">Update {community?.name}</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-[#0b0b0b] border-[#1a1a1a] shadow-xl">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-emerald-500" />
            Community Details
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* ── Cover Image Upload ── */}
            <ImageUpload
              label="Cover Image"
              variant="cover"
              value={formData.coverImageUrl}
              onFileSelect={handleCoverUpload}
              onRemove={handleCoverRemove}
              isUploading={isUploadingCover}
              error={coverError}
              disabled={isSubmitting}
            />

            {/* ── Avatar + Name row ── */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar upload */}
              <div className="shrink-0">
                <ImageUpload
                  label="Community Image"
                  variant="avatar"
                  value={formData.imageUrl}
                  onFileSelect={handleAvatarUpload}
                  onRemove={handleAvatarRemove}
                  isUploading={isUploadingAvatar}
                  error={avatarError}
                  disabled={isSubmitting}
                />
              </div>

              {/* Name + Description stack */}
              <div className="flex-1 space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">
                    Community Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Photography Enthusiasts"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-[#111111] border-[#1f1f1f] text-white focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-zinc-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your community is about..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    className="bg-[#111111] border-[#1f1f1f] text-white min-h-[120px] focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40"
                  />
                </div>
              </div>
            </div>

            {/* ── Status toggle ── */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#111111] border border-[#1f1f1f]">
              <div>
                <Label htmlFor="isActive" className="text-zinc-300">
                  Active Status
                </Label>
                <p className="text-xs text-zinc-500 mt-1">
                  Inactive communities are hidden from public view
                </p>
              </div>

              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>

            {/* ── Action buttons ── */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="flex-1 text-zinc-400 hover:text-white hover:bg-white/5"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || isUploadingAvatar || isUploadingCover}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
