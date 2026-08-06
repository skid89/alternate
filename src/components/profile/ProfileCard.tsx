"use client";

import React, { useRef, useState } from "react";
import { FullProfileConfig } from "@/types/profile";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import * as Icons from "lucide-react";
import MediaPlayer from "./MediaPlayer";

interface ProfileCardProps {
  config: FullProfileConfig;
  isPreview?: boolean;
}

// Helper to resolve Lucide React icons dynamically by name, incorporating custom brand SVG paths
const DynamicIcon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const norm = name.toLowerCase().trim();
  if (norm === "discord") {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 2.855a.07.07 0 0 0-.05.025C.66 7.398-.2 11.826.048 16.201a.08.08 0 0 0 .03.056c2.11 1.56 4.148 2.511 6.149 3.136a.077.077 0 0 0 .085-.027c.472-.647.89-1.348 1.25-2.09a.077.077 0 0 0-.041-.106c-.66-.25-1.29-.563-1.898-.928a.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127c-.608.365-1.239.678-1.899.928a.077.077 0 0 0-.041.106c.36.74.778 1.442 1.25 2.09a.077.077 0 0 0 .085.028c2.01-.625 4.05-1.577 6.15-3.137a.078.078 0 0 0 .032-.054c.5-5.047-.838-9.432-3.545-13.348a.066.066 0 0 0-.05-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.156-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.955 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.156-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.156 2.418z"/>
      </svg>
    );
  }
  if (norm === "youtube") {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.393 12 3.393 12 3.393s-7.52 0-9.388.508c-1.037.281-1.85 1.094-2.11 2.108C0 8.04 0 12 0 12s0 3.96.502 5.837c.28 1.03.1.85 2.11 2.108C4.48 20.607 12 20.607 12 20.607s7.52 0 9.388-.508c1.037-.282 1.85-1.095 2.11-2.108C24 15.96 24 12 24 12s0-3.96-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  if (norm === "tiktok") {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02c.08 1.53.63 3.09 1.75 4.17c1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97c-.57-.26-1.1-.59-1.59-1c-.01 2.62.02 5.24-.01 7.86c-.03 1.93-.72 3.86-2.15 5.15c-1.49 1.31-3.6 1.95-5.59 1.73c-2-.17-3.92-1.26-5.06-2.93c-1.2-1.72-1.44-4.05-.72-6c.63-1.79 2.19-3.21 4.07-3.68c.9-.22 1.84-.21 2.76-.02v4.3c-.66-.18-1.39-.14-2.02.13c-.84.34-1.46 1.12-1.63 2.01c-.24 1.19.34 2.51 1.42 3.03c1.01.5 2.3.26 3.05-.59c.56-.6.82-1.42.8-2.22c.01-4.29.01-8.58.01-12.87z"/>
      </svg>
    );
  }
  if (norm === "spotify") {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.378 0 0 5.378 0 12s5.378 12 12 12s12-5.378 12-12S18.622 0 12 0zm5.503 17.31c-.22.357-.687.473-1.039.256c-2.86-1.748-6.46-2.143-10.7-1.178c-.407.094-.814-.165-.908-.571c-.094-.407.165-.814.571-.908c4.636-1.056 8.62-.6 11.8 1.34c.35.218.47.682.25 1.037zm1.47-3.262c-.276.452-.865.595-1.317.318c-3.273-2.01-8.263-2.597-12.13-1.422c-.506.154-1.04-.136-1.194-.643c-.154-.506.137-1.04.643-1.194c4.42-1.34 9.91-.684 13.68 1.633c.45.277.6.866.32 1.31zm.126-3.414c-3.922-2.33-10.38-2.546-14.13-1.408c-.602.183-1.242-.152-1.424-.754c-.183-.602.152-1.242.754-1.424c4.32-1.312 11.45-1.066 15.98 1.62c.54.32.72 1.02.4 1.56c-.31.53-1.01.71-1.55.4z"/>
      </svg>
    );
  }
  if (norm === "github") {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385c.6.11.82-.26.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    );
  }
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} style={style} />;
};

export default function ProfileCard({ config, isPreview = false }: ProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Parallax calculations using framer-motion useMotionValue & springs
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-300, 300], [8, -8]), { damping: 25, stiffness: 200 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-8, 8]), { damping: 25, stiffness: 200 });

  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative coordinate from card center
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setTooltipText(null);
  };

  // Helper for badge tooltips
  const handleBadgeHover = (e: React.MouseEvent, text: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipText(text);
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 35,
    });
  };

  // CSS fonts mapper
  const fontStyle = {
    fontFamily: config.typography.fontFamily,
    fontWeight: config.typography.fontWeight,
  };

  // Resolve outline borders and effects
  let borderClass = "";
  if (config.card.borderEffect === "rgb-rainbow") {
    borderClass = "rainbow-glow-border";
  } else if (config.card.borderEffect === "breathing") {
    borderClass = "breathing-glow-border";
  }

  const borderStyles = {
    borderRadius: `${config.card.borderRadius}px`,
    borderWidth: `${config.card.outlineThickness}px`,
    borderColor: config.card.borderEffect === "none" ? config.card.outlineColor : "transparent",
    borderStyle: config.card.borderStyle,
    boxShadow: config.card.dropShadow 
      ? `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 ${config.card.glowStrength}px ${config.card.glowColor}1a`
      : "none",
  };

  return (
    <div style={fontStyle} className="relative select-none">
      {/* Floating Badge Tooltip HUD */}
      {tooltipText && (
        <div
          className="fixed z-[999] px-2 py-1 bg-black border border-white/15 text-white text-[10px] tracking-wide rounded pointer-events-none transform -translate-x-1/2 transition-opacity duration-150 shadow-lg backdrop-blur-sm"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          {tooltipText}
        </div>
      )}

      {/* Tilt Parallax Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: isPreview ? 0 : rotateX,
          rotateY: isPreview ? 0 : rotateY,
          width: `${config.card.width}px`,
          maxWidth: "100%",
          scale: config.card.scale,
          ...borderStyles,
        }}
        className={`w-full flex flex-col relative overflow-hidden transition-all duration-300 p-6 ${borderClass} ${
          config.card.floatingEffect ? "floating-effect" : ""
        }`}
      >
        {/* Dynamic Card Background Engine */}
        <div
          className="absolute inset-0 z-0 pointer-events-none transition-all duration-300"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${config.card.backgroundOpacity})`,
            backdropFilter: `blur(${config.card.glassBlur}px)`,
            WebkitBackdropFilter: `blur(${config.card.glassBlur}px)`,
          }}
        />

        {/* Grain overlay */}
        {config.card.backgroundGrain && <div className="grain-overlay z-0" />}
        {config.card.backgroundNoise && <div className="noise-overlay z-0" />}

        {/* Shiny lighting reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Profile Picture */}
          <div className="relative mb-4 group">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
              <img
                src={config.discord.enabled && config.discord.mockStatus.avatarUrl ? config.discord.mockStatus.avatarUrl : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60"}
                alt={config.username}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Discord online presence indicator badge */}
            {config.discord.enabled && (
              <span
                className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-zinc-950 flex items-center justify-center`}
                style={{
                  backgroundColor: 
                    config.discord.mockStatus.status === "online" ? "#22c55e" :
                    config.discord.mockStatus.status === "idle" ? "#eab308" :
                    config.discord.mockStatus.status === "dnd" ? "#ef4444" : "#71717a"
                }}
              />
            )}
          </div>

          {/* Username & Badges Row (Badges next to username instead of top) */}
          <div className="flex items-center justify-center gap-1.5 mb-1 flex-wrap">
            <h2
              className={`text-xl font-bold tracking-wide transition-all`}
              style={{
                color: config.typography.textEffect === "none" ? config.typography.usernameColor : "transparent",
                backgroundImage: config.typography.textEffect === "gradient" 
                  ? `linear-gradient(to right, ${config.typography.textGradientColor1}, ${config.typography.textGradientColor2})`
                  : config.typography.textEffect === "rainbow"
                  ? `linear-gradient(to right, #ffffff, #a1a1aa, #ffffff)`
                  : "none",
                WebkitBackgroundClip: config.typography.textEffect !== "none" ? "text" : "unset",
                backgroundClip: config.typography.textEffect !== "none" ? "text" : "unset",
              }}
            >
              {config.username}
            </h2>

            {/* Badges inline beside username */}
            {config.badges && config.badges.filter(b => b.visible).length > 0 && (
              <div className="flex items-center gap-1">
                {config.badges
                  .filter((b) => b.visible)
                  .map((b) => (
                    <motion.div
                      key={b.id}
                      onMouseEnter={(e) => handleBadgeHover(e, b.tooltip)}
                      onMouseLeave={() => setTooltipText(null)}
                      whileHover={{ scale: 1.1 }}
                      className="cursor-help flex items-center justify-center p-0.5"
                    >
                      <DynamicIcon name={b.icon} className="w-3.5 h-3.5" style={{ color: "#ffffff" }} />
                    </motion.div>
                  ))}
              </div>
            )}
          </div>

          {/* Subtitle / Pronouns */}
          <span 
            className="text-[10px] tracking-wider text-zinc-500 uppercase"
            style={{ color: config.typography.subtitleColor }}
          >
            {config.discord.enabled ? "@" + config.discord.mockStatus.username : "alternate.lol user"}
          </span>

          {/* Bio text */}
          <p
            className="mt-3 text-xs max-w-sm"
            style={{
              color: config.typography.bioColor,
              opacity: config.typography.descriptionOpacity,
            }}
          >
            {config.bio}
          </p>

          {/* Discord Mock Presence Status Widgets */}
          {config.discord.enabled && (
            <div className="w-full mt-4 p-3 bg-black/40 rounded-xl border border-white/5 text-left flex flex-col gap-2 backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Discord Activity</span>
              </div>
              
              <div className="flex items-start gap-3">
                <img
                  src={config.discord.mockStatus.spotifyAlbumUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60"}
                  alt="Activity Icon"
                  className="w-8 h-8 rounded object-cover border border-white/5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold truncate text-white">
                    Listening to {config.discord.mockStatus.spotifySong || "Sunset Chords"}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
                    by {config.discord.mockStatus.spotifyArtist || "Lofi Beats"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Links List */}
          {config.links.filter(l => l.visible).length > 0 && (
            <div className="w-full mt-5 flex justify-center flex-wrap gap-3">
              {config.links
                .filter((l) => l.visible)
                .map((l) => (
                  <motion.a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center"
                  >
                    <DynamicIcon name={l.platform} className="w-4 h-4 text-white" />
                  </motion.a>
                ))}
            </div>
          )}

          {/* Embedded Media Player inside profile card */}
          {config.mediaPlayer.enabled && config.mediaPlayer.position === "inside-card" && (
            <div className="w-full mt-5">
              <MediaPlayer config={config.mediaPlayer} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
