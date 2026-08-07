"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import ProfileView from "@/components/profile/ProfileView";
import { FullProfileConfig, BackgroundType, ParticleType, SongTrack, SocialLink, BadgeConfig, WidgetConfig } from "@/types/profile";
import {
  Undo, Redo, RefreshCw, Download, Upload, Palette, User, Maximize2,
  Sliders, Image, Sparkles, Type, Music, Link2, Shield, Settings, Eye,
  LogOut, Plus, Trash2, ShieldAlert, ArrowLeftRight, Monitor, Play, EyeOff, MousePointer, AppWindow
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const {
    config, updateConfig, undo, redo, resetConfig, applyPreset,
    currentUser, logout
  } = useProfile();

  const [activeTab, setActiveTab] = useState("profile");
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Helper updater functions for card properties
  const updateCardProp = (prop: keyof FullProfileConfig["card"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      card: { ...prev.card, [prop]: value }
    }));
  };

  // Helper updater for background properties
  const updateBgProp = (prop: keyof FullProfileConfig["background"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      background: { ...prev.background, [prop]: value }
    }));
  };

  // Helper updater for particle properties
  const updateParticleProp = (prop: keyof FullProfileConfig["particles"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      particles: { ...prev.particles, [prop]: value }
    }));
  };

  // Helper updater for typography properties
  const updateTypographyProp = (prop: keyof FullProfileConfig["typography"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      typography: { ...prev.typography, [prop]: value }
    }));
  };

  // Helper updater for music properties
  const updateMusicProp = (prop: keyof FullProfileConfig["mediaPlayer"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      mediaPlayer: { ...prev.mediaPlayer, [prop]: value }
    }));
  };

  // Helper updater for cursor properties
  const updateCursorProp = (prop: keyof FullProfileConfig["cursor"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      cursor: { ...prev.cursor, [prop]: value }
    }));
  };

  // Helper updater for splash properties
  const updateSplashProp = (prop: keyof FullProfileConfig["splash"], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      splash: { ...prev.splash, [prop]: value }
    }));
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
          {currentUser && (
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
          )}
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
                    <input
                      type="checkbox"
                      checked={config.splash.enabled}
                      onChange={(e) => updateSplashProp("enabled", e.target.checked)}
                      className="rounded border-zinc-800 accent-white cursor-pointer"
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
                        <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Sound URL (Played on Click)</label>
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
                  <select
                    value={config.card.layout}
                    onChange={(e) => updateCardProp("layout", e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="floating-card">Floating Card (Centered)</option>
                    <option value="centered">Centered Stack</option>
                    <option value="sidebar-layout">Sidebar split-screen</option>
                    <option value="fullscreen-layout">Double Panel Wide Grid</option>
                  </select>
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
                  <select
                    value={config.card.borderEffect}
                    onChange={(e) => updateCardProp("borderEffect", e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="none">Static Outline Border</option>
                    <option value="animated-gradient">Neon Rainbow Border</option>
                    <option value="breathing">Pulsing Glow Border</option>
                  </select>
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
                  <input
                    type="checkbox"
                    checked={config.card.floatingEffect}
                    onChange={(e) => updateCardProp("floatingEffect", e.target.checked)}
                    className="rounded border-zinc-800 accent-white cursor-pointer"
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
                  <select
                    value={config.background.type}
                    onChange={(e) => updateBgProp("type", e.target.value as BackgroundType)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="solid">Solid Color Background</option>
                    <option value="linear-gradient">Dual Linear Gradient</option>
                    <option value="animated-gradient">Animated Wave Gradient</option>
                    <option value="gif">GIF Wallpaper</option>
                    <option value="video">MP4 Video Wallpaper</option>
                  </select>
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
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Image / GIF URL</label>
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
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">MP4 Video URL</label>
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
                      <div className="flex justify-between text-[10px] text-zinc-500 font-semibold mb-1">
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
                      <div className="flex justify-between text-[10px] text-zinc-500 font-semibold mb-1">
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
                  <select
                    value={config.particles.type}
                    onChange={(e) => updateParticleProp("type", e.target.value as ParticleType)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="none">Disable particles</option>
                    <option value="stars">Stars dust</option>
                    <option value="snow">Winter Snowfall</option>
                    <option value="rain">Digital Rain storm</option>
                    <option value="sakura">Cherry Blossom Sakura</option>
                    <option value="matrix">Green Matrix Code Rain</option>
                    <option value="hearts">Floating Hearts</option>
                    <option value="bubbles">Ambient Glass Bubbles</option>
                    <option value="sparkles">Four-Point Sparkles</option>
                    <option value="hexagons">Wireframe Hexagons</option>
                  </select>
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
                  <select
                    value={config.typography.fontFamily}
                    onChange={(e) => updateTypographyProp("fontFamily", e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="Geist Sans">Geist Sans (Clean)</option>
                    <option value="Outfit">Outfit (Round premium)</option>
                    <option value="Arial">Arial (System default)</option>
                    <option value="Courier New">Courier New (Monospace)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Username Color Mode</label>
                  <select
                    value={config.typography.textEffect}
                    onChange={(e) => updateTypographyProp("textEffect", e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="none">Solid Color</option>
                    <option value="gradient">Custom Gradient</option>
                    <option value="rainbow">Animated Rainbow</option>
                  </select>
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
                  <input
                    type="checkbox"
                    checked={config.mediaPlayer.enabled}
                    onChange={(e) => updateMusicProp("enabled", e.target.checked)}
                    className="rounded border-zinc-800 accent-white cursor-pointer"
                  />
                </div>

                {config.mediaPlayer.enabled && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-2.5 bg-black/30 border border-zinc-850 rounded-xl">
                        <span className="text-xs font-semibold text-zinc-300">Autoplay</span>
                        <input
                          type="checkbox"
                          checked={config.mediaPlayer.autoplay}
                          onChange={(e) => updateMusicProp("autoplay", e.target.checked)}
                          className="rounded border-zinc-800 accent-white cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-black/30 border border-zinc-850 rounded-xl">
                        <span className="text-xs font-semibold text-zinc-300">Loop tracks</span>
                        <input
                          type="checkbox"
                          checked={config.mediaPlayer.loop}
                          onChange={(e) => updateMusicProp("loop", e.target.checked)}
                          className="rounded border-zinc-800 accent-white cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Player Position</label>
                      <select
                        value={config.mediaPlayer.position}
                        onChange={(e) => updateMusicProp("position", e.target.value)}
                        className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-zinc-800 rounded-xl outline-none"
                      >
                        <option value="inside-card">Inside Card container</option>
                        <option value="top">Top float header</option>
                        <option value="bottom">Bottom footer float</option>
                        <option value="floating-left">Floating Left corner</option>
                        <option value="floating-right">Floating Right corner</option>
                      </select>
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
                          <Plus className="w-3 h-3" /> Add Track
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
                              <label className="block text-[9px] text-zinc-455 uppercase mb-0.5">Audio File Stream URL</label>
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
                  <input
                    type="checkbox"
                    checked={config.discord.enabled}
                    onChange={(e) => updateConfig((prev) => ({
                      ...prev,
                      discord: { ...prev.discord, enabled: e.target.checked }
                    }))}
                    className="rounded border-zinc-800 accent-white cursor-pointer"
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
                    onClick={() => {
                      const newLink: SocialLink = {
                        id: Math.random().toString(),
                        platform: "Website",
                        url: "https://",
                        glow: false,
                        glowColor: "#ffffff",
                        animation: "none",
                        iconColor: "#ffffff",
                        visible: true
                      };
                      updateConfig((prev) => ({
                        ...prev,
                        links: [...prev.links, newLink]
                      }));
                    }}
                    className="px-2 py-1 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Link
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
                          <label className="block text-[9px] text-zinc-500 uppercase mb-0.5">Platform name</label>
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
                          <input
                            type="checkbox"
                            checked={link.visible}
                            onChange={(e) => {
                              const updated = [...config.links];
                              updated[idx].visible = e.target.checked;
                              updateConfig((prev) => ({ ...prev, links: updated }));
                            }}
                            className="rounded border-zinc-800 accent-white cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] text-zinc-500 uppercase mb-0.5">Redirect URL</label>
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
                          <input
                            type="checkbox"
                            checked={link.glow}
                            onChange={(e) => {
                              const updated = [...config.links];
                              updated[idx].glow = e.target.checked;
                              updateConfig((prev) => ({ ...prev, links: updated }));
                            }}
                            className="rounded border-zinc-800 accent-white cursor-pointer"
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
                        <input
                          type="checkbox"
                          checked={b.visible}
                          onChange={(e) => {
                            const updated = [...config.badges];
                            updated[idx].visible = e.target.checked;
                            updateConfig((prev) => ({ ...prev, badges: updated }));
                          }}
                          className="rounded border-zinc-800 accent-white cursor-pointer"
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
                            <select
                              value={b.animation}
                              onChange={(e) => {
                                const updated = [...config.badges];
                                updated[idx].animation = e.target.value as any;
                                updateConfig((prev) => ({ ...prev, badges: updated }));
                              }}
                              className="w-full px-2 py-1 text-xs text-white bg-zinc-900 border border-zinc-800 rounded-lg outline-none"
                            >
                              <option value="none">No Anim</option>
                              <option value="rotate">Infinite Spin</option>
                              <option value="pulse">Pulse scale</option>
                              <option value="float">Floating hover</option>
                            </select>
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
                  <select
                    value={config.cursor.type}
                    onChange={(e) => updateCursorProp("type", e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="default">Standard Cursor</option>
                    <option value="custom">Custom Image / Link</option>
                  </select>
                </div>

                {config.cursor.type === "custom" && (
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Cursor Image URL (PNG/CUR)</label>
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
                  <select
                    value={config.cursor.trail}
                    onChange={(e) => updateCursorProp("trail", e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-zinc-800 rounded-xl outline-none"
                  >
                    <option value="none">No trail</option>
                    <option value="sparkles">Magic Sparkles</option>
                    <option value="hearts">Ambient Hearts</option>
                    <option value="stars">Twinkling Stars</option>
                    <option value="rainbow">Colorful Rainbow</option>
                    <option value="bubbles">Glass Bubbles</option>
                  </select>
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
                    <Plus className="w-3 h-3" /> Add Widget
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
          <div className="absolute inset-0 z-0 select-none animate-fade-in">
            {/* Simulation view of the profile background styles */}
            <ProfileView config={config} isPreview={true} showDiscordActivity={true} />
          </div>
          
          {/* Subtle floating overlay tag */}
          <div className="absolute top-4 left-4 z-20 bg-zinc-950/80 border border-zinc-800 rounded-lg px-2.5 py-1 text-[10px] text-zinc-400 uppercase tracking-widest font-semibold backdrop-blur-md">
            Interactive Live Preview
          </div>
        </section>

      </div>
    </main>
  );
}
