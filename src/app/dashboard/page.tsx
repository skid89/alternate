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
  LogOut, Plus, Trash2, ShieldAlert, ArrowLeftRight, Monitor, Play, EyeOff, MousePointer, AppWindow, Loader2, Info
} from "lucide-react";

// --- CUSTOM TOGGLE SWITCH ---
function CustomToggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors border outline-none ${
        checked ? "bg-white border-white" : "bg-black border-zinc-800"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-current transition-transform ${
          checked ? "translate-x-4 text-black" : "translate-x-0.5 text-zinc-500"
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
        className="w-full px-3 py-2 text-xs text-left text-white bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between outline-none hover:border-zinc-700 transition-colors"
      >
        <span>{selectedLabel}</span>
        <span className="text-[9px] text-zinc-500 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "none" }}>▼</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-40 max-h-48 overflow-y-auto p-1 flex flex-col gap-0.5">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left rounded-lg transition-colors ${
                  value === opt.value
                    ? "bg-white text-black font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
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

  // Export JSON configuration file
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${config.username}_alternate_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON configuration file
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
            alert("Invalid configuration file format.");
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
  const prebuiltPresets = [
    { platform: "Discord", url: "https://discord.gg/", glowColor: "#5865F2" },
    { platform: "YouTube", url: "https://youtube.com/@", glowColor: "#FF0000" },
    { platform: "TikTok", url: "https://tiktok.com/@", glowColor: "#00f2fe" },
    { platform: "Reddit", url: "https://reddit.com/u/", glowColor: "#FF4500" },
    { platform: "Spotify", url: "https://open.spotify.com/", glowColor: "#1DB954" },
    { platform: "SoundCloud", url: "https://soundcloud.com/", glowColor: "#FF5500" },
    { platform: "Roblox", url: "https://roblox.com/users/", glowColor: "#ffffff" },
    { platform: "ETH Wallet", url: "0x", glowColor: "#3c3c3d" },
    { platform: "LTC Wallet", url: "L", glowColor: "#bfbbbb" },
    { platform: "BTC Wallet", url: "bc1", glowColor: "#f7931a" },
    { platform: "Custom Website", url: "https://", glowColor: "#ffffff" },
  ];

  const handleAddPresetLink = (preset: typeof prebuiltPresets[0]) => {
    const newLink: SocialLink = {
      id: Math.random().toString(),
      platform: preset.platform,
      url: preset.url,
      glow: true,
      glowColor: preset.glowColor,
      animation: "none",
      iconColor: "#ffffff",
      visible: true
    };
    updateConfig((prev) => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
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
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Verifying Session...</span>
        </div>
      </main>
    );
  }

  if (!currentUser) return null;

  return (
    <main className="w-full min-h-screen bg-black text-white flex flex-col select-none relative">
      
      {/* Top Header Panel */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/40 backdrop-blur-md px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-widest text-white">
            alternate.lol
          </Link>
          <span className="h-4 w-[1px] bg-zinc-800" />
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Profile Editor</span>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-3">
          <button onClick={undo} className="p-2 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Undo change">
            <Undo className="w-4 h-4" />
          </button>
          <button onClick={redo} className="p-2 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Redo change">
            <Redo className="w-4 h-4" />
          </button>
          <button onClick={resetConfig} className="p-2 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Reset defaults">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleExport} className="p-2 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Export config JSON">
            <Download className="w-4 h-4" />
          </button>
          <label className="p-2 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Import config JSON">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <span className="h-4 w-[1px] bg-zinc-800" />

          {/* User authentication status & quick admin jumps */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
              {currentUser.role}
            </span>
            
            {(currentUser.role === "Owner" || currentUser.role === "Admin") && (
              <Link
                href="/admin"
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-xs rounded-xl flex items-center gap-1 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Admin Panel
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main split viewport layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Editor Form Sidebar */}
        <aside className="w-80 border-r border-zinc-800 bg-zinc-950/20 backdrop-blur-sm flex flex-col h-full z-20">
          {/* Search bar */}
          <div className="p-4 border-b border-zinc-800">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category settings..."
              className="w-full px-3 py-2 text-xs text-white bg-black/40 border border-zinc-800 rounded-xl outline-none focus:border-zinc-500"
            />
          </div>

          {/* Navigation Category list */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
            {filteredTabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-xs font-semibold rounded-xl text-left transition-all ${
                    activeTab === t.id
                      ? "bg-zinc-800 border border-zinc-700 text-white"
                      : "hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Interactive view toggle footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/40">
            <button
              onClick={() => setShowFullPreview(!showFullPreview)}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-zinc-850"
            >
              <Eye className="w-4 h-4" /> {showFullPreview ? "Edit Panel View" : "Full Page Render"}
            </button>
          </div>
        </aside>

        {/* Middle Panel: Controls Form Inputs */}
        {!showFullPreview && (
          <section className="flex-1 max-w-md border-r border-zinc-800 bg-zinc-950/10 overflow-y-auto p-6 flex flex-col gap-6">
            
            {/* Tab: Profile Info & Splash Screen */}
            {activeTab === "profile" && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Profile Information</h3>
                
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Username</label>
                  <input
                    type="text"
                    value={config.username}
                    onChange={(e) => updateConfig((prev) => ({ ...prev, username: e.target.value.toLowerCase() }))}
                    className="w-full px-3 py-2.5 text-xs text-white bg-black/40 border border-zinc-850 rounded-xl outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Biography Description</label>
                  <textarea
                    value={config.bio}
                    onChange={(e) => updateConfig((prev) => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 text-xs text-white bg-black/40 border border-zinc-850 rounded-xl outline-none resize-none focus:border-zinc-600"
                  />
                </div>

                <div className="border-t border-zinc-850 pt-4 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Intro / Splash Screen</h4>

                  <div className="flex items-center justify-between p-2.5 bg-black/30 border border-zinc-850 rounded-xl">
                    <span className="text-xs font-semibold text-zinc-300">Enable Splash screen</span>
                    <CustomToggle
                      checked={config.splash.enabled}
                      onChange={(val) => updateSplashProp("enabled", val)}
                    />
                  </div>

                  {config.splash.enabled && (
                    <>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Splash Screen Main Title</label>
                        <input
                          type="text"
                          value={config.splash.text}
                          onChange={(e) => updateSplashProp("text", e.target.value)}
                          className="w-full px-3 py-2 text-xs text-white bg-black/40 border border-zinc-850 rounded-xl outline-none focus:border-zinc-650"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Splash Screen Subtitle</label>
                        <input
                          type="text"
                          value={config.splash.subtitle}
                          onChange={(e) => updateSplashProp("subtitle", e.target.value)}
                          className="w-full px-3 py-2 text-xs text-white bg-black/40 border border-zinc-850 rounded-xl outline-none focus:border-zinc-650"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Button Call-to-action text</label>
                        <input
                          type="text"
                          value={config.splash.buttonText}
                          onChange={(e) => updateSplashProp("buttonText", e.target.value)}
                          className="w-full px-3 py-2 text-xs text-white bg-black/40 border border-zinc-850 rounded-xl outline-none focus:border-zinc-650"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Sound Track (MP3/WAV)</label>
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
                          className="w-full px-3 py-2 text-xs text-white bg-black/40 border border-zinc-850 rounded-xl outline-none focus:border-zinc-650"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Bg Color</label>
                          <input
                            type="color"
                            value={config.splash.backgroundColor}
                            onChange={(e) => updateSplashProp("backgroundColor", e.target.value)}
                            className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-1">
                            <span>Blur ({config.splash.glassBlur}px)</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            value={config.splash.glassBlur}
                            onChange={(e) => updateSplashProp("glassBlur", parseInt(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Card Editor */}
            {activeTab === "card" && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Card Customizer</h3>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Card Layout Type</label>
                  <CustomDropdown
                    value={config.card.layout}
                    options={[
                      { value: "floating-card", label: "Floating Card (Centered)" },
                      { value: "centered", label: "Centered Stack" },
                      { value: "sidebar-layout", label: "Sidebar split-screen" },
                      { value: "fullscreen-layout", label: "Double Panel Wide Grid" }
                    ]}
                    onChange={(val) => updateCardProp("layout", val)}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    <span>Card Width ({config.card.width}px)</span>
                  </div>
                  <input
                    type="range"
                    min="320"
                    max="600"
                    step="10"
                    value={config.card.width}
                    onChange={(e) => updateCardProp("width", parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    <span>Backdrop Blur ({config.card.glassBlur}px)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={config.card.glassBlur}
                    onChange={(e) => updateCardProp("glassBlur", parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    <span>Glass Opacity ({Math.round(config.card.backgroundOpacity * 100)}%)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.05"
                    value={config.card.backgroundOpacity}
                    onChange={(e) => updateCardProp("backgroundOpacity", parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Border Accent Effect</label>
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

                <div className="grid grid-cols-2 gap-3 border-t border-zinc-850 pt-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Outline Color</label>
                    <input
                      type="color"
                      value={config.card.outlineColor || "#ffffff"}
                      onChange={(e) => updateCardProp("outlineColor", e.target.value)}
                      className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-1">
                      <span>Outline Size ({config.card.outlineThickness || 1}px)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={config.card.outlineThickness || 1}
                      onChange={(e) => updateCardProp("outlineThickness", parseInt(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-zinc-850 pt-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Glow Color</label>
                    <input
                      type="color"
                      value={config.card.glowColor || "#ffffff"}
                      onChange={(e) => updateCardProp("glowColor", e.target.value)}
                      className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-1">
                      <span>Glow Strength ({config.card.glowStrength || 0}px)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={config.card.glowStrength || 0}
                      onChange={(e) => updateCardProp("glowStrength", parseInt(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-black/30 border border-zinc-850 rounded-xl mt-2">
                  <span className="text-xs font-semibold text-zinc-300">Apply floating hover drift</span>
                  <CustomToggle
                    checked={config.card.floatingEffect}
                    onChange={(val) => updateCardProp("floatingEffect", val)}
                  />
                </div>
              </div>
            )}

            {/* Tab: Background Layer */}
            {activeTab === "background" && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Background Layer</h3>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Wallpaper Type</label>
                  <CustomDropdown
                    value={config.background.type}
                    options={[
                      { value: "solid", label: "Solid Color Background" },
                      { value: "linear-gradient", label: "Dual Linear Gradient" },
                      { value: "animated-gradient", label: "Animated Wave Gradient" },
                      { value: "gif", label: "GIF / Image Wallpaper" },
                      { value: "video", label: "MP4 Video Wallpaper" }
                    ]}
                    onChange={(val) => updateBgProp("type", val)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Color A</label>
                    <input
                      type="color"
                      value={config.background.color1}
                      onChange={(e) => updateBgProp("color1", e.target.value)}
                      className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Color B</label>
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
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Wallpaper Image / GIF</label>
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
                      className="w-full px-3 py-2 text-xs text-white bg-black/40 border border-zinc-850 rounded-xl outline-none focus:border-zinc-650"
                    />
                  </div>
                )}

                {config.background.type === "video" && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">MP4 Video</label>
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
                      className="w-full px-3 py-2 text-xs text-white bg-black/40 border border-zinc-850 rounded-xl outline-none focus:border-zinc-650"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 border-t border-zinc-850 pt-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Overlay Tint</label>
                    <input
                      type="color"
                      value={config.background.overlayColor || "#000000"}
                      onChange={(e) => updateBgProp("overlayColor", e.target.value)}
                      className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-1">
                      <span>Overlay Opacity ({Math.round(config.background.overlayOpacity * 100)}%)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.9"
                      step="0.05"
                      value={config.background.overlayOpacity}
                      onChange={(e) => updateBgProp("overlayOpacity", parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-3 flex flex-col gap-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Visual Filters</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-505 font-semibold mb-1">
                        <span>Blur ({config.background.blur || 0}px)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={config.background.blur || 0}
                        onChange={(e) => updateBgProp("blur", parseInt(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-505 font-semibold mb-1">
                        <span>Brightness ({config.background.brightness || 100}%)</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="150"
                        value={config.background.brightness || 100}
                        onChange={(e) => updateBgProp("brightness", parseInt(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Canvas Particles */}
            {activeTab === "particles" && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Canvas Particle Engine</h3>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Particle System Style</label>
                  <CustomDropdown
                    value={config.particles.type}
                    options={[
                      { value: "none", label: "Disable particles" },
                      { value: "stars", label: "Stars dust" },
                      { value: "snow", label: "Winter Snowfall" },
                      { value: "rain", label: "Digital Rain storm" },
                      { value: "sakura", label: "Cherry Blossom Sakura" },
                      { value: "matrix", label: "Green Matrix Code Rain" },
                      { value: "hearts", label: "Floating Hearts" },
                      { value: "bubbles", label: "Ambient Glass Bubbles" },
                      { value: "sparkles", label: "Four-Point Sparkles" },
                      { value: "hexagons", label: "Wireframe Hexagons" }
                    ]}
                    onChange={(val) => updateParticleProp("type", val)}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    <span>Spawn Density ({config.particles.density} count)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={config.particles.density}
                    onChange={(e) => updateParticleProp("density", parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    <span>Drift Velocity Speed ({config.particles.speed})</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={config.particles.speed}
                    onChange={(e) => updateParticleProp("speed", parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-zinc-850 pt-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Particle Color</label>
                    <input
                      type="color"
                      value={config.particles.color || "#ffffff"}
                      onChange={(e) => updateParticleProp("color", e.target.value)}
                      className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase mb-1">
                      <span>Particle Size ({config.particles.size || 2}px)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={config.particles.size || 2}
                      onChange={(e) => updateParticleProp("size", parseInt(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Typography Fonts */}
            {activeTab === "typography" && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Typography Fonts</h3>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Font Style family</label>
                  <CustomDropdown
                    value={config.typography.fontFamily}
                    options={[
                      { value: "Geist Sans", label: "Geist Sans (Clean)" },
                      { value: "Outfit", label: "Outfit (Round premium)" },
                      { value: "Arial", label: "Arial (System default)" },
                      { value: "Courier New", label: "Courier New (Monospace)" }
                    ]}
                    onChange={(val) => updateTypographyProp("fontFamily", val)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Username Color Mode</label>
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
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Text Color</label>
                    <input
                      type="color"
                      value={config.typography.usernameColor}
                      onChange={(e) => updateTypographyProp("usernameColor", e.target.value)}
                      className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                    />
                  </div>
                ) : config.typography.textEffect === "gradient" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Grad Color 1</label>
                      <input
                        type="color"
                        value={config.typography.textGradientColor1}
                        onChange={(e) => updateTypographyProp("textGradientColor1", e.target.value)}
                        className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Grad Color 2</label>
                      <input
                        type="color"
                        value={config.typography.textGradientColor2}
                        onChange={(e) => updateTypographyProp("textGradientColor2", e.target.value)}
                        className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3 border-t border-zinc-850 pt-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Bio Text Color</label>
                    <input
                      type="color"
                      value={config.typography.bioColor || "#ffffff"}
                      onChange={(e) => updateTypographyProp("bioColor", e.target.value)}
                      className="w-full h-8 rounded-lg bg-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Subtitle Color</label>
                    <input
                      type="color"
                      value={config.typography.subtitleColor || "#a1a1aa"}
                      onChange={(e) => updateTypographyProp("subtitleColor", e.target.value)}
                      className="w-full h-8 rounded-lg bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Playlist tracks editor */}
            {activeTab === "music" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Music Playlist configuration</h3>

                <div className="flex items-center justify-between p-2.5 bg-black/30 border border-zinc-850 rounded-xl">
                  <span className="text-xs font-semibold text-zinc-300">Enable media player module</span>
                  <CustomToggle
                    checked={config.mediaPlayer.enabled}
                    onChange={(val) => updateMusicProp("enabled", val)}
                  />
                </div>

                {config.mediaPlayer.enabled && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-2.5 bg-black/30 border border-zinc-850 rounded-xl">
                        <span className="text-xs font-semibold text-zinc-300">Autoplay</span>
                        <CustomToggle
                          checked={config.mediaPlayer.autoplay}
                          onChange={(val) => updateMusicProp("autoplay", val)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-black/30 border border-zinc-850 rounded-xl">
                        <span className="text-xs font-semibold text-zinc-300">Loop tracks</span>
                        <CustomToggle
                          checked={config.mediaPlayer.loop}
                          onChange={(val) => updateMusicProp("loop", val)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Player Position</label>
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

                    {/* Tracks Manager */}
                    <div className="border-t border-zinc-850 pt-3 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tracks list ({config.mediaPlayer.trackList.length})</span>
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
                          className="px-2 py-1 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Track
                        </button>
                      </div>

                      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                        {config.mediaPlayer.trackList.map((track, index) => (
                          <div key={track.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col gap-2 relative">
                            <button
                              onClick={() => {
                                updateMusicProp(
                                  "trackList",
                                  config.mediaPlayer.trackList.filter((t) => t.id !== track.id)
                                );
                              }}
                              className="absolute top-2 right-2 p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"
                              title="Delete song track"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="text-[10px] font-bold text-zinc-500 uppercase">Track #{index + 1}</div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] text-zinc-450 uppercase mb-0.5">Song Title</label>
                                <input
                                  type="text"
                                  value={track.title}
                                  onChange={(e) => {
                                    const updatedList = [...config.mediaPlayer.trackList];
                                    updatedList[index].title = e.target.value;
                                    updateMusicProp("trackList", updatedList);
                                  }}
                                  className="w-full px-2 py-1 text-xs text-white bg-black/40 border border-zinc-850 rounded-lg outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-zinc-450 uppercase mb-0.5">Artist</label>
                                <input
                                  type="text"
                                  value={track.artist}
                                  onChange={(e) => {
                                    const updatedList = [...config.mediaPlayer.trackList];
                                    updatedList[index].artist = e.target.value;
                                    updateMusicProp("trackList", updatedList);
                                  }}
                                  className="w-full px-2 py-1 text-xs text-white bg-black/40 border border-zinc-850 rounded-lg outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-[9px] text-zinc-455 uppercase">Audio File Stream</label>
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
                                className="w-full px-2 py-1 text-xs text-white bg-black/40 border border-zinc-850 rounded-lg outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Discord integration */}
            {activeTab === "discord" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Discord Integration</h3>
                
                <div className="flex items-center justify-between p-2.5 bg-black/30 border border-zinc-850 rounded-xl">
                  <span className="text-xs font-semibold text-zinc-300">Enable Live Lanyard Presence</span>
                  <CustomToggle
                    checked={config.discord.enabled}
                    onChange={(val) => updateConfig((prev) => ({
                      ...prev,
                      discord: { ...prev.discord, enabled: val }
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Discord Numeric User ID</label>
                  <input
                    type="text"
                    value={config.discord.userId}
                    onChange={(e) => updateConfig((prev) => ({
                      ...prev,
                      discord: { ...prev.discord, userId: e.target.value.trim() }
                    }))}
                    placeholder="e.g. 182739485726194758"
                    className="w-full px-3 py-2 text-xs text-white bg-black/40 border border-zinc-850 rounded-xl outline-none focus:border-zinc-650"
                  />
                  <p className="text-[9px] text-zinc-500 mt-1 leading-normal">
                    This hooks up to the Lanyard API automatically to display your live online status, gaming presence, and Spotify stream in real-time. Make sure you are in the Lanyard Discord server.
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Social Links expanded */}
            {activeTab === "links" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Social Links List</h3>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowLinkModal(true)}
                    className="px-2 py-1 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Preset Link
                  </button>
                </div>

                <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-1">
                  {config.links.map((link, idx) => (
                    <div key={link.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col gap-3 relative">
                      <button
                        onClick={() => {
                          updateConfig((prev) => ({
                            ...prev,
                            links: prev.links.filter((l) => l.id !== link.id)
                          }));
                        }}
                        className="absolute top-2.5 right-2.5 p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-zinc-505 uppercase mb-0.5">Platform name</label>
                          <input
                            type="text"
                            value={link.platform}
                            onChange={(e) => {
                              const updated = [...config.links];
                              updated[idx].platform = e.target.value;
                              updateConfig((prev) => ({ ...prev, links: updated }));
                            }}
                            className="w-full px-2 py-1 text-xs text-white bg-black/40 border border-zinc-850 rounded-lg outline-none"
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
                        <label className="block text-[9px] text-zinc-505 uppercase mb-0.5">Redirect URL</label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...config.links];
                            updated[idx].url = e.target.value;
                            updateConfig((prev) => ({ ...prev, links: updated }));
                          }}
                          className="w-full px-3 py-1.5 text-xs text-white bg-black/40 border border-zinc-850 rounded-lg outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400 font-semibold">Glow effect</span>
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
            )}

            {/* Tab: Profile Badges details */}
            {activeTab === "badges" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Profile Badges</h3>
                
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px]">
                  {config.badges.map((b, idx) => (
                    <div key={b.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs font-bold text-white">{b.name}</div>
                          <div className="text-[9px] text-zinc-500">{b.tooltip}</div>
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
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900">
                          <div>
                            <label className="block text-[9px] text-zinc-500 uppercase mb-0.5">Glow Color</label>
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
                            <label className="block text-[9px] text-zinc-500 uppercase mb-0.5">Badge Animation</label>
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
            )}

            {/* Tab: Cursor settings */}
            {activeTab === "cursor" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Cursor Options</h3>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Cursor Type</label>
                  <CustomDropdown
                    value={config.cursor.type}
                    options={[
                      { value: "default", label: "Standard Cursor" },
                      { value: "custom", label: "Custom Image / Link" }
                    ]}
                    onChange={(val) => updateCursorProp("type", val)}
                  />
                </div>

                {config.cursor.type === "custom" && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Custom Cursor (PNG/CUR)</label>
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
                      className="w-full px-3 py-2 text-xs text-white bg-black/40 border border-zinc-850 rounded-xl outline-none focus:border-zinc-650"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Cursor Trail Particle Style</label>
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
            )}

            {/* Tab: Widgets panel */}
            {activeTab === "widgets" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Widget Layouts</h3>

                <div className="flex justify-end">
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
                    className="px-2 py-1 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Widget
                  </button>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px]">
                  {(config.widgets || []).map((w, idx) => (
                    <div key={w.id} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col gap-2 relative">
                      <button
                        onClick={() => {
                          updateConfig((prev) => ({
                            ...prev,
                            widgets: prev.widgets.filter((widget) => widget.id !== w.id)
                          }));
                        }}
                        className="absolute top-2.5 right-2.5 p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-zinc-500 uppercase mb-0.5">Widget Title</label>
                          <input
                            type="text"
                            value={w.title}
                            onChange={(e) => {
                              const updated = [...config.widgets];
                              updated[idx].title = e.target.value;
                              updateConfig((prev) => ({ ...prev, widgets: updated }));
                            }}
                            className="w-full px-2 py-1 text-xs text-white bg-black/40 border border-zinc-850 rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-zinc-500 uppercase mb-0.5">Stat Value</label>
                          <input
                            type="text"
                            value={w.value}
                            onChange={(e) => {
                              const updated = [...config.widgets];
                              updated[idx].value = e.target.value;
                              updateConfig((prev) => ({ ...prev, widgets: updated }));
                            }}
                            className="w-full px-2 py-1 text-xs text-white bg-black/40 border border-zinc-850 rounded-lg outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Presets */}
            {activeTab === "settings" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Preset Themes</h3>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => applyPreset("neon-pink")}
                    className="p-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold rounded-xl text-left transition-colors flex items-center justify-between"
                  >
                    <span>Neon Pink Glow</span>
                    <Sparkles className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => applyPreset("cyberpunk")}
                    className="p-3 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 text-yellow-300 text-xs font-semibold rounded-xl text-left transition-colors flex items-center justify-between"
                  >
                    <span>Cyberpunk Grid</span>
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </button>
                  <button
                    onClick={() => applyPreset("minimal-frost")}
                    className="p-3 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold rounded-xl text-left transition-colors flex items-center justify-between"
                  >
                    <span>Minimal Frost Snow</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>
            )}

          </section>
        )}

        {/* Right Side: Real-time Live Preview Render Panel */}
        <section className={`flex-1 relative bg-black/25 flex items-center justify-center p-6 ${showFullPreview ? "h-full w-full" : ""}`}>
          <div className="absolute inset-0 z-0 select-none">
            {/* Simulation view of the profile background styles */}
            <ProfileView config={config} isPreview={true} showDiscordActivity={true} />
          </div>
          
          {/* Subtle floating overlay tag */}
          <div className="absolute top-4 left-4 z-20 bg-zinc-950/80 border border-zinc-800 rounded-lg px-2.5 py-1 text-[10px] text-zinc-400 uppercase tracking-widest font-semibold backdrop-blur-md">
            Interactive Live Preview
          </div>
        </section>

      </div>

      {/* --- PREBUILT LINKS GUI SELECTION MODAL --- */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Select Prebuilt Link Preset</span>
              <button onClick={() => setShowLinkModal(false)} className="text-zinc-500 hover:text-white text-xs">Close</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto max-h-96 pt-2">
              {prebuiltPresets.map((preset) => (
                <button
                  key={preset.platform}
                  type="button"
                  onClick={() => handleAddPresetLink(preset)}
                  className="p-3 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-center flex flex-col items-center gap-1.5 transition-all"
                >
                  <span className="text-xs font-bold">{preset.platform}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
