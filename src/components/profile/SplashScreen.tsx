"use client";

import React, { useState } from "react";
import { SplashConfig } from "@/types/profile";
import { motion, AnimatePresence } from "framer-motion";
import { VolumeX, Volume2 } from "lucide-react";

interface SplashScreenProps {
  config: SplashConfig;
  onEnter: () => void;
}

export default function SplashScreen({ config, onEnter }: SplashScreenProps) {
  const [isEntered, setIsEntered] = useState(false);
  const [muted, setMuted] = useState(false);

  const handleEnterClick = () => {
    setIsEntered(true);
    
    // Play sound if configured
    if (config.enterSoundUrl && !muted) {
      const audio = new Audio(config.enterSoundUrl);
      audio.volume = 0.5;
      audio.play().catch((err) => console.log("Audio autoplay prevented", err));
    }
    
    // Notify parent page to start visual/particle engines
    setTimeout(() => {
      onEnter();
    }, (config.fadeSpeed || 0.8) * 1000);
  };

  if (!config.enabled) return null;

  return (
    <AnimatePresence>
      {!isEntered && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: "blur(20px)"
          }}
          transition={{ duration: config.fadeSpeed || 0.8, ease: "easeInOut" }}
          className="fixed inset-0 w-full h-full flex flex-col items-center justify-center z-50 overflow-hidden cursor-pointer select-none"
          style={{
            backgroundColor: config.backgroundColor || "#030014e6",
            backdropFilter: `blur(${config.glassBlur || 20}px)`,
            WebkitBackdropFilter: `blur(${config.glassBlur || 20}px)`,
          }}
          onClick={handleEnterClick}
        >
          {/* Subtle Ambient Glow behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-pink-500/10 blur-[100px] pointer-events-none" />

          {/* Sound Preview Indicator Toggles */}
          {config.enterSoundUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMuted(!muted);
              }}
              className="absolute top-6 right-6 p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all duration-300"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          {/* Click to enter HUD */}
          <div className="flex flex-col items-center justify-center text-center px-4 relative z-10">
            {/* Logo Text */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500"
              style={{
                textShadow: config.pulseEffect ? "0 0 30px rgba(255, 0, 127, 0.2)" : "none"
              }}
            >
              {config.text || "alternate.lol"}
            </motion.h1>

            {/* Click to enter subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.3, 1, 0.3],
              }}
              transition={{ 
                opacity: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                },
                default: { duration: 0.6, delay: 0.3 }
              }}
              className="mt-6 text-sm font-medium tracking-widest text-zinc-400 uppercase"
            >
              {config.subtitle || "[ click to enter ]"}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
