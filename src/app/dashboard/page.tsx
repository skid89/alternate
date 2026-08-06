"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileView from "@/components/profile/ProfileView";
import { FullProfileConfig, BackgroundType, ParticleType } from "@/types/profile";
import {
  Undo, Redo, RefreshCw, Download, Upload, Palette, User, Maximize2,
  Sliders, Image, Sparkles, Type, Music, Link2, Shield, Settings, Eye,
  LogOut, Plus, Trash2, ShieldAlert, ArrowLeftRight
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

  // Sidebar Category Tabs definition
  const tabs = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "card", label: "Card Editor", icon: Sliders },
    { id: "background", label: "Background", icon: Image },
    { id: "particles", label: "Particles", icon: Sparkles },
    { id: "typography", label: "Typography", icon: Type },
    { id: "music", label: "Music Player", icon: Music },
    { id: "links", label: "Social Links", icon: Link2 },
    { id: "badges", label: "Badges System", icon: Shield },
    { id: "settings", label: "Presets & Tools", icon: Palette },
  ];

  const filteredTabs = tabs.filter((t) =>
    t.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="w-full min-h-screen bg-[#07050e] text-white flex flex-col select-none relative">
      
      {/* Top Header Panel */}
      <header className="h-16 border-b border-white/5 bg-zinc-950/40 backdrop-blur-md px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            alternate.lol
          </Link>
          <span className="h-4 w-[1px] bg-zinc-800" />
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Profile Editor</span>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-3">
          <button onClick={undo} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Undo change">
            <Undo className="w-4 h-4" />
          </button>
          <button onClick={redo} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Redo change">
            <Redo className="w-4 h-4" />
          </button>
          <button onClick={resetConfig} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Reset defaults">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleExport} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Export config JSON">
            <Download className="w-4 h-4" />
          </button>
          <label className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Import config JSON">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <span className="h-4 w-[1px] bg-zinc-800" />

          {/* User authentication status & quick admin jumps */}
          {currentUser && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20">
                {currentUser.role}
              </span>
              
              {(currentUser.role === "Owner" || currentUser.role === "Admin") && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 bg-purple-500/15 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 text-xs rounded-xl flex items-center gap-1 transition-colors"
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
        <aside className="w-80 border-r border-white/5 bg-zinc-950/20 backdrop-blur-sm flex flex-col h-full z-20">
          {/* Search bar */}
          <div className="p-4 border-b border-white/5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category settings..."
              className="w-full px-3 py-2 text-xs text-white bg-black/40 border border-white/5 rounded-xl outline-none focus:border-pink-500/40"
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
                      ? "bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 text-pink-500"
                      : "hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Interactive view toggle footer */}
          <div className="p-4 border-t border-white/5 bg-zinc-950/40">
            <button
              onClick={() => setShowFullPreview(!showFullPreview)}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/5"
            >
              <Eye className="w-4 h-4" /> {showFullPreview ? "Edit Panel View" : "Full Page Render"}
            </button>
          </div>
        </aside>

        {/* Middle Panel: Controls Form Inputs */}
        {!showFullPreview && (
          <section className="flex-1 max-w-md border-r border-white/5 bg-zinc-950/10 overflow-y-auto p-6 flex flex-col gap-6">
            
            {activeTab === "profile" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Profile Information</h3>
                
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Username</label>
                  <input
                    type="text"
                    value={config.username}
                    onChange={(e) => updateConfig((prev) => ({ ...prev, username: e.target.value.toLowerCase() }))}
                    className="w-full px-3 py-2.5 text-xs text-white bg-black/40 border border-white/5 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Biography Description</label>
                  <textarea
                    value={config.bio}
                    onChange={(e) => updateConfig((prev) => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2.5 text-xs text-white bg-black/40 border border-white/5 rounded-xl outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "card" && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Card Customizer</h3>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Card Layout Type</label>
                  <select
                    value={config.card.layout}
                    onChange={(e) => updateCardProp("layout", e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-white/5 rounded-xl outline-none"
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
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
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
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
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
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Border Accent Effect</label>
                  <select
                    value={config.card.borderEffect}
                    onChange={(e) => updateCardProp("borderEffect", e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-white/5 rounded-xl outline-none"
                  >
                    <option value="none">Static Outline Border</option>
                    <option value="animated-gradient">Neon Rainbow Border</option>
                    <option value="breathing">Pulsing Glow Border</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-black/30 border border-white/5 rounded-xl">
                  <span className="text-xs font-semibold text-zinc-300">Apply floating hover drift</span>
                  <input
                    type="checkbox"
                    checked={config.card.floatingEffect}
                    onChange={(e) => updateCardProp("floatingEffect", e.target.checked)}
                    className="rounded border-white/10 text-pink-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeTab === "background" && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Background Layer</h3>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Wallpaper Type</label>
                  <select
                    value={config.background.type}
                    onChange={(e) => updateBgProp("type", e.target.value as BackgroundType)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-white/5 rounded-xl outline-none"
                  >
                    <option value="solid">Solid Color Background</option>
                    <option value="linear-gradient">Dual Linear Gradient</option>
                    <option value="animated-gradient">Animated Wave Gradient</option>
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
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </div>
            )}

            {activeTab === "particles" && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Canvas Particle Engine</h3>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Particle System Style</label>
                  <select
                    value={config.particles.type}
                    onChange={(e) => updateParticleProp("type", e.target.value as ParticleType)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-white/5 rounded-xl outline-none"
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
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
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
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </div>
            )}

            {activeTab === "typography" && (
              <div className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Typography Fonts</h3>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Font Style family</label>
                  <select
                    value={config.typography.fontFamily}
                    onChange={(e) => updateTypographyProp("fontFamily", e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-white/5 rounded-xl outline-none"
                  >
                    <option value="Geist Sans">Geist Sans (Clean)</option>
                    <option value="Outfit">Outfit (Round premium)</option>
                    <option value="Arial">Arial (System default)</option>
                    <option value="Courier New">Courier New (Matrix/Monospace)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Username Color Mode</label>
                  <select
                    value={config.typography.textEffect}
                    onChange={(e) => updateTypographyProp("textEffect", e.target.value)}
                    className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-white/5 rounded-xl outline-none"
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
              </div>
            )}

            {activeTab === "music" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Music player config</h3>

                <div className="flex items-center justify-between p-2.5 bg-black/30 border border-white/5 rounded-xl">
                  <span className="text-xs font-semibold text-zinc-300">Enable profile sound module</span>
                  <input
                    type="checkbox"
                    checked={config.mediaPlayer.enabled}
                    onChange={(e) => updateMusicProp("enabled", e.target.checked)}
                    className="rounded border-white/10 text-pink-500 cursor-pointer"
                  />
                </div>

                {config.mediaPlayer.enabled && (
                  <>
                    <div className="flex items-center justify-between p-2.5 bg-black/30 border border-white/5 rounded-xl">
                      <span className="text-xs font-semibold text-zinc-300">Autoplay on entry</span>
                      <input
                        type="checkbox"
                        checked={config.mediaPlayer.autoplay}
                        onChange={(e) => updateMusicProp("autoplay", e.target.checked)}
                        className="rounded border-white/10 text-pink-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Player Position</label>
                      <select
                        value={config.mediaPlayer.position}
                        onChange={(e) => updateMusicProp("position", e.target.value)}
                        className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-white/5 rounded-xl outline-none"
                      >
                        <option value="inside-card">Inside Card container</option>
                        <option value="top">Top float header</option>
                        <option value="bottom">Bottom footer float</option>
                        <option value="floating-left">Floating Left corner</option>
                        <option value="floating-right">Floating Right corner</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "links" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Social Links List</h3>
                {config.links.map((link) => (
                  <div key={link.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-wide">{link.platform}</span>
                      <input
                        type="checkbox"
                        checked={link.visible}
                        onChange={(e) => {
                          updateConfig((prev) => ({
                            ...prev,
                            links: prev.links.map((l) => l.id === link.id ? { ...l, visible: e.target.checked } : l)
                          }));
                        }}
                        className="rounded border-white/10 text-pink-500 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => {
                        updateConfig((prev) => ({
                          ...prev,
                          links: prev.links.map((l) => l.id === link.id ? { ...l, url: e.target.value } : l)
                        }));
                      }}
                      placeholder={`Enter ${link.platform} link`}
                      className="w-full px-3 py-1.5 text-xs text-white bg-black/50 border border-white/5 rounded-lg outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "badges" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Profile Badges</h3>
                {config.badges.map((b) => (
                  <div key={b.id} className="p-3.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">{b.name}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{b.tooltip}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={b.visible}
                      onChange={(e) => {
                        updateConfig((prev) => ({
                          ...prev,
                          badges: prev.badges.map((bd) => bd.id === b.id ? { ...bd, visible: e.target.checked } : bd)
                        }));
                      }}
                      className="rounded border-white/10 text-pink-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Preset Themes</h3>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => applyPreset("neon-pink")}
                    className="p-3 bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 text-pink-300 text-xs font-semibold rounded-xl text-left transition-colors flex items-center justify-between"
                  >
                    <span>Neon Pink Glow</span>
                    <Sparkles className="w-4 h-4 text-pink-400" />
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
            {/* Minimal simulation view of the profile background styles */}
            <ProfileView config={config} isPreview={true} />
          </div>
          
          {/* Subtle floating overlay tag */}
          <div className="absolute top-4 left-4 z-20 bg-zinc-950/80 border border-white/5 rounded-lg px-2.5 py-1 text-[10px] text-zinc-400 uppercase tracking-widest font-semibold backdrop-blur-md">
            Interactive Live Preview
          </div>
        </section>

      </div>
    </main>
  );
}
