"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import { Send, Mail, Lock, ShieldCheck, Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, createUser } = useProfile();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Owner" | "Admin" | "Moderator" | "Staff" | "Alpha" | "Beta" | "Premium" | "User">("User");
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      if (isRegistering) {
        // Mock register
        if (!username) {
          setErrorMsg("Username is required");
          setLoading(false);
          return;
        }
        const success = createUser(username, role);
        if (!success) {
          setErrorMsg("Username already exists or is reserved.");
          setLoading(false);
          return;
        }
        login(username, role);
      } else {
        // Mock login
        // If username input matches an existing account, context logs them in.
        // Otherwise we check/create them or log them in with requested role.
        const nameToLogin = username || "koni";
        login(nameToLogin, role);
      }
      setLoading(false);
      router.push("/dashboard");
    }, 1200);
  };

  const handleDiscordLogin = () => {
    setLoading(true);
    setTimeout(() => {
      login("koni683", "Premium");
      setLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <main className="w-full min-h-screen relative flex items-center justify-center bg-[#030014] overflow-hidden p-4 select-none">
      {/* Moving Checkerboard Grid Background */}
      <div className="absolute inset-0 checkerboard-grid opacity-30 pointer-events-none z-0" />
      
      {/* Dynamic Glowing Halos */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-pink-500/10 blur-[100px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Frosted Glass Login Box */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 relative z-10 shadow-2xl backdrop-blur-xl relative">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
        
        {/* Animated Brand Header */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(255,0,127,0.3)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-widest text-white">
            alternate.lol
          </h2>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
            {isRegistering ? "Create your linker identity" : "Enter the gateway"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="e.g. koni"
                className="w-full px-4 py-3 rounded-xl text-sm text-white glass-input outline-none"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold">.lol</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-4 py-3 rounded-xl text-sm text-white glass-input outline-none"
                required={isRegistering}
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm text-white glass-input outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role selector dropdown to test multiple login modes */}
          <div>
            <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1.5">Simulate Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl text-sm text-white glass-input outline-none appearance-none cursor-pointer bg-zinc-950"
            >
              <option value="Owner">Owner (Full admin controls)</option>
              <option value="Admin">Admin</option>
              <option value="Moderator">Moderator</option>
              <option value="Staff">Staff</option>
              <option value="Alpha">Alpha Tester</option>
              <option value="Beta">Beta Tester</option>
              <option value="Premium">Premium Lifetime Linker</option>
              <option value="User">Regular User</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/10 bg-black/40 text-pink-500 focus:ring-0 cursor-pointer"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => alert("Password recovery: Mock code sent to your email!")}
              className="text-xs text-pink-500 hover:text-pink-400 transition-colors"
            >
              Recovery?
            </button>
          </div>

          {/* Glowing Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_#ff007f80] transition-all duration-300 disabled:opacity-50 hover:scale-[1.01]"
          >
            {loading ? "Decrypting..." : isRegistering ? "Register Linker" : "Authenticate"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <span className="relative z-10 px-3 bg-[#0c0a0f] text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Or OAuth</span>
        </div>

        {/* Discord OAuth Mock Login Button */}
        <button
          onClick={handleDiscordLogin}
          disabled={loading}
          className="w-full py-3.5 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Send className="w-4 h-4 fill-current rotate-45" /> Discord Gateway
        </button>

        {/* Footer switch registration mode */}
        <div className="mt-6 text-center text-xs text-zinc-400">
          {isRegistering ? "Existing account?" : "No reservation?"}{" "}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-pink-500 hover:text-pink-400 font-semibold transition-colors"
          >
            {isRegistering ? "Sign in instead" : "Claim your slot"}
          </button>
        </div>

      </div>
    </main>
  );
}
