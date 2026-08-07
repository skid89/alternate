"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { FullProfileConfig } from "@/types/profile";
import { DEFAULT_PROFILE_CONFIG, PRESET_THEMES } from "@/utils/defaultConfig";

interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

interface UserAccount {
  username: string;
  role: "Owner" | "Admin" | "Moderator" | "Staff" | "Alpha" | "Beta" | "Premium" | "User";
  config?: FullProfileConfig;
}

interface ProfileContextType {
  config: FullProfileConfig;
  updateConfig: (updater: (prev: FullProfileConfig) => FullProfileConfig) => void;
  undo: () => void;
  redo: () => void;
  resetConfig: () => void;
  applyPreset: (name: string) => void;
  
  // User Manager
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  createUser: (username: string, role: UserAccount["role"], password?: string) => Promise<boolean>;
  deleteUser: (username: string) => void;
  updateUserRole: (username: string, role: UserAccount["role"]) => void;
  
  // Admin Settings
  maintenanceMode: boolean;
  setMaintenanceMode: (enabled: boolean) => void;
  announcement: string;
  setAnnouncement: (text: string) => void;
  reservedNames: string[];
  addReservedName: (name: string) => void;
  removeReservedName: (name: string) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string) => void;
  
  // Auth state
  currentUser: { username: string; role: UserAccount["role"] } | null;
  login: (username: string, role: UserAccount["role"]) => Promise<boolean>;
  logout: () => void;
  
  // Navigation utility
  activeViewUsername: string;
  setActiveViewUsername: (username: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<FullProfileConfig>(DEFAULT_PROFILE_CONFIG);
  const [history, setHistory] = useState<FullProfileConfig[]>([]);
  const [redoHistory, setRedoHistory] = useState<FullProfileConfig[]>([]);
  
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: UserAccount["role"] } | null>(null);
  
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string>("");
  const [reservedNames, setReservedNames] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeViewUsername, setActiveViewUsername] = useState<string>("koni");

  // Load from API on mount
  const loadData = async () => {
    try {
      // 1. Check current session
      const authRes = await fetch("/api/auth");
      const authData = await authRes.json();
      if (authData.authenticated && authData.user) {
        setCurrentUser({ username: authData.user.username, role: authData.user.role });
        setConfig(authData.user.config);
      }

      // 2. Fetch admin / global settings
      const adminRes = await fetch("/api/admin");
      const adminData = await adminRes.json();
      if (!adminRes.ok) return;

      setMaintenanceMode(adminData.maintenanceMode);
      setAnnouncement(adminData.announcement);
      setReservedNames(adminData.reservedNames);
      setAuditLogs(adminData.auditLogs);
      setUsers(adminData.users);
    } catch (e) {
      console.error("Failed to load initial backend configurations", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync state to backend
  const updateConfig = async (updater: (prev: FullProfileConfig) => FullProfileConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      setHistory((h) => [...h, prev].slice(-20));
      setRedoHistory([]);

      // Non-blocking save to backend
      fetch(`/api/profile/${next.username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: next }),
      }).catch(err => console.error("Error saving config to API:", err));

      return next;
    });
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setRedoHistory((r) => [...r, config]);
    setConfig(prev);

    fetch(`/api/profile/${prev.username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: prev }),
    }).catch(err => console.error("Error saving config to API:", err));
  };

  const redo = () => {
    if (redoHistory.length === 0) return;
    const next = redoHistory[redoHistory.length - 1];
    setRedoHistory((r) => r.slice(0, -1));
    setHistory((h) => [...h, config]);
    setConfig(next);

    fetch(`/api/profile/${next.username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: next }),
    }).catch(err => console.error("Error saving config to API:", err));
  };

  const resetConfig = () => {
    updateConfig(() => DEFAULT_PROFILE_CONFIG);
    addAuditLog("Reset Configuration", `Reverted config for ${config.username} to default.`);
  };

  const applyPreset = (name: string) => {
    const preset = PRESET_THEMES[name];
    if (!preset) return;
    updateConfig((prev) => ({
      ...prev,
      card: { ...prev.card, ...preset.card },
      background: { ...prev.background, ...preset.background },
      particles: { ...prev.particles, ...preset.particles },
    }));
    addAuditLog("Apply Preset", `Applied theme preset ${name} to ${config.username}'s profile.`);
  };

  const createUser = async (username: string, role: UserAccount["role"], password?: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", username, role, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to register");
        return false;
      }
      setCurrentUser({ username: data.user.username, role: data.user.role });
      setConfig(data.user.config);
      loadData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteUser = async (username: string) => {
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteUser", username }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateUserRole = async (username: string, role: UserAccount["role"]) => {
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateUserRole", username, role }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const addReservedName = async (name: string) => {
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addReservedName", value: name }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const removeReservedName = async (name: string) => {
    try {
      await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeReservedName", value: name }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const addAuditLog = (action: string, details: string) => {
    // In a real application, audit logging is done on the server when mutation APIs are hit.
    // The logs are fetched from the server.
  };

  const login = async (username: string, role: UserAccount["role"]): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to login");
        return false;
      }
      setCurrentUser({ username: data.user.username, role: data.user.role });
      setConfig(data.user.config);
      loadData();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      setCurrentUser(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        config,
        updateConfig,
        undo,
        redo,
        resetConfig,
        applyPreset,
        users,
        setUsers,
        createUser,
        deleteUser,
        updateUserRole,
        maintenanceMode,
        setMaintenanceMode: async (enabled) => {
          try {
            await fetch("/api/admin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "setMaintenanceMode", value: enabled }),
            });
            loadData();
          } catch (e) {
            console.error(e);
          }
        },
        announcement,
        setAnnouncement: async (text) => {
          try {
            await fetch("/api/admin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "setAnnouncement", value: text }),
            });
            loadData();
          } catch (e) {
            console.error(e);
          }
        },
        reservedNames,
        addReservedName,
        removeReservedName,
        auditLogs,
        addAuditLog,
        currentUser,
        login,
        logout,
        activeViewUsername,
        setActiveViewUsername,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
