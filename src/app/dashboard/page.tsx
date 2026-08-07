"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import ProfileView from "@/components/profile/ProfileView";
import CloudinaryUploadButton from "@/components/profile/CloudinaryUploadButton";
import { FullProfileConfig, BackgroundType, ParticleType, SongTrack, SocialLink, BadgeConfig, WidgetConfig } from "@/types/profile";
import {
  Undo, Redo, RefreshCw, Download, Upload, Palette, User, Maximize2,
  Sliders, Image, Sparkles, Type, Music, Link2, Shield, Settings, Eye,
  LogOut, Plus, Trash2, ShieldAlert, ArrowLeftRight, Monitor, Play, EyeOff, MousePointer, AppWindow, Loader2, Info,
  Ghost, MessageSquare, Pin, Gamepad, Cloud, Compass, Send, Mail, Globe, Coins
} from "lucide-react";

// --- CUSTOM SVG BRAND ICONS ---
function BrandIcon({ name, className = "w-4 h-4" }: { name: string; className?: string }) {
  switch (name.toLowerCase()) {
    case "x":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case "snapchat":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2c-2.484 0-4.5 2.016-4.5 4.5 0 2.146 1.488 2.822 1.488 3.5 0 .614-2.188 1.137-2.188 3 0 1.227 1.156 1.5 2.25 1.5.45 0 .9-.375.9-.75 0-.75.45-1.125 1.35-1.125s1.35.375 1.35 1.125c0 .375.45.75.9.75 1.094 0 2.25-.273 2.25-1.5 0-1.863-2.188-2.386-2.188-3 0-.678 1.488-1.354 1.488-3.5C16.5 4.016 14.484 2 12 2zm0 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
        </svg>
      );
    case "instagram":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      );
    case "youtube":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case "reddit":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-.321.846c.78.528 1.282 1.282 1.34 2.117.26-.065.524-.1.792-.1.97 0 1.76.78 1.76 1.748s-.79 1.748-1.76 1.748c-.286 0-.568-.046-.84-.132-.162 1.37-.89 2.518-1.996 3.197-.84.512-1.895.772-3.045.772-1.15 0-2.205-.26-3.045-.772-1.107-.68-1.834-1.826-1.997-3.197a3.486 3.486 0 0 1-.84.132c-.97 0-1.76-.78-1.76-1.748s.79-1.748 1.76-1.748c.268 0 .532.035.792.1.058-.835.56-1.589 1.34-2.117a1.25 1.25 0 0 1-.32-.846c0-.688.561-1.25 1.249-1.25.438 0 .825.228 1.05.572.782-.416 1.777-.668 2.875-.688l.608-2.87 1.66.353c.017.433.37.78.808.78.446 0 .81-.365.81-.81s-.365-.81-.81-.81c-.378 0-.698.262-.779.612l-1.884-.4a.406.406 0 0 0-.482.31l-.683 3.224c-1.127.018-2.152.28-2.955.713a1.242 1.242 0 0 1 1.05-.572z"/>
        </svg>
      );
    case "tiktok":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.52-4.06-1.39-.28-.2-.55-.42-.8-.67v7.34c.04 1.83-.53 3.72-1.78 5.02-1.26 1.35-3.15 2.05-4.99 1.95-1.92-.04-3.86-.9-4.96-2.48-1.2-1.65-1.47-3.92-.76-5.83.62-1.73 2.11-3.08 3.92-3.48 1.17-.28 2.4-.13 3.5.39v4.16c-.92-.51-2.06-.57-3.02-.13-.99.44-1.63 1.48-1.58 2.57.02 1.03.62 1.98 1.55 2.37.95.42 2.11.23 2.89-.48.66-.58.98-1.48.95-2.35v-18.3z"/>
        </svg>
      );
    case "facebook":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case "spotify":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 .007a12 12 0 1 0 0 23.985A12 12 0 0 0 12 .007zm5.5 17.3c-.2.3-.6.4-.9.2-2.4-1.5-5.5-1.8-9.1-.9-.3.1-.7-.1-.8-.4-.1-.4.1-.7.4-.8 3.9-.9 7.4-.5 10.1 1.2.3.2.4.6.3.7zm1.5-3.3c-.3.4-.8.5-1.2.3-2.8-1.7-7-2.2-10.2-1.2-.5.1-1-.2-1.2-.6-.1-.5.2-1 .6-1.2 3.8-1.2 8.4-.6 11.6 1.4.4.2.5.8.2 1.3zm.1-3.4C15.6 8.5 9.7 8.3 6.3 9.3c-.5.2-1.1-.1-1.3-.7-.2-.5.1-1.1.7-1.3 3.9-1.2 10.4-1 14.5 1.5.5.3.6.9.3 1.4-.3.5-.9.6-1.4.4z"/>
        </svg>
      );
    case "steam":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 .007C5.373.007 0 5.38 0 12.007c0 5.545 3.766 10.207 8.874 11.58l.84-2.584a2.91 2.91 0 0 1-1.636-2.584c0-1.309.856-2.417 2.045-2.783L11.55 12.8a2.92 2.92 0 0 1 5.75-.436l2.366 1.054a2.92 2.92 0 1 1-1.077 2.428l-2.433-1.084a2.909 2.909 0 0 1-2.9 1.472l-1.433 2.862c1.478.196 2.617 1.435 2.617 2.946 0 1.61-1.309 2.918-2.91 2.918-.733 0-1.4-.271-1.91-.715L6.68 23.36C10.02 23.824 11 .007 12 .007z"/>
        </svg>
      );
    case "discord":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
        </svg>
      );
    case "roblox":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.826 21.68l-13.506-2.731 2.73-13.507 13.507 2.731-2.731 13.507zM5.32 1.68L0 19.68l19.68 5.32L25 7l-19.68-5.32z"/>
        </svg>
      );
    case "github":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      );
    case "paypal":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.06 5.62c0-1.42-.36-2.58-1.08-3.48C17.9 1.06 16.32.5 14.28.5H7.72c-.44 0-.82.32-.9.76L3.92 19.3c-.06.32.04.64.26.86.16.16.38.24.6.24h3.64l.98-6.18c.06-.44.44-.76.9-.76h1.64c2.8 0 4.96-.78 6.46-2.34 1.1-.98 1.66-2.36 1.66-4.12z"/>
        </svg>
      );
    case "telegram":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.18 1.88-.96 6.48-1.36 8.62-.17.9-.5 1.2-.82 1.23-.7.06-1.23-.46-1.9-.9-1.05-.7-1.65-1.13-2.67-1.8-1.18-.77-.42-1.2.26-1.9.18-.18 3.24-2.97 3.3-3.23.01-.03.02-.15-.05-.21-.07-.06-.17-.04-.25-.02-.11.02-1.9 1.2-5.36 3.53-.5.35-.96.52-1.37.51-.45-.01-1.32-.26-1.97-.47-.8-.26-1.43-.4-1.38-.85.03-.23.34-.47.95-.72 3.72-1.62 6.2-2.7 7.44-3.24 3.54-1.53 4.28-1.8 4.76-1.8.1 0 .34.02.49.15.12.1.16.24.18.35-.01.04-.01.07.01.1z"/>
        </svg>
      );
    case "ethereum":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.37 4.35zm.082-17.97L4.66 12.33l7.366 4.36 7.365-4.36L12.026 0z"/>
        </svg>
      );
    case "bitcoin":
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.638 14.904c-1.602 6.43-8.155 10.348-14.63 8.76C2.58 22.062-1.372 15.53.213 9.1c1.587-6.43 8.155-10.348 14.63-8.76 6.43 1.587 10.398 8.136 8.795 14.564zm-5.71-4.22a2.868 2.868 0 0 0-2.11-2.22c.3-.56.63-1.12.92-1.74l-1.33-.28c-.28.61-.59 1.17-.89 1.76l-1.04-.22.28-1.28-1.33-.28-.28 1.28-1-.21.28-1.28-1.33-.28-.28 1.28-2.61-.56-.51 2.45s1.4.32 1.37.35a1.2 1.2 0 0 1 .86 1.28l-.86 4.09a.43.43 0 0 1-.39.32c-.06 0-1.37-.35-1.37-.35l-.97 2.48 2.48.53c.28-.58.58-1.16.86-1.76l1.04.22-.28 1.28 1.33.28.28-1.28 1 .21-.28 1.28 1.33.28.28-1.28c2.25.48 4.22.27 4.96-1.8.59-1.66.08-2.62-1.12-3.15.86-.39 1.51-1.05 1.56-2.31z"/>
        </svg>
      );
    default:
      return <Globe className={className} />;
  }
}

// --- CUSTOM TOGGLE SWITCH ---
function CustomToggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 border focus:outline-none ${
        checked ? "bg-purple-600 border-purple-600" : "bg-[#080808] border-zinc-800"
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-current transition-transform duration-300 ${
          checked ? "translate-x-5 text-white" : "translate-x-1 text-zinc-550"
        }`}
      />
    </button>
  );
}

// --- CUSTOM DROPDOWN ---
function CustomDropdown<T extends string>({
  value,
  options,
  onChange
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (val: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || value;

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3.5 py-2.5 text-xs text-left text-zinc-300 bg-[#080808] border border-zinc-900 hover:border-purple-600/50 rounded-xl flex items-center justify-between outline-none transition-colors duration-200"
      >
        <span className="font-medium">{selectedLabel}</span>
        <span className="text-[8px] text-zinc-650 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "none" }}>▼</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-35" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 mt-1.5 bg-[#080808] border border-zinc-900 rounded-xl shadow-2xl z-40 max-h-48 overflow-y-auto p-1 flex flex-col gap-0.5">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs text-left rounded-lg transition-colors ${
                  value === opt.value
                    ? "bg-purple-600 text-white font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const {
    config, updateConfig, undo, redo, resetConfig, applyPreset,
    currentUser, loadingSession, logout
  } = useProfile();

  const [activeTab, setActiveTab] = useState("profile");
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loadingSession && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loadingSession]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Export JSON configuration
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${config.username}_alternate_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON configuration
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.username && parsed.card) {
            updateConfig(() => parsed);
            alert("Configuration imported successfully!");
          } else {
            alert("Invalid configuration format.");
          }
        } catch (err) {
          alert("Error parsing JSON configuration.");
        }
      };
    }
  };

  // Helper updaters
  const updateCardProp = (prop: keyof FullProfileConfig["card"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      card: { ...prev.card, [prop]: value }
    }));
  };

  const updateBgProp = (prop: keyof FullProfileConfig["background"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      background: { ...prev.background, [prop]: value }
    }));
  };

  const updateParticleProp = (prop: keyof FullProfileConfig["particles"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      particles: { ...prev.particles, [prop]: value }
    }));
  };

  const updateTypographyProp = (prop: keyof FullProfileConfig["typography"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      typography: { ...prev.typography, [prop]: value }
    }));
  };

  const updateMusicProp = (prop: keyof FullProfileConfig["mediaPlayer"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      mediaPlayer: { ...prev.mediaPlayer, [prop]: value }
    }));
  };

  const updateCursorProp = (prop: keyof FullProfileConfig["cursor"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      cursor: { ...prev.cursor, [prop]: value }
    }));
  };

  const updateSplashProp = (prop: keyof FullProfileConfig["splash"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      splash: { ...prev.splash, [prop]: value }
    }));
  };

  // Prebuilt Link Options
  const [selectedPlatform, setSelectedPlatform] = useState("X");
  const [socialMode, setSocialMode] = useState<"text" | "link">("link");
  const [linkSourceValue, setLinkSourceValue] = useState("");

  const platforms = [
    { id: "X", name: "X", placeholder: "x.com/username", glowColor: "#ffffff" },
    { id: "Snapchat", name: "Snapchat", placeholder: "snapchat.com/add/username", glowColor: "#FFFC00" },
    { id: "Instagram", name: "Instagram", placeholder: "instagram.com/username", glowColor: "#E1306C" },
    { id: "YouTube", name: "YouTube", placeholder: "youtube.com/@username", glowColor: "#FF0000" },
    { id: "Reddit", name: "Reddit", placeholder: "reddit.com/u/username", glowColor: "#FF4500" },
    { id: "TikTok", name: "TikTok", placeholder: "tiktok.com/@username", glowColor: "#00f2fe" },
    { id: "Facebook", name: "Facebook", placeholder: "facebook.com/username", glowColor: "#1877F2" },
    { id: "Spotify", name: "Spotify", placeholder: "open.spotify.com/artist/...", glowColor: "#1DB954" },
    { id: "Steam", name: "Steam", placeholder: "steamcommunity.com/id/...", glowColor: "#00adee" },
    { id: "Discord", name: "Discord", placeholder: "discord.gg/invite", glowColor: "#5865F2" },
    { id: "Riot", name: "Riot Games", placeholder: "riotgames.com/...", glowColor: "#D11F36" },
    { id: "Pinterest", name: "Pinterest", placeholder: "pinterest.com/username", glowColor: "#BD081C" },
    { id: "Roblox", name: "Roblox", placeholder: "roblox.com/users/...", glowColor: "#ffffff" },
    { id: "PayPal", name: "PayPal", placeholder: "paypal.me/username", glowColor: "#003087" },
    { id: "GitHub", name: "GitHub", placeholder: "github.com/username", glowColor: "#ffffff" },
    { id: "SoundCloud", name: "SoundCloud", placeholder: "soundcloud.com/username", glowColor: "#FF5500" },
    { id: "Ethereum", name: "Ethereum", placeholder: "0x...", glowColor: "#3c3c3d" },
    { id: "Bitcoin", name: "Bitcoin", placeholder: "bc1...", glowColor: "#f7931a" },
    { id: "Litecoin", name: "Litecoin", placeholder: "L...", glowColor: "#bfbbbb" },
    { id: "Telegram", name: "Telegram", placeholder: "t.me/username", glowColor: "#0088cc" },
    { id: "Email", name: "Email", placeholder: "example@mail.com", glowColor: "#ffffff" },
    { id: "Website", name: "Website", placeholder: "https://example.com", glowColor: "#ffffff" },
  ];

  const handleAddPresetLink = () => {
    const preset = platforms.find(p => p.id === selectedPlatform);
    if (!preset) return;

    const newLink: SocialLink = {
      id: Math.random().toString(),
      platform: preset.name,
      url: linkSourceValue || preset.placeholder,
      glow: false,
      glowColor: preset.glowColor,
      animation: "none",
      iconColor: "#ffffff",
      visible: true
    };
    updateConfig((prev) => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
    setLinkSourceValue("");
    setShowLinkModal(false);
  };

  // Sidebar Category Tabs definition
  const tabs = [
    { id: "profile", label: "Profile & Intro", icon: User },
    { id: "card", label: "Card Editor", icon: Sliders },
    { id: "background", label: "Background", icon: Image },
    { id: "particles", label: "Particles", icon: Sparkles },
    { id: "typography", label: "Typography", icon: Type },
    { id: "music", label: "Playlist Tracks", icon: Music },
    { id: "discord", label: "Discord Presence", icon: ShieldAlert },
    { id: "links", label: "Social Links", icon: Link2 },
    { id: "badges", label: "Profile Badges", icon: Shield },
    { id: "cursor", label: "Cursor Options", icon: MousePointer },
    { id: "widgets", label: "Widget Layouts", icon: AppWindow },
    { id: "settings", label: "Presets & Tools", icon: Palette },
  ];

  const filteredTabs = tabs.filter((t) =>
    t.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingSession) {
    return (
      <main className="w-full min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Verifying Session...</span>
        </div>
      </main>
    );
  }

  if (!currentUser) return null;

  return (
    <main className="w-full min-h-screen bg-[#080808] text-[#e0e0e0] flex flex-col select-none relative font-sans">
      
      {/* Top Header Panel */}
      <header className="h-16 border-b border-zinc-900 bg-[#0e0e0e] px-8 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-bold tracking-[0.25em] text-white uppercase hover:opacity-80 transition-opacity">
            alternate
          </Link>
          <span className="h-4 w-[1px] bg-zinc-900" />
          <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-widest">Creator Studio</span>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-[#111111] border border-zinc-900 p-1 rounded-xl">
            <button onClick={undo} className="p-2 hover:bg-[#181818] rounded-lg text-zinc-400 hover:text-white transition-colors" title="Undo change">
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button onClick={redo} className="p-2 hover:bg-[#181818] rounded-lg text-zinc-400 hover:text-white transition-colors" title="Redo change">
              <Redo className="w-3.5 h-3.5" />
            </button>
            <span className="w-[1px] h-4 bg-zinc-900 my-auto mx-1" />
            <button onClick={resetConfig} className="p-2 hover:bg-[#181818] rounded-lg text-zinc-400 hover:text-white transition-colors" title="Reset defaults">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleExport} className="p-2 hover:bg-[#181818] rounded-lg text-zinc-400 hover:text-white transition-colors" title="Export config JSON">
              <Download className="w-3.5 h-3.5" />
            </button>
            <label className="p-2 hover:bg-[#181818] rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Import config JSON">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <span className="h-4 w-[1px] bg-zinc-900" />

          {/* User authentication status & quick admin jumps */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-lg bg-[#111111] border border-zinc-900 text-zinc-400">
              {currentUser.role}
            </span>
            
            {(currentUser.role === "Owner" || currentUser.role === "Admin") && (
              <Link
                href="/admin"
                className="px-3.5 py-2 bg-purple-600/10 border border-purple-600/30 text-purple-400 hover:bg-purple-600/20 text-[9px] font-bold uppercase tracking-widest rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Admin Panel
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="p-2.5 bg-[#111111] hover:bg-[#161616] border border-zinc-900 text-zinc-450 hover:text-white rounded-xl transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main split viewport layout */}
      <div className="flex-1 flex overflow-hidden bg-[#080808]">
        
        {/* Left Side: Editor Form Sidebar */}
        <aside className="w-80 border-r border-zinc-900 bg-[#0e0e0e] flex flex-col h-full z-20">
          {/* Search bar */}
          <div className="p-4 border-b border-zinc-900">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search setting modules..."
              className="w-full px-3.5 py-2.5 text-xs text-white bg-[#080808] border border-zinc-900 rounded-xl outline-none focus:border-purple-600 transition-colors placeholder:text-zinc-650"
            />
          </div>

          {/* Navigation Category list */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
            {filteredTabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-left transition-all uppercase tracking-wider duration-200 border ${
                    isActive
                      ? "bg-purple-600/10 border-purple-600/40 text-purple-400"
                      : "bg-transparent border-transparent text-zinc-450 hover:text-zinc-200 hover:bg-[#111111]"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Interactive view toggle footer */}
          <div className="p-4 border-t border-zinc-900 bg-[#0e0e0e]">
            <button
              onClick={() => setShowFullPreview(!showFullPreview)}
              className="w-full py-3 bg-[#111111] hover:bg-[#181818] border border-zinc-900 text-zinc-350 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              <Eye className="w-4 h-4 inline mr-1.5" /> {showFullPreview ? "Edit Panel View" : "Full Page Render"}
            </button>
          </div>
        </aside>

        {/* Middle Panel: Controls Form Inputs */}
        {!showFullPreview && (
          <section className="flex-1 max-w-md border-r border-zinc-900 bg-[#080808] overflow-y-auto p-8 flex flex-col gap-6 scrollbar-thin">
            
            {/* Tab: Profile Info & Splash Screen */}
            {activeTab === "profile" && (
              <div className="flex flex-col gap-6">
                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Profile Info</h3>
                  
                  <div>
                    <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Username</label>
                    <input
                      type="text"
                      value={config.username}
                      onChange={(e) => updateConfig((prev) => ({ ...prev, username: e.target.value.toLowerCase() }))}
                      className="w-full px-3.5 py-2.5 text-xs text-white bg-[#080808] border border-zinc-900 rounded-xl outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Biography</label>
                    <textarea
                      value={config.bio}
                      onChange={(e) => updateConfig((prev) => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-3.5 py-2.5 text-xs text-white bg-[#080808] border border-zinc-900 rounded-xl outline-none resize-none focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Splash Screen</h3>
                    <CustomToggle
                      checked={config.splash.enabled}
                      onChange={(val) => updateSplashProp("enabled", val)}
                    />
                  </div>

                  {config.splash.enabled && (
                    <div className="flex flex-col gap-4 pt-2 border-t border-zinc-900/60">
                      <div>
                        <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Main Title</label>
                        <input
                          type="text"
                          value={config.splash.text}
                          onChange={(e) => updateSplashProp("text", e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs text-white bg-[#080808] border border-zinc-900 rounded-xl outline-none focus:border-purple-600 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Subtitle</label>
                        <input
                          type="text"
                          value={config.splash.subtitle}
                          onChange={(e) => updateSplashProp("subtitle", e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs text-white bg-[#080808] border border-zinc-900 rounded-xl outline-none focus:border-purple-600 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Button CTA Text</label>
                        <input
                          type="text"
                          value={config.splash.buttonText}
                          onChange={(e) => updateSplashProp("buttonText", e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs text-white bg-[#080808] border border-zinc-900 rounded-xl outline-none focus:border-purple-600 transition-colors"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Sound Track</label>
                          <CloudinaryUploadButton
                            onUploadSuccess={(url) => updateSplashProp("enterSoundUrl", url)}
                            accept="audio/*"
                            label="Upload Audio"
                          />
                        </div>
                        <input
                          type="text"
                          value={config.splash.enterSoundUrl}
                          onChange={(e) => updateSplashProp("enterSoundUrl", e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs text-white bg-[#080808] border border-zinc-900 rounded-xl outline-none focus:border-purple-600 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Background</label>
                          <input
                            type="color"
                            value={config.splash.backgroundColor}
                            onChange={(e) => updateSplashProp("backgroundColor", e.target.value)}
                            className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] text-zinc-550 font-bold uppercase mb-1">
                            <span>Blur ({config.splash.glassBlur}px)</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            value={config.splash.glassBlur}
                            onChange={(e) => updateSplashProp("glassBlur", parseInt(e.target.value))}
                            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Card Editor */}
            {activeTab === "card" && (
              <div className="flex flex-col gap-5">
                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Layout</h3>

                  <div>
                    <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Card Layout</label>
                    <CustomDropdown
                      value={config.card.layout}
                      options={[
                        { value: "floating-card", label: "Floating Card (Centered)" },
                        { value: "centered", label: "Centered Stack" },
                        { value: "sidebar-layout", label: "Sidebar split" },
                        { value: "fullscreen-layout", label: "Double Panel Wide Grid" }
                      ]}
                      onChange={(val) => updateCardProp("layout", val)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] text-zinc-550 font-bold uppercase mb-1.5">
                      <span>Card Width ({config.card.width}px)</span>
                    </div>
                    <input
                      type="range"
                      min="320"
                      max="600"
                      step="10"
                      value={config.card.width}
                      onChange={(e) => updateCardProp("width", parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                </div>

                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Glassmorphism</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-550 font-bold uppercase mb-1.5">
                        <span>Blur ({config.card.glassBlur}px)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={config.card.glassBlur}
                        onChange={(e) => updateCardProp("glassBlur", parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-550 font-bold uppercase mb-1.5">
                        <span>Opacity ({Math.round(config.card.backgroundOpacity * 100)}%)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.8"
                        step="0.05"
                        value={config.card.backgroundOpacity}
                        onChange={(e) => updateCardProp("backgroundOpacity", parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Borders & Glows</h3>

                  <div>
                    <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Border Animation</label>
                    <CustomDropdown
                      value={config.card.borderEffect}
                      options={[
                        { value: "none", label: "Static Outline Border" },
                        { value: "animated-gradient", label: "Neon Rainbow Border" },
                        { value: "breathing", label: "Pulsing Glow Border" }
                      ]}
                      onChange={(val) => updateCardProp("borderEffect", val)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/60 pt-3">
                    <div>
                      <label className="block text-[9px] text-zinc-555 font-bold uppercase tracking-wider mb-1.5">Outline Color</label>
                      <input
                        type="color"
                        value={config.card.outlineColor || "#ffffff"}
                        onChange={(e) => updateCardProp("outlineColor", e.target.value)}
                        className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-555 font-bold uppercase mb-1.5">
                        <span>Outline Size ({config.card.outlineThickness || 1}px)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={config.card.outlineThickness || 1}
                        onChange={(e) => updateCardProp("outlineThickness", parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/60 pt-3">
                    <div>
                      <label className="block text-[9px] text-zinc-555 font-bold uppercase tracking-wider mb-1.5">Glow Color</label>
                      <input
                        type="color"
                        value={config.card.glowColor || "#ffffff"}
                        onChange={(e) => updateCardProp("glowColor", e.target.value)}
                        className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-555 font-bold uppercase mb-1.5">
                        <span>Glow Size ({config.card.glowStrength || 0}px)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={config.card.glowStrength || 0}
                        onChange={(e) => updateCardProp("glowStrength", parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#080808] border border-zinc-900 rounded-xl mt-1">
                    <span className="text-xs font-semibold text-zinc-300">Apply floating hover drift</span>
                    <CustomToggle
                      checked={config.card.floatingEffect}
                      onChange={(val) => updateCardProp("floatingEffect", val)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Background Layer */}
            {activeTab === "background" && (
              <div className="flex flex-col gap-5">
                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Canvas Backdrop</h3>

                  <div>
                    <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Wallpaper Type</label>
                    <CustomDropdown
                      value={config.background.type}
                      options={[
                        { value: "solid", label: "Solid Background" },
                        { value: "linear-gradient", label: "Linear Gradient" },
                        { value: "animated-gradient", label: "Animated Wave" },
                        { value: "gif", label: "GIF / Image" },
                        { value: "video", label: "MP4 Video" }
                      ]}
                      onChange={(val) => updateBgProp("type", val)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Color A</label>
                      <input
                        type="color"
                        value={config.background.color1}
                        onChange={(e) => updateBgProp("color1", e.target.value)}
                        className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Color B</label>
                      <input
                        type="color"
                        value={config.background.color2}
                        onChange={(e) => updateBgProp("color2", e.target.value)}
                        className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>

                  {(config.background.type === "gif" || config.background.type === "solid") && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Wallpaper URL</label>
                        <CloudinaryUploadButton
                          onUploadSuccess={(url) => updateBgProp("imageUrl", url)}
                          accept="image/*"
                          label="Upload Image"
                        />
                      </div>
                      <input
                        type="text"
                        value={config.background.imageUrl || ""}
                        onChange={(e) => updateBgProp("imageUrl", e.target.value)}
                        placeholder="https://example.com/wallpaper.gif"
                        className="w-full px-3.5 py-2.5 text-xs text-white bg-[#080808] border border-zinc-900 rounded-xl outline-none focus:border-purple-600"
                      />
                    </div>
                  )}

                  {config.background.type === "video" && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider">MP4 Video URL</label>
                        <CloudinaryUploadButton
                          onUploadSuccess={(url) => updateBgProp("videoUrl", url)}
                          accept="video/mp4"
                          label="Upload Video"
                        />
                      </div>
                      <input
                        type="text"
                        value={config.background.videoUrl || ""}
                        onChange={(e) => updateBgProp("videoUrl", e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="w-full px-3.5 py-2.5 text-xs text-white bg-[#080808] border border-zinc-900 rounded-xl outline-none focus:border-purple-600"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Overlay & Filters</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Overlay Tint</label>
                      <input
                        type="color"
                        value={config.background.overlayColor || "#000000"}
                        onChange={(e) => updateBgProp("overlayColor", e.target.value)}
                        className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-555 font-bold uppercase mb-1.5">
                        <span>Opacity ({Math.round(config.background.overlayOpacity * 100)}%)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.9"
                        step="0.05"
                        value={config.background.overlayOpacity}
                        onChange={(e) => updateBgProp("overlayOpacity", parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/60 pt-3">
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-555 font-bold uppercase mb-1.5">
                        <span>Blur ({config.background.blur || 0}px)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={config.background.blur || 0}
                        onChange={(e) => updateBgProp("blur", parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-555 font-bold uppercase mb-1.5">
                        <span>Brightness ({config.background.brightness || 100}%)</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="150"
                        value={config.background.brightness || 100}
                        onChange={(e) => updateBgProp("brightness", parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Canvas Particles */}
            {activeTab === "particles" && (
              <div className="flex flex-col gap-5">
                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Canvas Particles</h3>

                  <div>
                    <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Particle Style</label>
                    <CustomDropdown
                      value={config.particles.type}
                      options={[
                        { value: "none", label: "Disable particles" },
                        { value: "stars", label: "Stars dust" },
                        { value: "snow", label: "Winter Snowfall" },
                        { value: "rain", label: "Digital Rain storm" },
                        { value: "sakura", label: "Cherry Blossom" },
                        { value: "matrix", label: "Matrix Rain" },
                        { value: "hearts", label: "Floating Hearts" },
                        { value: "bubbles", label: "Ambient Bubbles" },
                        { value: "sparkles", label: "Sparkles" },
                        { value: "hexagons", label: "Wireframe Hexagons" }
                      ]}
                      onChange={(val) => updateParticleProp("type", val)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] text-zinc-550 font-bold uppercase mb-1.5">
                      <span>Density ({config.particles.density} count)</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={config.particles.density}
                      onChange={(e) => updateParticleProp("density", parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] text-zinc-550 font-bold uppercase mb-1.5">
                      <span>Speed ({config.particles.speed})</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={config.particles.speed}
                      onChange={(e) => updateParticleProp("speed", parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/60 pt-3">
                    <div>
                      <label className="block text-[9px] text-zinc-555 font-bold uppercase tracking-wider mb-1.5">Color</label>
                      <input
                        type="color"
                        value={config.particles.color || "#ffffff"}
                        onChange={(e) => updateParticleProp("color", e.target.value)}
                        className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-555 font-bold uppercase mb-1.5">
                        <span>Size ({config.particles.size || 2}px)</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={config.particles.size || 2}
                        onChange={(e) => updateParticleProp("size", parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Typography Fonts */}
            {activeTab === "typography" && (
              <div className="flex flex-col gap-5">
                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Typography</h3>

                  <div>
                    <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Font Family</label>
                    <CustomDropdown
                      value={config.typography.fontFamily}
                      options={[
                        { value: "Geist Sans", label: "Geist Sans (Clean)" },
                        { value: "Outfit", label: "Outfit (Round)" },
                        { value: "Arial", label: "Arial (System)" },
                        { value: "Courier New", label: "Courier New (Monospace)" }
                      ]}
                      onChange={(val) => updateTypographyProp("fontFamily", val)}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Username Color Mode</label>
                    <CustomDropdown
                      value={config.typography.textEffect}
                      options={[
                        { value: "none", label: "Solid Color" },
                        { value: "gradient", label: "Custom Gradient" },
                        { value: "rainbow", label: "Animated Rainbow" }
                      ]}
                      onChange={(val) => updateTypographyProp("textEffect", val)}
                    />
                  </div>

                  {config.typography.textEffect === "none" ? (
                    <div>
                      <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Username Color</label>
                      <input
                        type="color"
                        value={config.typography.usernameColor}
                        onChange={(e) => updateTypographyProp("usernameColor", e.target.value)}
                        className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                      />
                    </div>
                  ) : config.typography.textEffect === "gradient" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Grad Color 1</label>
                        <input
                          type="color"
                          value={config.typography.textGradientColor1}
                          onChange={(e) => updateTypographyProp("textGradientColor1", e.target.value)}
                          className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Grad Color 2</label>
                        <input
                          type="color"
                          value={config.typography.textGradientColor2}
                          onChange={(e) => updateTypographyProp("textGradientColor2", e.target.value)}
                          className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/60 pt-3">
                    <div>
                      <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Bio Text Color</label>
                      <input
                        type="color"
                        value={config.typography.bioColor || "#ffffff"}
                        onChange={(e) => updateTypographyProp("bioColor", e.target.value)}
                        className="w-full h-8 rounded-lg bg-transparent cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Subtitle Color</label>
                      <input
                        type="color"
                        value={config.typography.subtitleColor || "#a1a1aa"}
                        onChange={(e) => updateTypographyProp("subtitleColor", e.target.value)}
                        className="w-full h-8 rounded-lg bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Playlist tracks editor */}
            {activeTab === "music" && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Sound Toggles</h3>

                  <div className="flex items-center justify-between p-2.5 bg-[#080808] border border-zinc-900 rounded-xl">
                    <span className="text-xs font-semibold text-zinc-300">Enable media player</span>
                    <CustomToggle
                      checked={config.mediaPlayer.enabled}
                      onChange={(val) => updateMusicProp("enabled", val)}
                    />
                  </div>

                  {config.mediaPlayer.enabled && (
                    <div className="flex flex-col gap-4 pt-2 border-t border-zinc-900/60">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between p-2.5 bg-[#080808] border border-zinc-900 rounded-xl">
                          <span className="text-xs font-semibold text-zinc-300">Autoplay</span>
                          <CustomToggle
                            checked={config.mediaPlayer.autoplay}
                            onChange={(val) => updateMusicProp("autoplay", val)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-[#080808] border border-zinc-900 rounded-xl">
                          <span className="text-xs font-semibold text-zinc-300">Loop tracks</span>
                          <CustomToggle
                            checked={config.mediaPlayer.loop}
                            onChange={(val) => updateMusicProp("loop", val)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Player Position</label>
                        <CustomDropdown
                          value={config.mediaPlayer.position}
                          options={[
                            { value: "inside-card", label: "Inside Card container" },
                            { value: "top", label: "Top float header" },
                            { value: "bottom", label: "Bottom footer float" },
                            { value: "floating-left", label: "Floating Left corner" },
                            { value: "floating-right", label: "Floating Right corner" }
                          ]}
                          onChange={(val) => updateMusicProp("position", val)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {config.mediaPlayer.enabled && (
                  <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tracks ({config.mediaPlayer.trackList.length})</span>
                      <button
                        onClick={() => {
                          const newTrack: SongTrack = {
                            id: Math.random().toString(),
                            title: "New Track",
                            artist: "Artist name",
                            url: "/aud.mp3",
                            coverUrl: "/pfp.png",
                            lyrics: ""
                          };
                          updateMusicProp("trackList", [...config.mediaPlayer.trackList, newTrack]);
                        }}
                        className="px-2.5 py-1.5 bg-purple-600/10 hover:bg-purple-600/25 border border-purple-600/40 text-purple-400 text-[10px] font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-1 uppercase tracking-wider shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Track
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                      {config.mediaPlayer.trackList.map((track, index) => (
                        <div key={track.id} className="p-4 bg-[#080808] border border-zinc-900 rounded-xl flex flex-col gap-3 relative shadow-inner">
                          <button
                            onClick={() => {
                              updateMusicProp(
                                "trackList",
                                config.mediaPlayer.trackList.filter((t) => t.id !== track.id)
                              );
                            }}
                            className="absolute top-2 right-2 p-1.5 hover:bg-zinc-900 text-zinc-550 hover:text-white rounded transition-colors"
                            title="Delete song track"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Track #{index + 1}</div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] text-zinc-500 uppercase mb-1">Song Title</label>
                              <input
                                type="text"
                                value={track.title}
                                onChange={(e) => {
                                  const updatedList = [...config.mediaPlayer.trackList];
                                  updatedList[index].title = e.target.value;
                                  updateMusicProp("trackList", updatedList);
                                }}
                                className="w-full px-2 py-1 text-xs text-white bg-[#080808] border border-zinc-900 rounded-lg outline-none focus:border-purple-600"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-zinc-500 uppercase mb-1">Artist</label>
                              <input
                                type="text"
                                value={track.artist}
                                onChange={(e) => {
                                  const updatedList = [...config.mediaPlayer.trackList];
                                  updatedList[index].artist = e.target.value;
                                  updateMusicProp("trackList", updatedList);
                                }}
                                className="w-full px-2 py-1 text-xs text-white bg-[#080808] border border-zinc-900 rounded-lg outline-none focus:border-purple-600"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-[9px] text-zinc-500 uppercase">Audio File Stream</label>
                              <CloudinaryUploadButton
                                onUploadSuccess={(url) => {
                                  const updatedList = [...config.mediaPlayer.trackList];
                                  updatedList[index].url = url;
                                  updateMusicProp("trackList", updatedList);
                                }}
                                accept="audio/*"
                                label="Upload Audio"
                              />
                            </div>
                            <input
                              type="text"
                              value={track.url}
                              onChange={(e) => {
                                const updatedList = [...config.mediaPlayer.trackList];
                                updatedList[index].url = e.target.value;
                                updateMusicProp("trackList", updatedList);
                              }}
                              className="w-full px-2 py-1 text-xs text-white bg-[#080808] border border-zinc-900 rounded-lg outline-none focus:border-purple-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Discord integration */}
            {activeTab === "discord" && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Discord Bot & Lanyard</h3>
                    <CustomToggle
                      checked={config.discord.enabled}
                      onChange={(val) => updateConfig((prev) => ({
                        ...prev,
                        discord: { ...prev.discord, enabled: val }
                      }))}
                    />
                  </div>

                  <div className="flex flex-col gap-4 pt-2 border-t border-zinc-900/60">
                    <div>
                      <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Discord User ID</label>
                      <input
                        type="text"
                        value={config.discord.userId}
                        onChange={(e) => updateConfig((prev) => ({
                          ...prev,
                          discord: { ...prev.discord, userId: e.target.value.trim() }
                        }))}
                        placeholder="e.g. 182739485726194758"
                        className="w-full px-3.5 py-2.5 text-xs text-white bg-[#080808] border border-zinc-900 rounded-xl outline-none focus:border-purple-600"
                      />
                      <p className="text-[9px] text-zinc-500 mt-2 leading-normal">
                        Enter your numerical Discord User ID to link active gaming statuses, client presences, and Spotify media streams dynamically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Social Links expanded */}
            {activeTab === "links" && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Redirect Handles</h3>
                    <button
                      onClick={() => setShowLinkModal(true)}
                      className="px-2.5 py-1.5 bg-purple-600/10 hover:bg-purple-600/25 border border-purple-600/40 text-purple-400 text-[10px] font-bold rounded-xl transition-colors flex items-center gap-1 uppercase tracking-wider shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Preset Link
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-1">
                    {config.links.map((link, idx) => (
                      <div key={link.id} className="p-4 bg-[#080808] border border-zinc-900 rounded-xl flex flex-col gap-3 relative shadow-inner">
                        <button
                          onClick={() => {
                            updateConfig((prev) => ({
                              ...prev,
                              links: prev.links.filter((l) => l.id !== link.id)
                            }));
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 hover:bg-zinc-900 text-zinc-550 hover:text-white rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] text-zinc-500 uppercase mb-1">Platform name</label>
                            <input
                              type="text"
                              value={link.platform}
                              onChange={(e) => {
                                const updated = [...config.links];
                                updated[idx].platform = e.target.value;
                                updateConfig((prev) => ({ ...prev, links: updated }));
                              }}
                              className="w-full px-2 py-1 text-xs text-white bg-[#080808] border border-zinc-900 rounded-lg outline-none focus:border-purple-600"
                            />
                          </div>
                          <div className="flex items-center justify-end pt-4">
                            <label className="text-[10px] font-semibold text-zinc-400 mr-2">Visible</label>
                            <CustomToggle
                              checked={link.visible}
                              onChange={(val) => {
                                const updated = [...config.links];
                                updated[idx].visible = val;
                                updateConfig((prev) => ({ ...prev, links: updated }));
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] text-zinc-500 uppercase mb-1">Redirect URL</label>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => {
                              const updated = [...config.links];
                              updated[idx].url = e.target.value;
                              updateConfig((prev) => ({ ...prev, links: updated }));
                            }}
                            className="w-full px-2 py-1 text-xs text-white bg-[#080808] border border-zinc-900 rounded-lg outline-none focus:border-purple-600"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-900/60">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-zinc-450 font-semibold">Glow shadow</span>
                            <CustomToggle
                              checked={link.glow}
                              onChange={(val) => {
                                const updated = [...config.links];
                                updated[idx].glow = val;
                                updateConfig((prev) => ({ ...prev, links: updated }));
                              }}
                            />
                          </div>
                          {link.glow && (
                            <div>
                              <input
                                type="color"
                                value={link.glowColor || "#ffffff"}
                                onChange={(e) => {
                                  const updated = [...config.links];
                                  updated[idx].glowColor = e.target.value;
                                  updateConfig((prev) => ({ ...prev, links: updated }));
                                }}
                                className="w-full h-8 rounded bg-transparent cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Profile Badges details */}
            {activeTab === "badges" && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Verified Badges</h3>
                  
                  <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px]">
                    {config.badges.map((b, idx) => (
                      <div key={b.id} className="p-4 bg-[#080808] border border-zinc-900 rounded-xl flex flex-col gap-3 shadow-inner">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xs font-bold text-white uppercase tracking-wider">{b.name}</div>
                            <div className="text-[9px] text-zinc-500 mt-0.5">{b.tooltip}</div>
                          </div>
                          <CustomToggle
                            checked={b.visible}
                            onChange={(val) => {
                              const updated = [...config.badges];
                              updated[idx].visible = val;
                              updateConfig((prev) => ({ ...prev, badges: updated }));
                            }}
                          />
                        </div>

                        {b.visible && (
                          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-900/60">
                            <div>
                              <label className="block text-[9px] text-zinc-500 uppercase mb-1">Glow Color</label>
                              <input
                                type="color"
                                value={b.glowColor || "#ffffff"}
                                onChange={(e) => {
                                  const updated = [...config.badges];
                                  updated[idx].glowColor = e.target.value;
                                  updateConfig((prev) => ({ ...prev, badges: updated }));
                                }}
                                className="w-full h-8 rounded bg-transparent cursor-pointer"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-zinc-500 uppercase mb-1">Animation</label>
                              <CustomDropdown
                                value={b.animation}
                                options={[
                                  { value: "none", label: "No Anim" },
                                  { value: "rotate", label: "Infinite Spin" },
                                  { value: "pulse", label: "Pulse scale" },
                                  { value: "float", label: "Floating hover" }
                                ]}
                                onChange={(val) => {
                                  const updated = [...config.badges];
                                  updated[idx].animation = val as any;
                                  updateConfig((prev) => ({ ...prev, badges: updated }));
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Cursor settings */}
            {activeTab === "cursor" && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Custom Cursor</h3>

                  <div>
                    <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Cursor Type</label>
                    <CustomDropdown
                      value={config.cursor.type}
                      options={[
                        { value: "default", label: "Standard Cursor" },
                        { value: "custom", label: "Custom Image" }
                      ]}
                      onChange={(val) => updateCursorProp("type", val)}
                    />
                  </div>

                  {config.cursor.type === "custom" && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider">Custom Cursor (PNG/CUR)</label>
                        <CloudinaryUploadButton
                          onUploadSuccess={(url) => updateCursorProp("customUrl", url)}
                          accept="image/*"
                          label="Upload Cursor"
                        />
                      </div>
                      <input
                        type="text"
                        value={config.cursor.customUrl || ""}
                        onChange={(e) => updateCursorProp("customUrl", e.target.value)}
                        placeholder="e.g. /cursor.png"
                        className="w-full px-3.5 py-2.5 text-xs text-white bg-[#080808] border border-zinc-900 rounded-xl outline-none focus:border-purple-600"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[9px] text-zinc-550 font-bold uppercase tracking-wider mb-1.5">Trail Particle Style</label>
                    <CustomDropdown
                      value={config.cursor.trail}
                      options={[
                        { value: "none", label: "No trail" },
                        { value: "sparkles", label: "Magic Sparkles" },
                        { value: "hearts", label: "Ambient Hearts" },
                        { value: "stars", label: "Twinkling Stars" },
                        { value: "rainbow", label: "Colorful Rainbow" },
                        { value: "bubbles", label: "Glass Bubbles" }
                      ]}
                      onChange={(val) => updateCursorProp("trail", val)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Widgets panel */}
            {activeTab === "widgets" && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Stats Widgets</h3>
                    <button
                      onClick={() => {
                        const newWidget: WidgetConfig = {
                          id: Math.random().toString(),
                          type: "custom",
                          title: "Custom Stat",
                          value: "100",
                          visible: true,
                          x: 0,
                          y: 0
                        };
                        updateConfig((prev) => ({
                          ...prev,
                          widgets: [...(prev.widgets || []), newWidget]
                        }));
                      }}
                      className="px-2.5 py-1.5 bg-purple-600/10 hover:bg-purple-600/25 border border-purple-600/40 text-purple-400 text-[10px] font-bold rounded-xl transition-colors flex items-center gap-1 uppercase tracking-wider shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Widget
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px]">
                    {(config.widgets || []).map((w, idx) => (
                      <div key={w.id} className="p-4 bg-[#080808] border border-zinc-900 rounded-xl flex flex-col gap-2 relative shadow-inner">
                        <button
                          onClick={() => {
                            updateConfig((prev) => ({
                              ...prev,
                              widgets: prev.widgets.filter((widget) => widget.id !== w.id)
                            }));
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 hover:bg-zinc-900 text-zinc-550 hover:text-white rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] text-zinc-500 uppercase mb-1">Widget Title</label>
                            <input
                              type="text"
                              value={w.title}
                              onChange={(e) => {
                                const updated = [...config.widgets];
                                updated[idx].title = e.target.value;
                                updateConfig((prev) => ({ ...prev, widgets: updated }));
                              }}
                              className="w-full px-2 py-1 text-xs text-white bg-[#080808] border border-zinc-900 rounded-lg outline-none focus:border-purple-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-zinc-500 uppercase mb-1">Stat Value</label>
                            <input
                              type="text"
                              value={w.value}
                              onChange={(e) => {
                                const updated = [...config.widgets];
                                updated[idx].value = e.target.value;
                                updateConfig((prev) => ({ ...prev, widgets: updated }));
                              }}
                              className="w-full px-2 py-1 text-xs text-white bg-[#080808] border border-zinc-900 rounded-lg outline-none focus:border-purple-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Presets */}
            {activeTab === "settings" && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#111111] border border-zinc-900 p-6 rounded-2xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Presets</h3>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={() => applyPreset("neon-pink")}
                      className="p-3.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl text-left transition-colors flex items-center justify-between"
                    >
                      <span>Neon Pink Glow</span>
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </button>
                    <button
                      onClick={() => applyPreset("cyberpunk")}
                      className="p-3.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl text-left transition-colors flex items-center justify-between"
                    >
                      <span>Cyberpunk Grid</span>
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </button>
                    <button
                      onClick={() => applyPreset("minimal-frost")}
                      className="p-3.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl text-left transition-colors flex items-center justify-between"
                    >
                      <span>Minimal Frost Snow</span>
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </section>
        )}

        {/* Right Side: Real-time Live Preview Render Panel */}
        <section className={`flex-1 relative bg-zinc-950/20 flex items-center justify-center p-6 ${showFullPreview ? "h-full w-full" : ""}`}>
          <div className="absolute inset-0 z-0 select-none">
            {/* Simulation view of the profile background styles */}
            <ProfileView config={config} isPreview={true} showDiscordActivity={true} />
          </div>
          
          {/* Subtle floating overlay tag */}
          <div className="absolute top-4 left-4 z-20 bg-zinc-950/80 border border-zinc-900 rounded-lg px-2.5 py-1 text-[10px] text-zinc-400 uppercase tracking-widest font-semibold backdrop-blur-md">
            Interactive Live Preview
          </div>
        </section>

      </div>

      {/* --- PREBUILT LINKS GUI SELECTION MODAL --- */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/85 z-[999] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col gap-5 shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Add Social</span>
              <button 
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkSourceValue("");
                }} 
                className="text-zinc-500 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Close
              </button>
            </div>

            {/* Platform Selection */}
            <div>
              <div className="text-[10px] text-zinc-505 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1">
                <span>🔗</span> Select link type
              </div>
              <label className="block text-[9px] text-zinc-550 font-bold uppercase mb-2">Link Type</label>
              
              {/* Grid of round brand icons */}
              <div className="grid grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {platforms.map((platform) => {
                  const isSelected = selectedPlatform === platform.id;
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatform(platform.id);
                        setLinkSourceValue("");
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? "bg-purple-600 text-white shadow-lg scale-105"
                          : "bg-zinc-900/60 border border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700"
                      }`}
                      title={platform.name}
                    >
                      <BrandIcon name={platform.id} className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Mode Pills */}
            <div>
              <label className="block text-[9px] text-zinc-550 font-bold uppercase mb-2">Social Mode</label>
              <div className="bg-zinc-900/70 p-1 rounded-xl flex gap-1 border border-zinc-900/40">
                <button
                  type="button"
                  onClick={() => setSocialMode("text")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${
                    socialMode === "text"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setSocialMode("link")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${
                    socialMode === "link"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Link
                </button>
              </div>
            </div>

            {/* Source Input */}
            <div>
              <label className="block text-[9px] text-zinc-550 font-bold uppercase mb-2">Source</label>
              <div className="relative">
                <input
                  type="text"
                  value={linkSourceValue}
                  onChange={(e) => setLinkSourceValue(e.target.value)}
                  placeholder={platforms.find((p) => p.id === selectedPlatform)?.placeholder || ""}
                  className="w-full px-3.5 py-2.5 text-xs text-white bg-black/40 border border-zinc-900 rounded-xl outline-none focus:border-purple-600 transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleAddPresetLink}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 border border-purple-600/30 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
