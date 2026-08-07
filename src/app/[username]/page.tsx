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

    setLoading(true);
    fetch(`/api/profile/${username}`)
      .then((res) => {
        if (!res.ok) {
          if (username === "koni") {
            setProfileConfig(DEFAULT_PROFILE_CONFIG);
          } else {
            setProfileConfig(null);
          }
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.config) {
          setProfileConfig(data.config);
        }
      })
      .catch(() => {
        setProfileConfig(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  // Handle maintenance mode bypass for Owners/Admins
  const isBypassed = currentUser && (currentUser.role === "Owner" || currentUser.role === "Admin");
  
  if (maintenanceMode && !isBypassed) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-12 h-12 text-zinc-500 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold uppercase tracking-wider">Platform Maintenance</h2>
        <p className="text-xs text-zinc-500 mt-2 max-w-md leading-relaxed">
          alternate.lol is currently undergoing scheduled optimizations. Please check back later.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
          <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            Loading Linker...
          </div>
        </div>
      </div>
    );
  }

  if (!profileConfig) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-12 h-12 text-zinc-700 mb-4" />
        <h2 className="text-xl font-bold uppercase tracking-wider">404 - Linker Not Found</h2>
        <p className="text-xs text-zinc-550 mt-2 max-w-sm">
          The slot for <span className="text-white font-bold">/{username}</span> is currently unclaimed.
        </p>
        <Link
          href="/login"
          className="mt-6 px-4 py-2 bg-white text-black text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition-colors"
        >
          Claim this Linker
        </Link>
      </div>
    );
  }

  return <ProfileView config={profileConfig} />;
}
