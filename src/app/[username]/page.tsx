"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import ProfileView from "@/components/profile/ProfileView";
import { DEFAULT_PROFILE_CONFIG } from "@/utils/defaultConfig";
import { FullProfileConfig } from "@/types/profile";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { users, maintenanceMode, currentUser } = useProfile();
  const [profileConfig, setProfileConfig] = useState<FullProfileConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const username = typeof params?.username === "string" ? params.username.toLowerCase() : "";

  useEffect(() => {
    if (!username) return;

    // Check if user profile matches registered list
    const foundUser = users.find((u) => u.username === username);
    
    if (foundUser) {
      setProfileConfig(foundUser.config || null);
    } else if (username === "koni") {
      setProfileConfig(DEFAULT_PROFILE_CONFIG);
    } else {
      setProfileConfig(null);
    }
    
    setLoading(false);
  }, [username, users]);

  // Handle maintenance mode bypass for Owners/Admins
  const isBypassed = currentUser && (currentUser.role === "Owner" || currentUser.role === "Admin");
  
  if (maintenanceMode && !isBypassed) {
    return (
      <div className="w-full min-h-screen bg-[#030014] text-white flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold">Platform Maintenance</h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-md leading-relaxed">
          alternate.lol is currently undergoing scheduled optimizations. Please check back later.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#030014] text-white flex items-center justify-center">
        <div className="text-sm font-semibold tracking-widest text-zinc-500 uppercase animate-pulse">
          Decrypting profile...
        </div>
      </div>
    );
  }

  if (!profileConfig) {
    return (
      <div className="w-full min-h-screen bg-[#030014] text-white flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">404 - Linker Not Found</h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-sm">
          The slot for <span className="text-pink-500 font-bold">/{username}</span> is currently unclaimed.
        </p>
        <Link
          href="/login"
          className="mt-6 px-4 py-2 bg-pink-500 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-pink-600 transition-colors"
        >
          Claim this Linker
        </Link>
      </div>
    );
  }

  return <ProfileView config={profileConfig} />;
}
