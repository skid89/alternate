/* ═══════════════════════════════════════════════════════════
   ALTERNATE — app.js  (full redo)
═══════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const C = window.CONFIG;

  /* ─── ELEMENT REFS ──────────────────────────────────── */
  const cursorRing   = document.getElementById("cursor-ring");
  const cursorDot    = document.getElementById("cursor-dot");
  const canvas       = document.getElementById("grid-canvas");
  const ctx          = canvas.getContext("2d");

  const startupScr   = document.getElementById("startup-screen");
  const introGun     = document.getElementById("intro-gun");
  const introTextWrap= document.getElementById("intro-text-wrap");
  const introSub     = document.getElementById("intro-sub");
  const mainContent  = document.getElementById("main-content");
  const guiCard      = document.getElementById("gui-card");

  const heroBuyBtn   = document.getElementById("hero-buy-btn");
  const heroDiscBtn  = document.getElementById("hero-discord-btn");

  /* ═══════════════════════════════════════════════════════
     CURSOR  (damped ring + instant dot)
  ═══════════════════════════════════════════════════════ */
  let mouse  = { x: innerWidth / 2, y: innerHeight / 2 };
  let damped = { x: innerWidth / 2, y: innerHeight / 2 };
  let tRX = 0, tRY = 0, cRX = 0, cRY = 0;

  window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (guiCard) {
      const r = guiCard.getBoundingClientRect();
      tRX = -((e.clientY - r.top  - r.height / 2) / r.height) * 12;
      tRY =  ((e.clientX - r.left - r.width  / 2) / r.width)  * 12;
    }
  });

  function refreshHovers() {
    document.querySelectorAll("a, button, .acc-trigger, .feat-tab-btn").forEach(el => {
      el.onmouseenter = () => document.body.classList.add("hovered");
      el.onmouseleave = () => document.body.classList.remove("hovered");
    });
  }

  function animateCursor() {
    damped.x += (mouse.x - damped.x) * 0.14;
    damped.y += (mouse.y - damped.y) * 0.14;
    cRX += (tRX - cRX) * 0.09;
    cRY += (tRY - cRY) * 0.09;

    cursorRing.style.left = `${damped.x}px`;
    cursorRing.style.top  = `${damped.y}px`;
    cursorDot.style.left  = `${mouse.x}px`;
    cursorDot.style.top   = `${mouse.y}px`;

    if (guiCard) {
      guiCard.style.transform = `rotateX(${cRX}deg) rotateY(${cRY}deg)`;
    }
    requestAnimationFrame(animateCursor);
  }
  requestAnimationFrame(animateCursor);

  /* ═══════════════════════════════════════════════════════
     GRID CANVAS  (interactive pink tile glow)
  ═══════════════════════════════════════════════════════ */
  const CELL = 48;
  let cols, rows, cells = [];

  function resizeCanvas() {
    canvas.width  = innerWidth;
    canvas.height = innerHeight;
    cols = Math.ceil(canvas.width  / CELL) + 1;
    rows = Math.ceil(canvas.height / CELL) + 1;
    cells = Array.from({ length: cols }, () => new Float32Array(rows));
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.018)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 0; c <= cols; c++) { ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, canvas.height); }
    for (let r = 0; r <= rows; r++) { ctx.moveTo(0, r * CELL); ctx.lineTo(canvas.width, r * CELL); }
    ctx.stroke();

    // Hover glow tiles
    const mc = Math.floor(mouse.x / CELL);
    const mr = Math.floor(mouse.y / CELL);
    const spread = [[0,0,1],[1,0,.35],[-1,0,.35],[0,1,.35],[0,-1,.35],[1,1,.15],[-1,1,.15],[1,-1,.15],[-1,-1,.15]];
    spread.forEach(([dc, dr, v]) => {
      const nc = mc + dc, nr = mr + dr;
      if (nc >= 0 && nc < cols && nr >= 0 && nr < rows)
        cells[nc][nr] = Math.max(cells[nc][nr], v);
    });

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const v = cells[c][r];
        if (v > 0.005) {
          ctx.fillStyle = `rgba(255,79,163,${v * 0.12})`;
          ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
          cells[c][r] *= 0.92;
        }
      }
    }

    // Mouse spotlight
    const grd = ctx.createRadialGradient(damped.x, damped.y, 0, damped.x, damped.y, 240);
    grd.addColorStop(0, "rgba(255,79,163,0.055)");
    grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(drawCanvas);
  }
  requestAnimationFrame(drawCanvas);

  /* ═══════════════════════════════════════════════════════
     INTRO ANIMATION
     Phase 1: gun.png spins in from right → center (0.8s)
     Phase 2: gun holds for 0.5s (sub hint fades in)
     Phase 3: gun slides off to left (0.6s)
     Phase 4: /alternate text fades in (0.5s)
     Phase 5: waits 1.2s then startup fades out, main fades in

     Click anywhere skips straight to phase 4 fast
  ═══════════════════════════════════════════════════════ */
  let introDone = false;

  function runIntroPhase1() {
    // Spin in from right
    introGun.style.transition = "transform 0.9s cubic-bezier(0.34,1.46,0.64,1), opacity 0.5s ease";
    introGun.style.transform  = "translateX(0) rotate(360deg)";
    introGun.style.opacity    = "1";
  }

  function runIntroPhase2() {
    // Slide to left
    introSub.style.display = "none";
    introGun.style.transition = "transform 0.55s cubic-bezier(0.6,0,0.4,1), opacity 0.4s ease";
    introGun.style.transform  = "translateX(-130vw) rotate(720deg)";
    introGun.style.opacity    = "0";
  }

  function runIntroPhase3() {
    // Reveal text
    introTextWrap.style.transition = "opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.46,0.64,1)";
    introTextWrap.style.opacity    = "1";
    introTextWrap.style.transform  = "scale(1)";
  }

  function completeIntro() {
    if (introDone) return;
    introDone = true;
    startupScr.classList.add("fade-out");
    setTimeout(() => {
      startupScr.style.display = "none";
      mainContent.classList.remove("hidden-main");
      mainContent.classList.add("visible");
      refreshHovers();
    }, 700);
  }

  // Initial state for text wrap
  introTextWrap.style.opacity   = "0";
  introTextWrap.style.transform = "scale(0.95)";

  // Timeline
  setTimeout(runIntroPhase1, 120);
  setTimeout(runIntroPhase2, 1300);
  setTimeout(runIntroPhase3, 2000);
  setTimeout(completeIntro, 3500);

  // Click to skip
  startupScr.addEventListener("click", () => {
    if (introDone) return;
    // Fast skip: hide gun, show text briefly, then complete
    introGun.style.transition = "opacity 0.15s";
    introGun.style.opacity    = "0";
    introSub.style.display    = "none";
    introTextWrap.style.transition = "opacity 0.3s ease";
    introTextWrap.style.opacity    = "1";
    introTextWrap.style.transform  = "scale(1)";
    setTimeout(completeIntro, 500);
  });

  /* ═══════════════════════════════════════════════════════
     HERO BUTTONS
  ═══════════════════════════════════════════════════════ */
  if (heroBuyBtn) heroBuyBtn.addEventListener("click", () => window.open(C.shopUrl, "_blank"));
  if (heroDiscBtn) heroDiscBtn.addEventListener("click", () => openModal("modal-discord"));

  /* ═══════════════════════════════════════════════════════
     MODAL SYSTEM
  ═══════════════════════════════════════════════════════ */
  let currentModal = null;

  function openModal(id) {
    closeModal();
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add("active");
    currentModal = m;

    // Mark nav tab active
    document.querySelectorAll(".nav-tab").forEach(b => {
      b.classList.toggle("active", b.dataset.modal === id);
    });

    // Lazy-load modal content
    if (id === "modal-features")  loadFeatures();
    if (id === "modal-info")      loadInfo();
    if (id === "modal-pricing")   loadPricing();
    if (id === "modal-discord")   loadDiscord();

    refreshHovers();
  }

  function closeModal() {
    if (currentModal) {
      currentModal.classList.remove("active");
      currentModal = null;
    }
    document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));
  }

  // Nav tab clicks
  document.querySelectorAll(".nav-tab[data-modal]").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.dataset.modal));
  });

  // Close button & backdrop
  document.addEventListener("click", e => {
    if (e.target.classList.contains("modal-close-btn") || e.target.classList.contains("modal-backdrop")) {
      closeModal();
    }
  });
  window.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  /* ═══════════════════════════════════════════════════════
     ACCORDION (Info modal)
  ═══════════════════════════════════════════════════════ */
  document.querySelectorAll(".acc-trigger").forEach(trigger => {
    trigger.addEventListener("click", () => {
      const body   = document.getElementById(trigger.dataset.target);
      const isOpen = body.classList.contains("open");
      // close all
      document.querySelectorAll(".acc-body").forEach(b  => b.classList.remove("open"));
      document.querySelectorAll(".acc-trigger").forEach(t => t.classList.remove("active"));
      // toggle
      if (!isOpen) { body.classList.add("open"); trigger.classList.add("active"); }
    });
  });

  /* ═══════════════════════════════════════════════════════
     FEATURES MODAL
  ═══════════════════════════════════════════════════════ */
  let featDone = false;
  let featData = {};

  function loadFeatures() {
    if (featDone) return;
    fetch("script.txt")
      .then(r => { if (!r.ok) throw 0; return r.text(); })
      .then(parseFeatures)
      .catch(() => parseFeatures(FALLBACK_FEATURES));
  }

  function parseFeatures(text) {
    featDone = true;
    const loader = document.getElementById("features-loader");
    const nav    = document.getElementById("features-tabs-nav");
    const content= document.getElementById("features-content");
    if (loader) loader.remove();
    nav.innerHTML = ""; content.innerHTML = "";
    featData = {};

    let cat = null;
    text.split("\n").forEach(line => {
      const t = line.trim();
      if (!t) return;
      if (t.startsWith("[") && t.endsWith("]")) {
        cat = t.slice(1, -1);
        featData[cat] = [];
      } else if (cat && (t[0] === "-" || t[0] === "*")) {
        featData[cat].push(t.slice(1).trim());
      }
    });

    const cats = Object.keys(featData);
    cats.forEach((cat, i) => {
      const btn = document.createElement("button");
      btn.className   = "feat-tab-btn" + (i === 0 ? " active" : "");
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".feat-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderFeatContent(cat, content);
      });
      nav.appendChild(btn);
    });

    if (cats.length) renderFeatContent(cats[0], content);
    refreshHovers();
  }

  function renderFeatContent(cat, container) {
    container.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "features-grid";
    (featData[cat] || []).forEach(item => {
      const chip = document.createElement("div");
      chip.className = "feature-chip";
      chip.innerHTML = `<span class="chip-dot"></span><span>${item}</span>`;
      grid.appendChild(chip);
    });
    container.appendChild(grid);
  }

  const FALLBACK_FEATURES = `[Aimbot]
- Enabled
- Lock Method (Mouse, Camera)
- Target Mode (FOV, Mouse, Distance, Center)
- Aim Type (Normal, Closest Part)
- Sticky Aim
- Lock Target
- Look At Target
- Smoothing / Inertia
- Dynamic Prediction
[Silent Aim]
- Enabled
- Target Type (Closest to Mouse, Distance, FOV)
- Hit Part (Head, Torso)
- Use Closest Point
[Visuals (ESP)]
- Enable ESP
- Box ESP (Full, Cornered)
- Name ESP
- Health Bar
- Health Bar Gradient
- Armor Bar
- Weapon ESP
- State Flags
[Player Chams]
- Player Chams
- Fill Color
- Outline Color
- Fill Transparency
[Movement]
- Speed Boost
- Jump Boost
- Noclip
- Fly
- Anti AFK
[Skins]
- Purple, Red, Green, Blue, Grey
- Ghost Skin (transparent)
- Rainbow Skin
- Cosmic Skin
[Skyboxes]
- Space, Pink, Night, Forest
- Nebula, Blood Red, Sunset
- Realistic Day, HD Space
[Avatar]
- Headless
- Korblox Right/Left Leg
- Animation Changer`;

  /* ═══════════════════════════════════════════════════════
     INFO MODAL
  ═══════════════════════════════════════════════════════ */
  let infoDone = false;

  function loadInfo() {
    if (infoDone) return;
    infoDone = true;
    renderGames();
    renderExecutors();
    renderOwner();
    fetchOffsets();
  }

  function renderGames() {
    const el = document.getElementById("games-list");
    if (!el) return;
    el.innerHTML = "";
    C.games.forEach(g => {
      const card = document.createElement("div");
      card.className = "game-card";
      card.innerHTML = `
        <div class="game-card-icon">${g.icon}</div>
        <h4>${g.name}</h4>
        <p>${g.details}</p>
        <div class="game-tags">${g.tags.map(t => `<span class="game-tag">${t}</span>`).join("")}</div>`;
      el.appendChild(card);
    });
  }

  function renderExecutors() {
    const el = document.getElementById("executors-list");
    if (!el) return;
    el.innerHTML = "";
    C.executors.forEach(name => {
      const b = document.createElement("span");
      b.className   = "exec-badge";
      b.textContent = name;
      el.appendChild(b);
    });
  }

  function renderOwner() {
    // Avatar (full body)
    fetchRobloxAvatar(C.owner.robloxId, "full", img => {
      const el = document.getElementById("owner-avatar");
      if (el) el.src = img;
    });
    // Profile data
    proxyFetch(`https://users.roblox.com/v1/users/${C.owner.robloxId}`)
      .then(d => {
        const dn = document.getElementById("owner-display-name");
        const un = document.getElementById("owner-username");
        const id = document.getElementById("owner-id");
        const cr = document.getElementById("owner-created");
        if (dn) dn.textContent = d.displayName || C.owner.name;
        if (un) un.textContent = `@${d.name || "loading"}`;
        if (id) id.textContent = d.id || C.owner.robloxId;
        if (cr && d.created) {
          cr.textContent = new Date(d.created).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
        }
      })
      .catch(() => {
        const dn = document.getElementById("owner-display-name");
        const un = document.getElementById("owner-username");
        if (dn) dn.textContent = C.owner.name;
        if (un) un.textContent = "@5fovtraceboss";
      });

    // Links
    const linksEl = document.getElementById("owner-links");
    if (linksEl) {
      linksEl.innerHTML = "";
      C.owner.links.forEach(link => {
        const a = document.createElement("a");
        a.className = "dev-link-btn";
        a.href = link.url;
        a.target = "_blank";
        a.textContent = `${link.icon}  ${link.label}`;
        linksEl.appendChild(a);
      });
    }
    refreshHovers();
  }

  /* ─── Roblox avatar fetch helper ───────────────────── */
  function fetchRobloxAvatar(userId, type, cb) {
    const endpoint = type === "full"
      ? `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`
      : `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`;

    proxyFetch(endpoint)
      .then(d => { if (d.data && d.data[0]) cb(d.data[0].imageUrl); })
      .catch(() => {});
  }

  /* ─── Generic CORS proxy fetch ──────────────────────── */
  function proxyFetch(url) {
    const proxy = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
    return fetch(proxy).then(r => { if (!r.ok) throw 0; return r.json(); });
  }

  /* ═══════════════════════════════════════════════════════
     OFFSETS  (imtheo.lol)
  ═══════════════════════════════════════════════════════ */
  function fetchOffsets() {
    const url = C.offsetsUrl || "https://offsets.imtheo.lol/Offsets.json";
    proxyFetch(url)
      .then(setOffsets)
      .catch(() => fetch(url).then(r => r.json()).then(setOffsets).catch(() => {
        setOffsets({
          "Roblox Version": "version-d584fb6c717a43d9",
          "Dumper Version": "2.1.7",
          "Dumped With": "RbxDumperV2",
          "Dumped At": "01:04 06/08/2026",
          "Total Offsets": "388"
        });
      }));
  }

  function setOffsets(d) {
    const cv = document.getElementById("rbx-client-version");
    const dv = document.getElementById("rbx-dumper-version");
    const da = document.getElementById("rbx-dump-date");
    const oc = document.getElementById("rbx-offset-count");
    if (cv) cv.textContent = d["Roblox Version"] || "—";
    if (dv) dv.textContent = `${d["Dumper Version"] || "?"} (${d["Dumped With"] || "?"})`;
    if (da) da.textContent = d["Dumped At"] || "—";
    if (oc) oc.textContent = `${d["Total Offsets"] || "?"} offsets`;

    // Update links with real viewer URL
    const viewerUrl = C.offsetsViewerUrl || "https://offsets.imtheo.lol/";
    const link = document.getElementById("offsets-link");
    const btn  = document.getElementById("offsets-open-btn");
    if (link) link.href = viewerUrl;
    if (btn)  btn.href  = viewerUrl;
  }

  /* ═══════════════════════════════════════════════════════
     PRICING MODAL
  ═══════════════════════════════════════════════════════ */
  let pricingDone = false;

  function loadPricing() {
    if (pricingDone) return;
    pricingDone = true;
    const container = document.getElementById("pricing-card-container");
    if (!container) return;

    const p = C.pricing;
    container.innerHTML = `
      <div class="pricing-card-hero">
        <div class="pricing-card-glow"></div>
        <div class="pricing-badge-wrap">
          <span class="pricing-badge">${p.badge || "Best Value"}</span>
        </div>
        <div class="pricing-inner">
          <h3>${p.name}</h3>
          <div class="pricing-amount-row">
            <span class="pricing-big-price">${p.price}</span>
            <span class="pricing-period">${p.period}</span>
          </div>
          <div class="pricing-divider"></div>
          <ul class="pricing-features-ul">
            ${p.features.map(f => `<li>${f}</li>`).join("")}
          </ul>
          <button class="pricing-buy-btn" id="pricing-buy-btn">Get Lifetime Access</button>
          <p class="pricing-note">Secure checkout via aeri.mysellauth.com</p>
        </div>
      </div>`;

    document.getElementById("pricing-buy-btn").addEventListener("click", () => {
      window.open(p.link, "_blank");
    });
    refreshHovers();
  }

  /* ═══════════════════════════════════════════════════════
     DISCORD MODAL  —  real server info via Discord API
  ═══════════════════════════════════════════════════════ */
  let discordDone = false;

  function loadDiscord() {
    if (discordDone) return;
    discordDone = true;

    const joinBtn = document.getElementById("discord-join-btn");
    const copyBtn = document.getElementById("discord-copy-btn");

    if (joinBtn) joinBtn.addEventListener("click", () => window.open(C.discord, "_blank"));
    if (copyBtn) copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(C.discord).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => copyBtn.textContent = "Copy Link", 2000);
      });
    });

    // Fetch live member counts from Discord widget API (no bot token needed)
    const guildId = C.discordGuildId;
    fetch(`https://discord.com/api/guilds/${guildId}/widget.json`)
      .then(r => r.json())
      .then(d => {
        const onlineEl = document.getElementById("dsc-online-count");
        const totalEl  = document.getElementById("dsc-total-count");
        const descEl   = document.getElementById("dsc-description");
        if (onlineEl) onlineEl.textContent = (d.presence_count || 0).toLocaleString();
        if (totalEl)  totalEl.textContent  = "—"; // widget only returns online
        if (descEl && d.name) descEl.textContent = `Official server for the Alternate Roblox script.`;
      })
      .catch(() => {
        // Fallback to invite API
        fetch(`https://discord.com/api/v10/invites/${C.discordInviteCode}?with_counts=true&with_expiration=true`)
          .then(r => r.json())
          .then(d => {
            const onlineEl = document.getElementById("dsc-online-count");
            const totalEl  = document.getElementById("dsc-total-count");
            if (d.approximate_presence_count !== undefined)
              onlineEl && (onlineEl.textContent = d.approximate_presence_count.toLocaleString());
            if (d.approximate_member_count !== undefined)
              totalEl  && (totalEl.textContent  = d.approximate_member_count.toLocaleString());
          })
          .catch(() => {});
      });

    refreshHovers();
  }

});
