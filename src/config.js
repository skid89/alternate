const CONFIG = {
  // ─── Discord ────────────────────────────────────────────────
  discord: "https://discord.gg/alternate",
  discordInviteCode: "alternate",
  discordGuildId: "1389362677691846730",   // real guild ID for API

  // ─── Shop ───────────────────────────────────────────────────
  shopUrl: "https://aeri.mysellauth.com/",
  price: "$8",

  // ─── Supported Games ────────────────────────────────────────
  games: [
    {
      name: "Da Track",
      icon: "DT",
      details: "Custom skin changer & undetected silent aim.",
      tags: ["Skin Changer", "Silent Aim"]
    },
    {
      name: "Hood Customs",
      icon: "HC",
      details: "Full skin changer support for all weapons.",
      tags: ["Skin Changer"]
    }
  ],

  // ─── Supported Executors ────────────────────────────────────
  executors: ["real", "madium", "volt", "pottasium", "80+ UNC/SUNC"],

  // ─── Owner / Developer ──────────────────────────────────────
  owner: {
    name: "koni",
    role: "Founder & Lead Developer",
    robloxId: "8393274455",
    robloxProfile: "https://www.roblox.com/users/8393274455/profile",
    links: [
      { label: "zyo.lol/swq",              url: "https://zyo.lol/swq",              icon: "" },
      { label: "feds.lol/misanthropist",    url: "https://feds.lol/misanthropist",   icon: "" },
      { label: "guns.lol/dreadfulness",     url: "https://guns.lol/dreadfulness",    icon: "" }
    ]
  },

  // ─── Pricing ────────────────────────────────────────────────
  pricing: {
    name: "Lifetime Access",
    price: "$8",
    period: "one-time payment",
    badge: "Best Value",
    features: [
      "Undetected Silent Aim & Aimbot",
      "Full Skin & Skybox Changer",
        "Supported Executors: real, madium, volt, pottasium, 80+ UNC/SUNC",
  offsetsViewerUrl: "https://offsets.imtheo.lol/"
};

window.CONFIG = CONFIG;
