"use client";

import React, { useState, useEffect } from "react";
import { FullProfileConfig } from "@/types/profile";
import ParticleCanvas from "./ParticleCanvas";
import CursorEngine from "./CursorEngine";
import MediaPlayer from "./MediaPlayer";
import SplashScreen from "./SplashScreen";
import ProfileCard from "./ProfileCard";

interface ProfileViewProps {
  config: FullProfileConfig;
  isPreview?: boolean;
  showDiscordActivity?: boolean;
}

export default function ProfileView({ config, isPreview = false, showDiscordActivity = false }: ProfileViewProps) {
  const [showProfile, setShowProfile] = useState(!config.splash.enabled || isPreview);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Background style compiler
  const getBackgroundStyle = () => {
    const bg = config.background;
    const filter = `brightness(${bg.brightness}%) saturation(${bg.saturation}%) contrast(${bg.contrast}%) blur(${bg.blur}px)`;
    
    let style: React.CSSProperties = {
      filter,
      opacity: bg.opacity,
    };

    if (bg.type === "solid") {
      style.backgroundColor = bg.color1;
    } else if (bg.type === "linear-gradient") {
      style.backgroundImage = `linear-gradient(135deg, ${bg.color1}, ${bg.color2})`;
    } else if (bg.type === "radial-gradient") {
      style.backgroundImage = `radial-gradient(circle, ${bg.color1}, ${bg.color2}, ${bg.color3})`;
    } else if (bg.type === "animated-gradient") {
      // Dynamic linear keyframes using CSS variables or simple styling
      style.backgroundImage = `linear-gradient(-45deg, ${bg.color1}, ${bg.color2}, ${bg.color3}, ${bg.color1})`;
      style.backgroundSize = "400% 400%";
      // Inject standard slow animation
      style.animation = "moveGrid 12s ease infinite";
    }

    return style;
  };

  // Layout template wrapper
  const renderLayout = () => {
    const layout = config.card.layout;

    if (layout === "sidebar-layout") {
      return (
        <div className="w-full min-h-screen flex flex-col md:flex-row items-center justify-between p-6 md:p-12 z-20 gap-8 relative">
          <div className="flex-1 max-w-md">
            <ProfileCard config={config} isPreview={isPreview} showDiscordActivity={showDiscordActivity} />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            {config.mediaPlayer.enabled && config.mediaPlayer.position !== "inside-card" && (
              <div className="w-full max-w-sm">
                <MediaPlayer config={config.mediaPlayer} />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (layout === "fullscreen-layout") {
      return (
        <div className="w-full min-h-screen flex items-center justify-center p-4 z-20 relative">
          <div className="w-full max-w-4xl glass-panel p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl backdrop-blur-2xl">
            <div className="flex-1 flex justify-center">
              <ProfileCard config={config} isPreview={isPreview} showDiscordActivity={showDiscordActivity} />
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <h3 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                Listening & Interactions
              </h3>
              {config.mediaPlayer.enabled && (
                <MediaPlayer config={config.mediaPlayer} />
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default centered & floating cards
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 z-20 relative gap-6">
        <ProfileCard config={config} isPreview={isPreview} showDiscordActivity={showDiscordActivity} />
        
        {/* Floating MediaPlayer layout triggers */}
        {config.mediaPlayer.enabled && config.mediaPlayer.position !== "inside-card" && (
          <div 
            className={`w-full max-w-sm transition-all duration-300 ${
              config.mediaPlayer.position === "top" ? "absolute top-6 left-1/2 -translate-x-1/2" :
              config.mediaPlayer.position === "bottom" ? "absolute bottom-6 left-1/2 -translate-x-1/2" :
              config.mediaPlayer.position === "floating-left" ? "fixed bottom-6 left-6" :
              "fixed bottom-6 right-6" // floating-right
            }`}
          >
            <MediaPlayer config={config.mediaPlayer} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex flex-col justify-center">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-500"
        style={getBackgroundStyle()}
      />

      {/* Dark overlay multiplier */}
      <div 
        className="absolute inset-0 z-1 pointer-events-none transition-all duration-500"
        style={{
          backgroundColor: config.background.overlayColor,
          opacity: config.background.overlayOpacity,
        }}
      />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 z-2 checkerboard-grid opacity-30 pointer-events-none" />

      {/* Interactive mouse background glow */}
      {!isPreview && (
        <div
          className="absolute w-[450px] h-[450px] rounded-full pointer-events-none z-1 blur-[110px] transition-transform duration-500 ease-out opacity-60"
          style={{
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
            left: 0,
            top: 0,
            transform: `translate3d(${mousePos.x - 225}px, ${mousePos.y - 225}px, 0)`,
          }}
        />
      )}

      {/* Splash click screen */}
      <SplashScreen config={config.splash} onEnter={() => setShowProfile(true)} />

      {showProfile && (
        <>
          {/* Particle Effects Canvas */}
          <ParticleCanvas config={config.particles} />

          {/* Interactive Mouse Trails and custom cursor */}
          {!isPreview && <CursorEngine config={config.cursor} />}

          {/* Layout renders */}
          {renderLayout()}
        </>
      )}
    </div>
  );
}
