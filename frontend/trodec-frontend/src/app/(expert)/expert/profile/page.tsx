"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { getJoinedCommunities } from "@/services/communities.service";
import type { Community, CommunityMember } from "@/services/communities.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Shield,
  Activity,
  Camera,
  Star,
  Save,
  Trash2,
  CheckCircle2,
  Crown,
  Users,
  Award,
  Briefcase,
  Calendar,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

interface MembershipWithCommunity {
  membership: CommunityMember;
  community: Community;
}

export default function ExpertProfilePage() {
  const { user, profile, expertDetails } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [memberships, setMemberships] = useState<MembershipWithCommunity[]>([]);

  useEffect(() => {
    getJoinedCommunities({ limit: 50 })
      .then((res) => setMemberships(res.data))
      .catch(() => {});
  }, []);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 text-white pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expert Settings</h1>
        <p className="text-zinc-500">
          Manage your public profile and account preferences.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-[#111111] border border-[#1a1a1a] p-1 rounded-xl">
          <TabsTrigger value="general" className="data-[state=active]:bg-zinc-800">
            <User className="w-4 h-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-zinc-800">
            <Activity className="w-4 h-4 mr-2" /> Activity
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-zinc-800">
            <Shield className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
        </TabsList>

        {/* ================= GENERAL TAB ================= */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card className="bg-[#0b0b0b] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border border-[#1a1a1a]">
  <AvatarImage
    src={
      profile?.avatarUrl
        ? profile.avatarUrl
        : (user as any)?.photoURL
        ? (user as any).photoURL
        : undefined
    }
    alt="Profile"
  />
  <AvatarFallback className="bg-zinc-900 text-zinc-400 text-2xl">
    {profile?.fullName?.charAt(0)?.toUpperCase() ||
      user?.email?.charAt(0)?.toUpperCase() ||
      "E"}
  </AvatarFallback>
</Avatar>

                  <button className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 rounded-full text-white border-2 border-[#0b0b0b] hover:bg-emerald-500">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold">
                      {profile?.fullName || "Expert"}
                    </h3>
                    {expertDetails?.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Expert
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500">
                    Google photo auto appears if signed in via Google.
                  </p>
                </div>
              </div>

              {/* Credibility Strip */}
              {expertDetails && (
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0e0e0e] p-4 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                    <Award className="w-3.5 h-3.5 text-emerald-500" />
                    Expert Credibility
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Verified Status */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Status</span>
                      {expertDetails.isVerified ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-yellow-500 text-sm font-semibold">Pending</span>
                      )}
                    </div>

                    {/* Rating */}
                    {expertDetails.rating > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Rating</span>
                        <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
                          <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400 shrink-0" />
                          {expertDetails.rating.toFixed(1)}
                          <span className="text-zinc-500 font-normal text-xs">({expertDetails.totalReviews})</span>
                        </span>
                      </div>
                    )}

                    {/* Communities */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Communities</span>
                      <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
                        <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        {memberships.length}
                      </span>
                    </div>

                    {/* Years of Experience */}
                    {expertDetails.yearsOfExperience !== null && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Experience</span>
                        <span className="flex items-center gap-1.5 text-white text-sm font-semibold">
                          <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          {expertDetails.yearsOfExperience}y
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expertise Tags */}
                  {expertDetails.expertise?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3 h-3" /> Expertise
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {expertDetails.expertise.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Member since */}
                  {profile?.createdAt && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                      <Calendar className="w-3 h-3" />
                      Member since {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </div>
                  )}
                </div>
              )}

              {/* Form */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    defaultValue={profile?.fullName || ""}
                    className="bg-[#111111] border-[#1a1a1a]"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    disabled
                    defaultValue={user?.email || ""}
                    className="bg-[#0e0e0e] border-[#1a1a1a] text-zinc-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Bio</Label>
                  <Input
                    placeholder="Tell people about your expertise..."
                    className="bg-[#111111] border-[#1a1a1a]"
                  />
                </div>

                <div>
                  <Label>Specialization</Label>
                  <Input
                    placeholder="e.g. Tech Reviews"
                    className="bg-[#111111] border-[#1a1a1a]"
                  />
                </div>

                <div>
                  <Label>Website / Social Link</Label>
                  <Input
                    placeholder="https://..."
                    className="bg-[#111111] border-[#1a1a1a]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="h-9 text-sm bg-white text-black hover:bg-zinc-200 font-medium"
                >
                  {isLoading ? "Saving..." : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= ACTIVITY TAB ================= */}
        <TabsContent value="activity" className="space-y-6 mt-6">
          <Card className="bg-[#0b0b0b] border-[#1a1a1a] p-6">
            <h2 className="text-lg font-semibold mb-6">Your Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Communities" value={String(memberships.length || "0")} />
              <StatCard
                title="Reviews"
                value={String(expertDetails?.totalReviews ?? "—")}
              />
              <StatCard
                title="Avg Rating"
                value={expertDetails?.rating ? expertDetails.rating.toFixed(1) : "—"}
                icon={!!expertDetails?.rating}
              />
              <StatCard
                title="Experience"
                value={expertDetails?.yearsOfExperience ? `${expertDetails.yearsOfExperience}y` : "—"}
              />
            </div>
          </Card>

          {/* Communities Section */}
          <Card className="bg-[#0b0b0b] border-[#1a1a1a] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Your Communities</h2>
              {memberships.length > 0 && (
                <span className="text-xs text-zinc-500 font-medium">{memberships.length} joined</span>
              )}
            </div>

            {memberships.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center gap-2">
                <Users className="w-8 h-8 text-zinc-700" />
                <p className="text-zinc-500 text-sm">You haven't joined any communities yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {memberships.map(({ membership, community }) => (
                  <div
                    key={community.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-[#111111] border border-[#1a1a1a] hover:border-zinc-700 transition-colors"
                  >
                    {/* Community icon */}
                    <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                      {community.imageUrl ? (
                        <img
                          src={community.imageUrl}
                          alt={community.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>

                    {/* Name + category */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">
                          {community.name}
                        </span>
                        {membership.isExpert && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wide shrink-0">
                            <Crown className="w-2.5 h-2.5" />
                            Expert
                          </span>
                        )}
                      </div>
                      {community.category?.name && (
                        <span className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Tag className="w-2.5 h-2.5" />
                          {community.category.name}
                        </span>
                      )}
                    </div>

                    {/* Member count */}
                    <div className="flex items-center gap-1 text-xs text-zinc-500 shrink-0">
                      <Users className="w-3 h-3 text-purple-400" />
                      {community.memberCount?.toLocaleString() ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ================= SECURITY TAB ================= */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className="bg-[#0b0b0b] border-[#1a1a1a] p-6 space-y-6">
            <h2 className="text-lg font-semibold">Security Settings</h2>

            <Input
              type="password"
              placeholder="Current Password"
              className="bg-[#111111] border-[#1a1a1a]"
            />
            <Input
              type="password"
              placeholder="New Password"
              className="bg-[#111111] border-[#1a1a1a]"
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              className="bg-[#111111] border-[#1a1a1a]"
            />

            <Button variant="outline">Update Password</Button>

            {/* Danger Zone */}
            <div className="border-t border-[#1a1a1a] pt-6 mt-6">
              <h3 className="text-red-400 font-semibold mb-2">
                Danger Zone
              </h3>
              <Button
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ===== Small Stats Component ===== */
function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-[#111111] border border-[#1a1a1a] p-5 rounded-xl">
      <div className="text-zinc-500 text-sm mb-2">{title}</div>
      <div className="text-2xl font-bold text-white flex items-center gap-2">
        {value}
        {icon && <Star className="w-4 h-4 text-orange-400" />}
      </div>
    </div>
  );
}
