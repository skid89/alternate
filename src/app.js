document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIG ACCESS ---
  const config = window.CONFIG || {
    discord: "https://discord.gg/alternate",
    discordInviteCode: "alternate",
    games: [
      { name: "Da Track", details: "Custom skin changer and silent aim support." },
      { name: "Hood Customs", details: "Dedicated skin changer support." }
    ],
    executors: ["Wave", "Synapse Z", "Macsploit", "Solara", "Sentinel", "Sirhurt"],
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
      { name: "koni", role: "Founder & Lead Developer", robloxId: "8393274455" }
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

  // --- ELEMENT REFERENCES ---
  const customCursor     = document.getElementById("custom-cursor");
  const customCursorDot = document.getElementById("custom-cursor-dot");
  const startupScreen   = document.getElementById("startup-screen");
  const revealBtn       = document.getElementById("reveal-btn");
  const revealText      = document.getElementById("reveal-text");
  const mainContent     = document.getElementById("main-content");
  const guiCard         = document.getElementById("gui-card");

  // Nav tabs
  const tabFeaturesBtn = document.getElementById("tab-features");
  const tabInfoBtn     = document.getElementById("tab-info");
  const tabPricingBtn  = document.getElementById("tab-pricing");
  const tabDiscordBtn  = document.getElementById("tab-discord");

  // Modals
  const modalFeatures = document.getElementById("modal-features");
  const modalInfo     = document.getElementById("modal-info");
  const modalPricing  = document.getElementById("modal-pricing");
  const modalDiscord  = document.getElementById("modal-discord");

  // Features elements
  const featuresLoader      = document.getElementById("features-loader");
  const featuresSubContent  = document.getElementById("features-subtab-content");
  const featuresTabsNav     = document.getElementById("features-tabs-nav");

  // Info elements
  const gamesList     = document.getElementById("games-list");
  const executorsList = document.getElementById("executors-list");
  const teamList      = document.getElementById("team-list");
  const ownerAvatar   = document.getElementById("owner-avatar");
  const ownerDName    = document.getElementById("owner-display-name");
  const ownerUname    = document.getElementById("owner-username");
  const ownerId       = document.getElementById("owner-id");
  const ownerCreated  = document.getElementById("owner-created");
  const ownerLinks    = document.getElementById("owner-links");

  // Roblox version elements
  const rbxClientVersion = document.getElementById("rbx-client-version");
  const rbxDumperVersion = document.getElementById("rbx-dumper-version");
  const rbxDumpDate      = document.getElementById("rbx-dump-date");
  const rbxOffsetCount   = document.getElementById("rbx-offset-count");

  // Pricing elements
  const pricingPlans = document.getElementById("pricing-plans");

  // Discord card elements
  const discordJoinBtn = document.getElementById("discord-join-btn");
  const discordCopyBtn = document.getElementById("discord-copy-btn");

  // =============================================
  // CUSTOM CURSOR + DAMPED PARALLAX SYSTEM
  // =============================================
  let mouse        = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let dampedMouse  = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;

  function updateCursor() {
    dampedMouse.x += (mouse.x - dampedMouse.x) * 0.12;
    dampedMouse.y += (mouse.y - dampedMouse.y) * 0.12;
    customCursor.style.left    = `${dampedMouse.x}px`;
    customCursor.style.top     = `${dampedMouse.y}px`;
    customCursorDot.style.left = `${mouse.x}px`;
    customCursorDot.style.top  = `${mouse.y}px`;

    currentRotX += (targetRotX - currentRotX) * 0.08;
    currentRotY += (targetRotY - currentRotY) * 0.08;

    if (guiCard) {
      guiCard.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
    }
    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (guiCard) {
      const r   = guiCard.getBoundingClientRect();
      const dx  = (e.clientX - (r.left + r.width / 2))  / (window.innerWidth  / 2);
      const dy  = (e.clientY - (r.top  + r.height / 2)) / (window.innerHeight / 2);
      targetRotX = -dy * 10;
      targetRotY =  dx * 10;
    }
  });

  const addHover    = () => document.body.classList.add("cursor-hover");
  const removeHover = () => document.body.classList.remove("cursor-hover");

  function refreshCursorHovers() {
    document.querySelectorAll("a, button, input, .control").forEach(el => {
      el.removeEventListener("mouseenter", addHover);
      el.removeEventListener("mouseleave", removeHover);
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", removeHover);
    });
  }
  refreshCursorHovers();

  // =============================================
  // INTERACTIVE TILE BACKGROUND CANVAS
  // =============================================
  const canvas = document.getElementById("grid-canvas");
  const ctx    = canvas.getContext("2d");
  const CELL   = 50;
  let cols, rows, gridCells = [];

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.ceil(canvas.width  / CELL);
    rows = Math.ceil(canvas.height / CELL);
    gridCells = [];
    for (let c = 0; c < cols; c++) {
      gridCells[c] = [];
      for (let r = 0; r < rows; r++) gridCells[c][r] = 0;
    }
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const aC = Math.floor(mouse.x / CELL);
    const aR = Math.floor(mouse.y / CELL);

    if (aC >= 0 && aC < cols && aR >= 0 && aR < rows) {
      gridCells[aC][aR] = 1.0;
      [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dc, dr]) => {
        const nc = aC + dc, nr = aR + dr;
        if (nc >= 0 && nc < cols && nr >= 0 && nr < rows)
          gridCells[nc][nr] = Math.max(gridCells[nc][nr], 0.35);
      });
    }

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const v = gridCells[c][r];
        if (v > 0.01) {
          ctx.fillStyle = `rgba(255,105,180,${v * 0.13})`;
          ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
          gridCells[c][r] *= 0.93;
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.016)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 0; c <= cols; c++) { ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, canvas.height); }
    for (let r = 0; r <= rows; r++) { ctx.moveTo(0, r * CELL); ctx.lineTo(canvas.width, r * CELL); }
    ctx.stroke();

    // Spotlight glow
    const grad = ctx.createRadialGradient(dampedMouse.x, dampedMouse.y, 10, dampedMouse.x, dampedMouse.y, 220);
    grad.addColorStop(0, "rgba(255,105,180,0.065)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(drawCanvas);
  }
  requestAnimationFrame(drawCanvas);

  // =============================================
  // STARTUP REVEAL ANIMATION
  // =============================================
  if (revealBtn) {
    revealBtn.addEventListener("click", () => {
      revealText.classList.remove("hidden");
      setTimeout(() => revealText.classList.add("show"), 50);

      revealBtn.style.transition = "transform 0.8s cubic-bezier(0.34,1.56,0.64,1), opacity 0.6s ease";
      revealBtn.style.transform  = "scale(0.7) rotate(360deg)";
      revealBtn.style.opacity    = "0";
      revealBtn.style.pointerEvents = "none";

      setTimeout(() => {
        startupScreen.style.opacity    = "0";
        startupScreen.style.visibility = "hidden";
        mainContent.classList.remove("hidden-main");
        setTimeout(refreshCursorHovers, 300);
      }, 1500);
    });
  }

  // =============================================
  // MODAL HELPERS
  // =============================================
  function openModal(modal) {
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
    modal.classList.add("active");
    refreshCursorHovers();
  }

  function closeAllModals() {
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
  }

  // Close on overlay click or 'X' button
  document.querySelectorAll(".modal-close, .modal-overlay").forEach(el => {
    el.addEventListener("click", closeAllModals);
  });

  window.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAllModals();
  });

  // =============================================
  // TAB BUTTON ACTIONS
  // =============================================
  if (tabFeaturesBtn) tabFeaturesBtn.addEventListener("click", () => {
    openModal(modalFeatures);
    loadFeatures();
  });

  if (tabInfoBtn) tabInfoBtn.addEventListener("click", () => {
    openModal(modalInfo);
    loadInfoSection();
  });

  if (tabPricingBtn) tabPricingBtn.addEventListener("click", () => {
    openModal(modalPricing);
    renderPricing();
  });

  if (tabDiscordBtn) tabDiscordBtn.addEventListener("click", () => {
    openModal(modalDiscord);
  });

  // Discord card buttons
  if (discordJoinBtn) discordJoinBtn.addEventListener("click", () => {
    window.open(config.discord, "_blank");
  });

  if (discordCopyBtn) discordCopyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(config.discord).then(() => {
      discordCopyBtn.textContent = "Copied!";
      setTimeout(() => { discordCopyBtn.textContent = "Copy Invite Link"; }, 2000);
    }).catch(() => {
      discordCopyBtn.textContent = "Failed";
      setTimeout(() => { discordCopyBtn.textContent = "Copy Invite Link"; }, 2000);
    });
  });

  // =============================================
  // ACCORDION TOGGLES (Info Modal)
  // =============================================
  document.querySelectorAll(".accordion-trigger").forEach(trigger => {
    trigger.addEventListener("click", () => {
      const content = trigger.nextElementSibling;
      const isOpen  = content.classList.contains("show");

      // Close all first
      document.querySelectorAll(".accordion-content").forEach(c => c.classList.remove("show"));
      document.querySelectorAll(".accordion-trigger").forEach(t => t.classList.remove("active"));

      // Toggle clicked one
      if (!isOpen) {
        content.classList.add("show");
        trigger.classList.add("active");
      }
    });
  });

  // =============================================
  // PRICING RENDER
  // =============================================
  let pricingRendered = false;
  function renderPricing() {
    if (pricingRendered) return;
    pricingRendered = true;
    pricingPlans.innerHTML = "";

    config.pricing.forEach(plan => {
      const card = document.createElement("div");
      card.className = "pricing-card";

      if (plan.popular) {
        const badge = document.createElement("div");
        badge.className = "pricing-popular-badge";
        badge.textContent = "Most Popular";
        card.appendChild(badge);
      }

      const title = document.createElement("h3");
      title.textContent = plan.name;
      card.appendChild(title);

      const priceWrap = document.createElement("div");
      priceWrap.className = "pricing-price-container";
      priceWrap.innerHTML = `<span class="pricing-amount">${plan.price}</span><span class="pricing-period">${plan.period}</span>`;
      card.appendChild(priceWrap);

      const ul = document.createElement("ul");
      ul.className = "pricing-features-list";
      plan.features.forEach(f => {
        const li = document.createElement("li");
        li.textContent = f;
        ul.appendChild(li);
      });
      card.appendChild(ul);

      const btn = document.createElement("button");
      btn.className = "pricing-action-btn";
      btn.textContent = "Get Access";
      btn.addEventListener("click", () => window.open(plan.link, "_blank"));
      card.appendChild(btn);

      pricingPlans.appendChild(card);
    });

    refreshCursorHovers();
  }

  // =============================================
  // FEATURES PARSER FROM script.txt WITH SUBTABS
  // =============================================
  let featuresLoaded = false;
  let allCategories  = {};
  let activeTab      = null;

  function loadFeatures() {
    if (featuresLoaded) return;
    fetch("script.txt")
      .then(r => { if (!r.ok) throw new Error("404"); return r.text(); })
      .then(text => parseAndRenderFeatures(text))
      .catch(() => parseAndRenderFeatures(getFallbackFeatures()));
  }

  function parseAndRenderFeatures(text) {
    featuresLoader.style.display = "none";
    featuresTabsNav.innerHTML    = "";
    featuresSubContent.innerHTML = "";
    allCategories = {};

    const lines = text.split("\n");
    let currentCat = null;

    lines.forEach(line => {
      const t = line.trim();
      if (!t) return;
      if (t.startsWith("[") && t.endsWith("]")) {
        currentCat = t.slice(1, -1);
        allCategories[currentCat] = [];
      } else if (currentCat && (t.startsWith("-") || t.startsWith("*"))) {
        allCategories[currentCat].push(t.substring(1).trim());
      }
    });

    // Build subtab buttons
    const cats = Object.keys(allCategories);
    cats.forEach((cat, idx) => {
      const btn = document.createElement("button");
      btn.className   = "features-tab-btn" + (idx === 0 ? " active" : "");
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".features-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        showCategoryPanel(cat);
      });
      featuresTabsNav.appendChild(btn);
    });

    // Show first category by default
    if (cats.length > 0) showCategoryPanel(cats[0]);
    featuresLoaded = true;
    refreshCursorHovers();
  }

  function showCategoryPanel(cat) {
    activeTab = cat;
    const items = allCategories[cat] || [];
    featuresSubContent.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "features-subtab-grid";

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "feature-item-card";
      card.innerHTML = `<span class="feature-item-dot"></span><span class="feature-item-text">${item}</span>`;
      grid.appendChild(card);
    });

    featuresSubContent.appendChild(grid);
    refreshCursorHovers();
  }

  function getFallbackFeatures() {
    return `[Aimbot]
- Enabled
- Lock Method (Mouse, Camera)
- Target Mode (FOV, Mouse, Distance, Center)
- Sticky Aim
- Lock Target
- Smoothing / Inertia
- Prediction (X/Z, Y, Dynamic)
[Silent Aim]
- Enabled
- Target Type (Closest to Mouse, Distance, FOV)
- Hit Part (Head, Torso)
[Visuals (ESP)]
- Enable ESP
- Box ESP
- Name ESP
- Health Bar
[Skins]
- Purple Skin
- Red Skin
- Green Skin
- Blue Skin
[Skyboxes]
- Space
- Night
- Pink
- Forest`;
  }

  // =============================================
  // INFO SECTION RENDER
  // =============================================
  let infoLoaded = false;

  function loadInfoSection() {
    if (infoLoaded) return;
    infoLoaded = true;

    // Games
    if (gamesList) {
      gamesList.innerHTML = "";
      config.games.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card";
        card.innerHTML = `<h4>${game.name}</h4><p>${game.details}</p>`;
        gamesList.appendChild(card);
      });
    }

    // Executors
    if (executorsList) {
      executorsList.innerHTML = "";
      config.executors.forEach(exec => {
        const badge = document.createElement("span");
        badge.className   = "executor-badge";
        badge.textContent = exec;
        executorsList.appendChild(badge);
      });
    }

    // Team cards
    if (teamList) {
      teamList.innerHTML = "";
      config.team.forEach(member => {
        const card     = document.createElement("div");
        card.className = "team-card";

        const avatarUrl = `https://tr.rbxcdn.com/30DAY-Avatar-${member.robloxId}-Png/420/420/Avatar/Png/noFilter`;
        const fallbackAvatar = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${member.robloxId}&size=150x150&format=Png&isCircular=false`;

        card.innerHTML = `
          <img src="" alt="${member.name}" class="team-card-avatar" data-robloxid="${member.robloxId}">
          <div class="team-card-info">
            <h4>${member.name}</h4>
            <span class="role-badge">${member.role}</span>
          </div>`;
        teamList.appendChild(card);

        // Fetch avatar for team member
        fetchAvatarForImg(card.querySelector("img"), member.robloxId);
      });
    }

    // Owner links
    if (ownerLinks) {
      ownerLinks.innerHTML = "";
      config.owner.links.forEach(link => {
        const a   = document.createElement("a");
        a.className = "owner-link-btn";
        a.href    = link.url;
        a.target  = "_blank";
        a.textContent = link.label;
        ownerLinks.appendChild(a);
      });
    }

    // Fetch Roblox profile for owner
    fetchOwnerProfile(config.owner.robloxId);

    // Fetch live imtheo.lol offsets data
    fetchRobloxOffsets();

    refreshCursorHovers();
  }

  function fetchAvatarForImg(imgEl, userId) {
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`)}`;
    fetch(proxyUrl)
      .then(r => r.json())
      .then(json => {
        if (json.data && json.data[0] && json.data[0].imageUrl) {
          imgEl.src = json.data[0].imageUrl;
        }
      })
      .catch(() => {
        imgEl.src = `https://tr.rbxcdn.com/30DAY-Avatar-8768D4231D32EF9CBC674A5265D71B79-Png/420/420/Avatar/Png/noFilter`;
      });
  }

  function fetchOwnerProfile(userId) {
    // Load avatar full body shot
    const avatarProxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`)}`;
    fetch(avatarProxyUrl)
      .then(r => r.json())
      .then(json => {
        if (json.data && json.data[0] && json.data[0].imageUrl && ownerAvatar) {
          ownerAvatar.src = json.data[0].imageUrl;
        }
      })
      .catch(() => {
        if (ownerAvatar) ownerAvatar.src = "https://tr.rbxcdn.com/30DAY-Avatar-8768D4231D32EF9CBC674A5265D71B79-Png/420/420/Avatar/Png/noFilter";
      });

    // Load profile data
    const profileProxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(`https://users.roblox.com/v1/users/${userId}`)}`;
    fetch(profileProxyUrl)
      .then(r => { if (!r.ok) throw new Error("Proxy error"); return r.json(); })
      .then(profile => renderOwnerProfile(profile))
      .catch(() => renderOwnerProfile({ displayName: "koni", name: "5fovtraceboss", id: userId, created: "2025-05-01T04:15:20.162Z" }));
  }

  function renderOwnerProfile(p) {
    if (ownerDName)   ownerDName.textContent  = p.displayName || "koni";
    if (ownerUname)   ownerUname.textContent  = `@${p.name || "5fovtraceboss"}`;
    if (ownerId)      ownerId.textContent     = p.id || "8393274455";
    if (ownerCreated && p.created) {
      const d = new Date(p.created);
      ownerCreated.textContent = d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
    }
    refreshCursorHovers();
  }

  // =============================================
  // LIVE ROBLOX OFFSET API (imtheo.lol)
  // =============================================
  function fetchRobloxOffsets() {
    if (!rbxClientVersion) return;

    const OFFSETS_URL  = "https://offsets.imtheo.lol/Offsets.json";
    const PROXY_URL    = `https://corsproxy.io/?url=${encodeURIComponent(OFFSETS_URL)}`;

    fetch(PROXY_URL)
      .then(r => { if (!r.ok) throw new Error("Proxy fail"); return r.json(); })
      .then(data => {
        rbxClientVersion.textContent = data["Roblox Version"] || "Unknown";
        rbxDumperVersion.textContent = `${data["Dumper Version"] || "?"} (${data["Dumped With"] || "Unknown"})`;
        rbxDumpDate.textContent      = data["Dumped At"] || "Unknown";
        rbxOffsetCount.textContent   = (data["Total Offsets"] || "?") + " offsets";
      })
      .catch(() => {
        // Direct fetch attempt (may fail due to CORS on browser)
        fetch(OFFSETS_URL, { mode: "cors" })
          .then(r => r.json())
          .then(data => {
            rbxClientVersion.textContent = data["Roblox Version"] || "Unknown";
            rbxDumperVersion.textContent = data["Dumper Version"] || "Unknown";
            rbxDumpDate.textContent      = data["Dumped At"]  || "Unknown";
            rbxOffsetCount.textContent   = (data["Total Offsets"] || "?") + " offsets";
          })
          .catch(() => {
            rbxClientVersion.textContent = "version-d584fb6c717a43d9";
            rbxDumperVersion.textContent = "2.1.7 (RbxDumperV2)";
            rbxDumpDate.textContent      = "01:04 06/08/2026";
            rbxOffsetCount.textContent   = "388 offsets";
          });
      });
  }

});
