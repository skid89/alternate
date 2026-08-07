"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Lock, Loader2 } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useProfile();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const nameToAuth = username.trim().toLowerCase();
    if (!nameToAuth) {
      setErrorMsg("Username is required");
      setLoading(false);
      return;
    }

    const success = await login(nameToAuth, "User");
    if (!success) {
      setErrorMsg("Invalid username or password.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main className="w-full min-h-screen relative flex items-center justify-center bg-black overflow-hidden p-6 select-none">
      {/* Background Subtle Dot Grid Grid */}
      <div className="absolute inset-0 checkerboard-grid opacity-10 pointer-events-none z-0" />
      
      {/* Absolute center ambient highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-white/[0.03] blur-[80px] pointer-events-none z-0" />

      {/* Elegant Box */}
      <div className="w-full max-w-sm bg-zinc-950/80 border border-zinc-800/80 p-8 rounded-2xl relative z-10 shadow-2xl backdrop-blur-xl flex flex-col">
        
        {/* Back Link */}
        <div className="absolute top-5 left-5">
          <Link href="/" className="text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-1 text-[11px] font-medium" title="Back to home">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center text-center mt-4 mb-8">
          <h2 className="text-2xl font-bold tracking-widest text-white uppercase">
            alternate
          </h2>
          <span className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase mt-1">
            Private Identity Portal
          </span>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-xl text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="username"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl text-xs text-white bg-zinc-900/60 border border-zinc-800 focus:border-zinc-500 focus:outline-none transition-colors placeholder:text-zinc-600"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-semibold select-none">.lol</span>
            </div>
          </div>

          <div>
            <label className="block text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white bg-zinc-900/60 border border-zinc-800 focus:border-zinc-500 focus:outline-none transition-colors placeholder:text-zinc-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Authenticating...
              </>
            ) : (
              "Authenticate"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-zinc-600 font-medium">
            Protected link space. Contact administrator to request invite credentials.
          </p>
        </div>
      </div>
    </main>
  );
}
