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
  config: FullProfileConfig;
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
  createUser: (username: string, role: UserAccount["role"]) => boolean;
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
  login: (username: string, role: UserAccount["role"]) => void;
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
  
  // Session / Multi-user mockup state
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: UserAccount["role"] } | null>({
    username: "koni",
    role: "Owner",
  });
  
  // Admin globals
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string>("Welcome to alternate.lol private linker platform!");
  const [reservedNames, setReservedNames] = useState<string[]>(["admin", "system", "alternate", "login", "dashboard", "owner"]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "1", action: "System Init", details: "alternate.lol system started successfully.", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [activeViewUsername, setActiveViewUsername] = useState<string>("koni");

  // Load from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem("alternate_users");
    const savedConfig = localStorage.getItem("alternate_active_config");
    const savedMaintenance = localStorage.getItem("alternate_maintenance");
    const savedAnnouncement = localStorage.getItem("alternate_announcement");
    const savedReserves = localStorage.getItem("alternate_reserved_names");
    const savedLogs = localStorage.getItem("alternate_audit_logs");
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const initialUsers: UserAccount[] = [
        { username: "koni", role: "Owner", config: DEFAULT_PROFILE_CONFIG },
        { username: "zuka", role: "Admin", config: { ...DEFAULT_PROFILE_CONFIG, username: "zuka", bio: "alternate.lol admin. link reserved." } }
      ];
      setUsers(initialUsers);
      localStorage.setItem("alternate_users", JSON.stringify(initialUsers));
    }
    
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    if (savedMaintenance) {
      setMaintenanceMode(JSON.parse(savedMaintenance));
    }
    if (savedAnnouncement) {
      setAnnouncement(savedAnnouncement);
    }
    if (savedReserves) {
      setReservedNames(JSON.parse(savedReserves));
    }
    if (savedLogs) {
      setAuditLogs(JSON.parse(savedLogs));
    }
  }, []);

  // Sync state to local storage and active user's config
  const updateConfig = (updater: (prev: FullProfileConfig) => FullProfileConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      
      // Push previous to history
      setHistory((h) => [...h, prev].slice(-20)); // Limit to last 20 states
      setRedoHistory([]); // Clear redo
      
      // Save active config
      localStorage.setItem("alternate_active_config", JSON.stringify(next));
      
      // Update in global users list
      setUsers((uList) => {
        const updated = uList.map((u) => {
          if (u.username === next.username) {
            return { ...u, config: next };
          }
          return u;
        });
        localStorage.setItem("alternate_users", JSON.stringify(updated));
        return updated;
      });
      
      return next;
    });
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setRedoHistory((r) => [...r, config]);
    setConfig(prev);
    localStorage.setItem("alternate_active_config", JSON.stringify(prev));
  };

  const redo = () => {
    if (redoHistory.length === 0) return;
    const next = redoHistory[redoHistory.length - 1];
    setRedoHistory((r) => r.slice(0, -1));
    setHistory((h) => [...h, config]);
    setConfig(next);
    localStorage.setItem("alternate_active_config", JSON.stringify(next));
  };

  const resetConfig = () => {
    updateConfig(() => DEFAULT_PROFILE_CONFIG);
    addAuditLog("Reset Configuration", `Reverted config for ${config.username} to system default.`);
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

  const createUser = (username: string, role: UserAccount["role"]): boolean => {
    const formattedName = username.trim().toLowerCase();
    if (!formattedName) return false;
    
    // Check duplication & reservation
    if (users.some((u) => u.username === formattedName) || reservedNames.includes(formattedName)) {
      return false;
    }

    const newUserConfig: FullProfileConfig = {
      ...DEFAULT_PROFILE_CONFIG,
      username: formattedName,
      bio: `Hello! I am a proud ${role} of alternate.lol`,
    };

    setUsers((prev) => {
      const next = [...prev, { username: formattedName, role, config: newUserConfig }];
      localStorage.setItem("alternate_users", JSON.stringify(next));
      return next;
    });
    
    addAuditLog("Create User", `Created user ${formattedName} with role ${role}.`);
    return true;
  };

  const deleteUser = (username: string) => {
    setUsers((prev) => {
      const next = prev.filter((u) => u.username !== username);
      localStorage.setItem("alternate_users", JSON.stringify(next));
      return next;
    });
    addAuditLog("Delete User", `Deleted user ${username}.`);
  };

  const updateUserRole = (username: string, role: UserAccount["role"]) => {
    setUsers((prev) => {
      const next = prev.map((u) => (u.username === username ? { ...u, role } : u));
      localStorage.setItem("alternate_users", JSON.stringify(next));
      return next;
    });
    addAuditLog("Modify User Role", `Updated role for ${username} to ${role}.`);
  };

  const addReservedName = (name: string) => {
    const formatted = name.trim().toLowerCase();
    if (!formatted || reservedNames.includes(formatted)) return;
    setReservedNames((prev) => {
      const next = [...prev, formatted];
      localStorage.setItem("alternate_reserved_names", JSON.stringify(next));
      return next;
    });
    addAuditLog("Reserve Username", `Added username '${formatted}' to reserved names.`);
  };

  const removeReservedName = (name: string) => {
    setReservedNames((prev) => {
      const next = prev.filter((n) => n !== name);
      localStorage.setItem("alternate_reserved_names", JSON.stringify(next));
      return next;
    });
    addAuditLog("Release Username", `Removed username '${name}' from reserved list.`);
  };

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(),
      action,
      details,
      timestamp: new Date().toLocaleTimeString(),
    };
    setAuditLogs((prev) => {
      const next = [newLog, ...prev].slice(0, 100);
      localStorage.setItem("alternate_audit_logs", JSON.stringify(next));
      return next;
    });
  };

  const login = (username: string, role: UserAccount["role"]) => {
    setCurrentUser({ username, role });
    // If the logging-in user exists, load their config
    const targetUser = users.find((u) => u.username === username);
    if (targetUser) {
      setConfig(targetUser.config);
      localStorage.setItem("alternate_active_config", JSON.stringify(targetUser.config));
    }
    addAuditLog("User Login", `User ${username} logged in as ${role}.`);
  };

  const logout = () => {
    setCurrentUser(null);
    addAuditLog("User Logout", "Current user logged out.");
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
        setMaintenanceMode: (enabled) => {
          setMaintenanceMode(enabled);
          localStorage.setItem("alternate_maintenance", JSON.stringify(enabled));
          addAuditLog("Toggle Maintenance Mode", `Maintenance mode set to ${enabled}.`);
        },
        announcement,
        setAnnouncement: (text) => {
          setAnnouncement(text);
          localStorage.setItem("alternate_announcement", text);
          addAuditLog("Update Announcement", `Banner announcement updated: "${text}".`);
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
