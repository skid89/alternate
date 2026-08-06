"use client";

import Link from "next/link";
import { useProfile } from "@/context/ProfileContext";
import ProfileCard from "@/components/profile/ProfileCard";
import { Send, ShieldAlert, Sparkles, Gem, ArrowRight, Video } from "lucide-react";

export default function LandingPage() {
  const { config } = useProfile();

  return (
    <main className="w-full min-h-screen relative flex items-center justify-center bg-[#030014] overflow-hidden p-6 md:p-12 select-none">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-full checkerboard-grid opacity-20 pointer-events-none z-0" />

      {/* Login / Dashboard floating action tags */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-30">
        <Link
          href="/login"
          className="px-4 py-2 text-xs font-semibold tracking-wider text-zinc-400 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-xl"
        >
          Login
        </Link>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-xs font-semibold tracking-wider bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl flex items-center gap-1 hover:opacity-90 transition-opacity"
        >
          Editor <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main split-screen container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 relative">
        
        {/* Left Side: Product Intro and Purchase Panel */}
        <div className="flex flex-col text-left justify-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-2">
              alternate.lol
            </h1>
            <p className="text-sm font-semibold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 uppercase">
              private linker
            </p>
          </div>

          {/* Social Platform Connections */}
          <div className="flex items-center gap-4 text-zinc-400">
            <a
              href="https://discord.gg/zuka"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold hover:text-[#5865F2] transition-colors"
            >
              <Send className="w-4 h-4 fill-current rotate-45" /> discord.gg/zuka
            </a>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <a
              href="https://www.youtube.com/@koni683"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold hover:text-[#FF0000] transition-colors"
            >
              <Video className="w-4 h-4 fill-current" /> @koni683
            </a>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <a
              href="https://www.tiktok.com/@67fovkoni"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold hover:text-cyan-400 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> @67fovkoni
            </a>
          </div>

          {/* Purchase details card panel */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col gap-4 shadow-xl">
            {/* Glossy lighting overlay */}
            <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <Gem className="w-4.5 h-4.5 text-pink-500" /> Reserve your private linker
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Get instant access to deep customization options.</p>
              </div>
            </div>

            {/* Simulated discord status banner mockup */}
            <div className="p-3 bg-black/45 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-600/40 flex items-center justify-center">
                  <Send className="w-4 h-4 text-purple-400 rotate-45" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Discord Linker Banner</div>
                  <div className="text-[10px] text-zinc-500">Includes active developer badge</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                LIFETIME
              </span>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
              <div>
                <div className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Price</div>
                <div className="text-2xl font-bold text-white mt-0.5">$10 <span className="text-xs text-zinc-400 font-normal">Lifetime Linker</span></div>
              </div>
              
              <a
                href="https://discord.gg/zuka"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_#ff007f80] transition-all duration-300 hover:scale-[1.02] flex items-center gap-1.5 animate-pulse"
              >
                Purchase Linker <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Tilt Parallax Demo Profile Card */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="relative group">
            {/* Colored background halo */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 opacity-20 blur-2xl group-hover:opacity-30 transition duration-1000" />
            <ProfileCard config={config} isPreview={false} />
          </div>
        </div>

      </div>
    </main>
  );
}
