"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/context/ProfileContext";
import {
  ShieldAlert, UserPlus, Trash2, ShieldCheck, ArrowLeft, ToggleLeft,
  ToggleRight, MessageSquare, ListFilter, Calendar, Clock, AlertTriangle
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const {
    users, createUser, deleteUser, updateUserRole,
    maintenanceMode, setMaintenanceMode,
    announcement, setAnnouncement,
    reservedNames, addReservedName, removeReservedName,
    auditLogs, currentUser
  } = useProfile();

  const [newUsername, setNewUsername] = useState("");
  const [newUserRole, setNewUserRole] = useState<"Owner" | "Admin" | "Moderator" | "Staff" | "Alpha" | "Beta" | "Premium" | "User">("User");
  
  const [newReserved, setNewReserved] = useState("");
  const [bannerText, setBannerText] = useState(announcement);

  // If user is not authorized, redirect them
  const isAuthorized = currentUser && (currentUser.role === "Owner" || currentUser.role === "Admin");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername) return;
    const success = await createUser(newUsername, newUserRole);
    if (success) {
      setNewUsername("");
      alert(`User ${newUsername} created successfully with role ${newUserRole}!`);
    } else {
      alert(`Failed to create user. Name might be taken or reserved.`);
    }
  };

  const handleAddReserved = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReserved) return;
    addReservedName(newReserved);
    setNewReserved("");
  };

  const handleUpdateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncement(bannerText);
    alert("Global announcement banner updated!");
  };

  if (!isAuthorized) {
    return (
      <main className="w-full min-h-screen bg-[#07050e] text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-md">
          You must be logged in as an Owner or Admin to view this panel.
        </p>
        <Link href="/dashboard" className="mt-6 px-4 py-2 bg-pink-500 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-pink-600 transition-colors">
          Return to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-[#07050e] text-white flex flex-col select-none">
      
      {/* Admin header */}
      <header className="h-16 border-b border-white/5 bg-zinc-950/40 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Back to dashboard">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="h-4 w-[1px] bg-zinc-800" />
          <h2 className="text-sm font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 uppercase flex items-center gap-1.5">
            <ShieldAlert className="w-4.5 h-4.5 text-pink-500" /> Admin Command Center
          </h2>
        </div>
        <div className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20">
          Root Access: {currentUser?.username}
        </div>
      </header>

      {/* Grid panels layout */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Left Column: User Management Controls */}
        <div className="flex flex-col gap-6">
          
          {/* User Creator Box */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-purple-400" /> Create Platform Profile
            </h3>
            
            <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                  placeholder="e.g. zyo"
                  className="w-full px-3 py-2 text-xs text-white bg-black/40 border border-white/5 rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Initial Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs text-white bg-zinc-950 border border-white/5 rounded-xl outline-none cursor-pointer"
                >
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Staff">Staff</option>
                  <option value="Alpha">Alpha Tester</option>
                  <option value="Beta">Beta Tester</option>
                  <option value="Premium">Premium Lifetime</option>
                  <option value="User">Regular User</option>
                </select>
              </div>

              <button type="submit" className="w-full mt-2 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:opacity-95 transition-opacity">
                Register User Profile
              </button>
            </form>
          </div>

          {/* Reserved Names Management */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
              <ListFilter className="w-4 h-4 text-pink-400" /> Reserved Usernames
            </h3>
            
            <form onSubmit={handleAddReserved} className="flex gap-2">
              <input
                type="text"
                value={newReserved}
                onChange={(e) => setNewReserved(e.target.value.toLowerCase())}
                placeholder="e.g. system"
                className="flex-1 px-3 py-2 text-xs text-white bg-black/40 border border-white/5 rounded-xl outline-none"
                required
              />
              <button type="submit" className="px-4 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-xl transition-colors">
                Add
              </button>
            </form>

            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pt-2">
              {reservedNames.map((name) => (
                <span key={name} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-semibold text-zinc-300 flex items-center gap-1.5">
                  {name}
                  <button onClick={() => removeReservedName(name)} className="text-red-400 hover:text-red-300">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Center Column: Global Maintenance & Announcement */}
        <div className="flex flex-col gap-6">
          
          {/* Maintenance Mode & Announcement */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-5">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
              Global Platform Toggles
            </h3>

            {/* Maintenance Mode Switch */}
            <div className="flex items-center justify-between p-3 bg-black/45 rounded-xl border border-white/5">
              <div>
                <div className="text-xs font-semibold text-white">Maintenance Toggles</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Locks editor access for regular users</div>
              </div>
              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="text-pink-500 hover:scale-105 transition-transform"
              >
                {maintenanceMode ? (
                  <ToggleRight className="w-8 h-8 text-pink-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-zinc-500" />
                )}
              </button>
            </div>

            {/* Announcement Banner Content */}
            <form onSubmit={handleUpdateBanner} className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Global Banner Announcement</label>
                <input
                  type="text"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-white bg-black/40 border border-white/5 rounded-xl outline-none"
                  required
                />
              </div>
              <button type="submit" className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-xl transition-colors">
                Publish Announcement
              </button>
            </form>
          </div>

          {/* User Account Registry List */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4 flex-1">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-cyan-400" /> Account Registry ({users.length})
            </h3>
            
            <div className="flex flex-col gap-2 overflow-y-auto max-h-80 pr-1">
              {users.map((user) => (
                <div key={user.username} className="p-3 bg-black/35 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">/{user.username}</span>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{user.role}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Promote / Demote select */}
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.username, e.target.value as any)}
                      className="px-2 py-1 bg-zinc-900 border border-white/5 rounded text-[10px] text-zinc-300 outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Staff">Staff</option>
                      <option value="Alpha">Alpha</option>
                      <option value="Beta">Beta</option>
                      <option value="Premium">Premium</option>
                      <option value="User">User</option>
                    </select>

                    {/* Disable deleting owner account */}
                    {user.role !== "Owner" && (
                      <button
                        onClick={() => deleteUser(user.username)}
                        className="p-1 hover:bg-red-500/10 rounded text-red-400 hover:text-red-300 transition-colors"
                        title="Delete profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Live Audit Logs */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-yellow-400" /> Administrative Audit Log
          </h3>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 max-h-[500px]">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-black/45 border border-white/5 rounded-xl flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between font-bold text-white">
                  <span>{log.action}</span>
                  <span className="text-[9px] text-zinc-500 font-normal">{log.timestamp}</span>
                </div>
                <p className="text-zinc-400 mt-1 leading-relaxed">{log.details}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
