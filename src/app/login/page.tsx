"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, createUser } = useProfile();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
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

    if (isRegistering) {
      const success = await createUser(nameToAuth, "User");
      if (!success) {
        setErrorMsg("Username already exists or is reserved.");
        setLoading(false);
        return;
      }
    } else {
      const success = await login(nameToAuth, "User");
      if (!success) {
        setErrorMsg("Invalid username or password.");
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main className="w-full min-h-screen relative flex items-center justify-center bg-[#09090b] overflow-hidden p-6 select-none">
      {/* Background Grid */}
      <div className="absolute inset-0 checkerboard-grid opacity-20 pointer-events-none z-0" />

      {/* Glass Panel Box */}
      <div className="w-full max-w-sm glass-panel p-8 rounded-2xl border border-white/10 relative z-10 shadow-xl backdrop-blur-md">
        
        {/* Back Navigation Arrow */}
        <div className="absolute top-4 left-4">
          <Link href="/" className="text-zinc-500 hover:text-white transition-colors" title="Back to home">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center text-center mb-8">
          <h2 className="text-xl font-bold tracking-widest text-white uppercase">
            alternate.lol
          </h2>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
            {isRegistering ? "Register private linker" : "Authenticate identity"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/20 border border-red-950/40 text-red-400 text-xs rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1.5">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="username"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-black/40 border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold">.lol</span>
            </div>
          </div>

          <div>
            <label className="block text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-black/40 border border-white/10 focus:border-white/30 focus:outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : isRegistering ? "Register Linker" : "Authenticate"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400">
          {isRegistering ? "Existing linker?" : "Claim new linker?"}{" "}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg("");
            }}
            className="text-white hover:underline font-semibold transition-all"
          >
            {isRegistering ? "Sign in" : "Register"}
          </button>
        </div>
      </div>
    </main>
  );
}
