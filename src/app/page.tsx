"use client";

import Link from "next/link";
import { useProfile } from "@/context/ProfileContext";
import ProfileCard from "@/components/profile/ProfileCard";
import { Send, ArrowRight, Video, Sparkles, Link as LinkIcon } from "lucide-react";

export default function LandingPage() {
  const { config } = useProfile();

  return (
    <main className="w-full min-h-screen relative flex items-center justify-center bg-[#09090b] overflow-hidden p-6 md:p-12 select-none">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-full checkerboard-grid opacity-10 pointer-events-none z-0" />

      {/* Login / Dashboard floating action tags */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-30">
        <Link
          href="/login"
          className="px-4 py-2 text-xs font-semibold tracking-wider text-zinc-400 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-lg"
        >
          Login
        </Link>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-xs font-semibold tracking-wider bg-white text-black rounded-lg flex items-center gap-1 hover:bg-zinc-200 transition-colors"
        >
          Editor <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Main split-screen container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 relative">
        
        {/* Left Side: Product Intro */}
        <div className="flex flex-col text-left justify-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-1">
              alternate.lol
            </h1>
            <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              private linker
            </p>
          </div>

          {/* Social Platform Connections - simplified to just icons */}
          <div className="flex items-center gap-4 text-zinc-500">
            <a
              href="https://discord.gg/zuka"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              title="Discord"
            >
              <Send className="w-5 h-5 rotate-45" />
            </a>
            <a
              href="https://www.youtube.com/@koni683"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              title="YouTube"
            >
              <Video className="w-5 h-5" />
            </a>
            <a
              href="https://www.tiktok.com/@67fovkoni"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              title="TikTok"
            >
              <Sparkles className="w-4.5 h-4.5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              title="GitHub"
            >
              <LinkIcon className="w-5 h-5" />
            </a>
          </div>

          {/* Purchase details card panel */}
          <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Reserve your private linker
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Get instant access to deep customization options.</p>
              </div>
            </div>

            {/* Simulated discord status banner mockup */}
            <div className="p-3 bg-black/45 rounded-lg border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                  <Send className="w-4 h-4 text-white rotate-45" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Discord Linker Banner</div>
                  <div className="text-[10px] text-zinc-500">Includes active developer badge</div>
                </div>
              </div>
              <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded border border-white/20">
                LIFETIME
              </span>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
              <div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">Price</div>
                <div className="text-xl font-bold text-white mt-0.5">$10 <span className="text-xs text-zinc-500 font-normal">Lifetime Linker</span></div>
              </div>
              
              <a
                href="https://discord.gg/zuka"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
              >
                Purchase Linker <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Demo Profile Card */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="relative group">
            {/* Clean subtle white border hover effect */}
            <div className="absolute -inset-0.5 rounded-2xl bg-white/5 opacity-50 group-hover:opacity-100 transition duration-500 blur-md" />
            <ProfileCard config={config} isPreview={false} />
          </div>
        </div>

      </div>
    </main>
  );
}
