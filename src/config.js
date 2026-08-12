const CONFIG = {
  discord: "https://discord.gg/alternate",
  games: [
    { name: "Da Track", details: "Custom skin changer and silent aim" },
    { name: "Hood Customs", details: "Skin changer support" }
  ],
  executors: [
    "Wave", "Synapse Z", "Macsploit", "Solara", "Sentinel"
  ],
  owner: {
    robloxId: "8393274455",
    robloxProfile: "https://www.roblox.com/users/8393274455/profile",
    links: [
      { label: "zyo.lol/swq", url: "https://zyo.lol/swq" },
      { label: "feds.lol/misanthropist", url: "https://feds.lol/misanthropist" },
      { label: "guns.lol/dreadfulness", url: "https://guns.lol/dreadfulness" }
    ]
  }
};

// Export config so it can be imported as a module or accessed globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}
