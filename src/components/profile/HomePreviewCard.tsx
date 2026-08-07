"use client";

import { useEffect, useState } from "react";
import { FullProfileConfig } from "@/types/profile";
import { LiveDiscordPresence } from "@/lib/discord";
import ProfileCard from "./ProfileCard";

interface HomePreviewCardProps {
  config: FullProfileConfig;
}

export default function HomePreviewCard({ config }: HomePreviewCardProps) {
  const [livePresence, setLivePresence] = useState<LiveDiscordPresence | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPresence = async () => {
      try {
        const res = await fetch("/api/discord/preview");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.success && data.presence) {
          setLivePresence(data.presence);
        }
      } catch {
        // Fall back to mock status in ProfileCard
      }
    };

    loadPresence();
    const interval = setInterval(loadPresence, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <ProfileCard
      config={config}
      isPreview={false}
      showDiscordActivity={true}
      livePresence={livePresence}
    />
  );
}
