const CONFIG = {
  discord: "https://discord.gg/alternate",
  discordInviteCode: "alternate", // Used for the banner invite call
  games: [
    { name: "Da Track", details: "Custom skin changer and silent aim support." },
    { name: "Hood Customs", details: "Dedicated skin changer support." }
  ],
  executors: [
    "Wave", "Synapse Z", "Macsploit", "Solara", "Sentinel", "Sirhurt"
  ],
  owner: {
    robloxId: "8393274455",
    robloxProfile: "https://www.roblox.com/users/8393274455/profile",
    links: [
      { label: "zyo.lol/swq", url: "https://zyo.lol/swq" },
      { label: "feds.lol/misanthropist", url: "https://feds.lol/misanthropist" },
      { label: "guns.lol/dreadfulness", url: "https://guns.lol/dreadfulness" }
    ]
  },
  team: [
    { name: "koni", role: "Founder & Lead Developer", robloxId: "8393274455" },
    { name: "theo", role: "Offset Analyst & Core Contributor", robloxId: "17205" } // standard developer or core helper id
  ],
  pricing: [
    {
      name: "Lifetime Access",
      price: "$10.00",
      period: "one-time payment",
      features: [
        "Undetected Silent Aim & Aimbot",
        "Full Skin & Skybox Changer",
        "Compatible with all Executors",
        "Direct Support & Discord Role",
        "Future Updates Included"
      ],
      link: "https://discord.gg/alternate",
      popular: true
    }
  ]
};

// Export config so it can be imported as a module or accessed globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}
