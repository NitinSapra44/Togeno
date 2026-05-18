"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut, User, Shield, Building2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, expertDetails, brandDetails, isLoading, signOut } =
    useAuthStore();

  // Role-based redirect
  useEffect(() => {
    if (!isLoading && profile) {
      if (profile.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (profile.role === "brand_admin") {
        router.replace("/brand/dashboard");
      } else if (profile.role === "expert") {
        router.replace("/expert/dashboard");
      } else if (profile.role === "consumer") {
        router.replace("/consumer/dashboard");
      }
    }
  }, [isLoading, profile, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const getRoleIcon = () => {
    switch (profile?.role) {
      case "expert":
        return <Shield className="h-6 w-6 text-purple-400" />;
      case "brand_admin":
        return <Building2 className="h-6 w-6 text-blue-400" />;
      default:
        return <User className="h-6 w-6 text-emerald-400" />;
    }
  };

  const getRoleColor = () => {
    switch (profile?.role) {
      case "expert":
        return "from-purple-500 to-pink-500";
      case "brand_admin":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-emerald-500 to-teal-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-zinc-400 mt-1">Welcome back, {profile?.fullName || user.email}</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="bg-zinc-950/80 border-white/10 text-white">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div
                className={`h-16 w-16 rounded-full bg-gradient-to-r ${getRoleColor()} flex items-center justify-center`}
              >
                {getRoleIcon()}
              </div>
              <div>
                <CardTitle className="text-xl">{profile?.fullName || "Complete your profile"}</CardTitle>
                <p className="text-zinc-400 text-sm">{user.email}</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-gradient-to-r ${getRoleColor()}`}
                >
                  {profile?.role || "User"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-zinc-400 text-xs uppercase tracking-wider">Member Since</p>
                <p className="text-lg font-semibold mt-1">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-zinc-400 text-xs uppercase tracking-wider">Account Status</p>
                <p className="text-lg font-semibold mt-1 text-emerald-400">
                  {profile?.isActive ? "Active" : "Pending"}
                </p>
              </div>
            </div>

            {/* Expert Details */}
            {profile?.role === "expert" && expertDetails && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <h3 className="font-semibold text-purple-400 mb-3">Expert Details</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-zinc-400">Expertise:</span>{" "}
                    {expertDetails.expertise?.join(", ") || "Not set"}
                  </p>
                  <p>
                    <span className="text-zinc-400">LinkedIn:</span>{" "}
                    {expertDetails.linkedinUrl || "Not set"}
                  </p>
                  <p>
                    <span className="text-zinc-400">Verified:</span>{" "}
                    {expertDetails.isVerified ? (
                      <span className="text-emerald-400">Yes</span>
                    ) : (
                      <span className="text-yellow-400">Pending</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Brand Details */}
            {profile?.role === "brand_admin" && brandDetails && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <h3 className="font-semibold text-blue-400 mb-3">Brand Details</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-zinc-400">Brand Name:</span>{" "}
                    {brandDetails.brandName || "Not set"}
                  </p>
                  <p>
                    <span className="text-zinc-400">Website:</span>{" "}
                    {brandDetails.websiteUrl || "Not set"}
                  </p>
                  <p>
                    <span className="text-zinc-400">Verified:</span>{" "}
                    {brandDetails.isVerified ? (
                      <span className="text-emerald-400">Yes</span>
                    ) : (
                      <span className="text-yellow-400">Pending</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-zinc-950/80 border-white/10 text-white hover:bg-zinc-900/80 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="font-semibold">Edit Profile</p>
              <p className="text-zinc-500 text-xs mt-1">Update your info</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/80 border-white/10 text-white hover:bg-zinc-900/80 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <p className="font-semibold">Explore Experts</p>
              <p className="text-zinc-500 text-xs mt-1">Find trusted experts</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/80 border-white/10 text-white hover:bg-zinc-900/80 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-6 w-6 text-blue-400" />
              </div>
              <p className="font-semibold">Discover Brands</p>
              <p className="text-zinc-500 text-xs mt-1">Browse verified brands</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
