/* ══════════════════════════════════════════════════
   ALTERNATE — app.js (stripped back)
══════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const C = window.CONFIG;

  /* ── ELEMENTS ──────────────────────────── */
  const ring      = document.getElementById("cursor-ring");
  const dot       = document.getElementById("cursor-dot");
  const canvasEl  = document.getElementById("grid-canvas");
  const ctx       = canvasEl.getContext("2d");
  const startup   = document.getElementById("startup-screen");
  const gun       = document.getElementById("intro-gun");
  const textWrap  = document.getElementById("intro-text-wrap");
  const main      = document.getElementById("main-content");
  const guiCard   = document.getElementById("gui-card");

  /* ══════════════════════════════════════
     CURSOR (damped ring, instant dot)
  ══════════════════════════════════════ */
  let mx = innerWidth / 2, my = innerHeight / 2;
  let dx = mx, dy = my;
  let tRX = 0, tRY = 0, rX = 0, rY = 0;

  window.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    if (guiCard) {
      const r = guiCard.getBoundingClientRect();
      tRX = -((e.clientY - r.top  - r.height / 2) / r.height) * 10;
      tRY =  ((e.clientX - r.left - r.width  / 2) / r.width)  * 10;
    }
  });

  function addHover(el) {
    el.addEventListener("mouseenter", () => document.body.classList.add("hovered"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("hovered"));
  }
  function refreshHovers() {
    document.querySelectorAll("button, a").forEach(addHover);
  }

  function tick() {
    dx += (mx - dx) * 0.13;
    dy += (my - dy) * 0.13;
    rX += (tRX - rX) * 0.09;
    rY += (tRY - rY) * 0.09;
    ring.style.left = dx + "px"; ring.style.top = dy + "px";
    dot.style.left  = mx + "px"; dot.style.top  = my + "px";
    if (guiCard) guiCard.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ══════════════════════════════════════
     CANVAS  (pink tile glow + grid)
  ══════════════════════════════════════ */
  const CELL = 50;
  let cols, rows, cells = [];

  function resize() {
    canvasEl.width  = innerWidth;
    canvasEl.height = innerHeight;
    cols = Math.ceil(canvasEl.width  / CELL) + 1;
    rows = Math.ceil(canvasEl.height / CELL) + 1;
    cells = Array.from({ length: cols }, () => new Float32Array(rows));
  }
  window.addEventListener("resize", resize);
  resize();

  function drawCanvas() {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    /* grid lines */
    ctx.strokeStyle = "rgba(255,255,255,0.016)";
    ctx.lineWidth = 1; ctx.beginPath();
    for (let c = 0; c <= cols; c++) { ctx.moveTo(c*CELL,0); ctx.lineTo(c*CELL,canvasEl.height); }
    for (let r = 0; r <= rows; r++) { ctx.moveTo(0,r*CELL); ctx.lineTo(canvasEl.width,r*CELL); }
    ctx.stroke();

    /* hover glow */
    const mc = Math.floor(mx / CELL), mr = Math.floor(my / CELL);
    [[0,0,1],[1,0,.3],[-1,0,.3],[0,1,.3],[0,-1,.3],[1,1,.12],[-1,1,.12],[1,-1,.12],[-1,-1,.12]].forEach(([dc,dr,v]) => {
      const nc = mc+dc, nr = mr+dr;
      if (nc>=0&&nc<cols&&nr>=0&&nr<rows) cells[nc][nr] = Math.max(cells[nc][nr], v);
    });
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const v = cells[c][r];
      if (v > 0.005) {
        ctx.fillStyle = `rgba(255,79,163,${v*0.12})`;
        ctx.fillRect(c*CELL, r*CELL, CELL, CELL);
        cells[c][r] *= 0.91;
      }
    }

    /* spotlight */
    const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, 220);
    g.addColorStop(0, "rgba(255,79,163,0.05)"); g.addColorStop(1,"transparent");
    ctx.fillStyle = g; ctx.fillRect(0,0,canvasEl.width,canvasEl.height);

    requestAnimationFrame(drawCanvas);
  }
  requestAnimationFrame(drawCanvas);

  /* ══════════════════════════════════════
     INTRO ANIMATION
     1) gun spins in from right  (0.9s)
     2) gun slides off to left   (0.55s)
     3) /alternate fades in      (0.5s)
     4) whole screen fades out   (0.65s)
     Click anywhere to skip
  ══════════════════════════════════════ */
  let introDone = false;

  textWrap.style.opacity   = "0";
  textWrap.style.transform = "scale(0.97)";

  setTimeout(() => {
    gun.style.transition = "transform 0.9s cubic-bezier(0.34,1.46,0.64,1), opacity 0.5s ease";
    gun.style.transform  = "translateX(0) rotate(360deg)";
    gun.style.opacity    = "1";
  }, 100);

  setTimeout(() => {
    gun.style.transition = "transform 0.55s cubic-bezier(0.6,0,0.4,1), opacity 0.35s ease";
    gun.style.transform  = "translateX(-120vw) rotate(700deg)";
    gun.style.opacity    = "0";
  }, 1350);

  setTimeout(() => {
    textWrap.style.transition = "opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1)";
    textWrap.style.opacity    = "1";
    textWrap.style.transform  = "scale(1)";
  }, 2050);

  setTimeout(finishIntro, 3600);

  startup.addEventListener("click", () => {
    if (introDone) return;
    gun.style.transition = "opacity 0.1s";
    gun.style.opacity    = "0";
    textWrap.style.transition = "opacity 0.25s ease";
    textWrap.style.opacity    = "1";
    textWrap.style.transform  = "scale(1)";
    setTimeout(finishIntro, 400);
  });

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    startup.classList.add("fade-out");
    setTimeout(() => {
      startup.style.display = "none";
      main.classList.remove("hidden-main");
      main.classList.add("visible");
      refreshHovers();
    }, 650);
  }

  /* ══════════════════════════════════════
     MODALS
  ══════════════════════════════════════ */
  let activeModal = null;

  function openModal(id) {
    if (activeModal) activeModal.classList.remove("active");
    activeModal = document.getElementById(id);
    if (activeModal) activeModal.classList.add("active");
    document.querySelectorAll(".tab-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.modal === id));
    refreshHovers();
  }

  function closeAll() {
    if (activeModal) { activeModal.classList.remove("active"); activeModal = null; }
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  }

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (activeModal && activeModal.id === btn.dataset.modal) { closeAll(); return; }
      openModal(btn.dataset.modal);
      if (btn.dataset.modal === "modal-features") loadFeatures();
      if (btn.dataset.modal === "modal-info")     loadInfo();
      if (btn.dataset.modal === "modal-pricing")  loadPricing();
      if (btn.dataset.modal === "modal-discord")  loadDiscord();
    });
  });

  document.querySelectorAll(".close-btn").forEach(btn =>
    btn.addEventListener("click", closeAll));
  document.querySelectorAll(".modal-bg").forEach(bg =>
    bg.addEventListener("click", closeAll));
  window.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

  /* ── Accordion ──────────────────────── */
  document.querySelectorAll(".acc-h").forEach(h => {
    h.addEventListener("click", () => {
      const body = document.getElementById(h.dataset.t);
      const open = body.classList.contains("open");
      document.querySelectorAll(".acc-b").forEach(b => b.classList.remove("open"));
      document.querySelectorAll(".acc-h").forEach(a => a.classList.remove("active"));
      if (!open) { body.classList.add("open"); h.classList.add("active"); }
    });
  });

  /* ══════════════════════════════════════
     FEATURES (parses script.txt)
  ══════════════════════════════════════ */
  let featDone = false;
  let featData = {};

  function loadFeatures() {
    if (featDone) return;
    fetch("script.txt")
      .then(r => { if (!r.ok) throw 0; return r.text(); })
      .then(parseFeat).catch(() => parseFeat(FALLBACK));
  }

  const FALLBACK = `[Aimbot]
- Enabled
- Lock Method (Mouse, Camera)
- Target Mode (FOV, Mouse, Distance, Center)
- Sticky Aim / Lock Target
- Smoothing / Inertia
- Dynamic Prediction
- Offsets (Up, Down, Left, Right)
[Silent Aim]
- Enabled
- Target Type (Closest, Distance, FOV)
- Hit Part (Head, Torso, HRP)
- Use Closest Point
[Visuals (ESP)]
- Box ESP (Full, Cornered)
- Name ESP
- Health Bar
- Armor Bar
- Weapon ESP
- State Flags
[Player Chams]
- Fill &amp; Outline Color
- Show On Self / Others / NPCs
- Transparency Control
[Movement]
- Speed Boost / Jump Boost
- Noclip / Fly
- Anti AFK
[Skins]
- Purple / Red / Green / Blue / Grey
- Ghost / Rainbow / Cosmic
[Skyboxes]
- Space / Pink / Night / Forest
- Nebula / Sunset / Blood Red
[Avatar]
- Headless / Korblox
- Animation Changer`;

  function parseFeat(txt) {
    featDone = true;
    document.getElementById("feat-loader")?.remove();
    const nav    = document.getElementById("feat-tabs");
    const grid   = document.getElementById("feat-grid");
    nav.innerHTML = ""; grid.innerHTML = ""; featData = {};

    let cat = null;
    txt.split("\n").forEach(line => {
      const t = line.trim();
      if (!t) return;
      if (t[0]==="[" && t.at(-1)==="]") { cat = t.slice(1,-1); featData[cat]=[]; }
      else if (cat && (t[0]==="-"||t[0]==="*")) featData[cat].push(t.slice(1).trim());
    });

    Object.keys(featData).forEach((cat, i) => {
      const btn = document.createElement("button");
      btn.className = "ftab" + (i===0 ? " active" : "");
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".ftab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        showFeat(cat);
      });
      nav.appendChild(btn);
    });
    if (Object.keys(featData)[0]) showFeat(Object.keys(featData)[0]);
    refreshHovers();
  }

  function showFeat(cat) {
    const grid = document.getElementById("feat-grid");
    grid.innerHTML = "";
    (featData[cat]||[]).forEach(item => {
      const d = document.createElement("div");
      d.className = "f-chip";
      d.innerHTML = `<span class="f-dot"></span><span>${item}</span>`;
      grid.appendChild(d);
    });
  }

  /* ══════════════════════════════════════
     INFO (Roblox + offsets)
  ══════════════════════════════════════ */
  let infoDone = false;

  function loadInfo() {
    if (infoDone) return;
    infoDone = true;

    /* Games */
    const gEl = document.getElementById("games-list");
    if (gEl) C.games.forEach(g => {
      gEl.innerHTML += `<div class="game-card">
        <div class="game-icon">${g.icon}</div>
        <h4>${g.name}</h4><p>${g.details}</p>
        <div class="tag-row">${g.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
      </div>`;
    });

    /* Executors */
    const eEl = document.getElementById("exec-list");
    if (eEl) C.executors.forEach(n => {
      const s = document.createElement("span");
      s.className = "exec-b"; s.textContent = n; eEl.appendChild(s);
    });

    /* Owner links */
    const lEl = document.getElementById("owner-links");
    if (lEl) C.owner.links.forEach(l => {
      const a = document.createElement("a");
      a.className="dev-link"; a.href=l.url; a.target="_blank";
      a.textContent=`${l.icon}  ${l.label}`; lEl.appendChild(a);
    });

    /* Roblox avatar (full body) */
    const PROXY = url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
    const avatarUrl = `https://thumbnails.roblox.com/v1/users/avatar?userIds=${C.owner.robloxId}&size=420x420&format=Png&isCircular=false`;
    fetch(PROXY(avatarUrl))
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]?.imageUrl) {
          const el = document.getElementById("owner-avatar");
          if (el) el.src = d.data[0].imageUrl;
        }
      }).catch(() => {});

    /* Roblox profile (name, username, joined) */
    const profileUrl = `https://users.roblox.com/v1/users/${C.owner.robloxId}`;
    fetch(PROXY(profileUrl))
      .then(r => r.json())
      .then(d => {
        const dn = document.getElementById("owner-display-name");
        const un = document.getElementById("owner-username");
        const id = document.getElementById("owner-id");
        const cr = document.getElementById("owner-created");
        if (dn && d.displayName) dn.textContent = d.displayName;
        if (un && d.name)        un.textContent  = `@${d.name}`;
        if (id && d.id)          id.textContent  = d.id;
        if (cr && d.created)     cr.textContent  = new Date(d.created).toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"});
      }).catch(() => {});

    /* Offsets */
    const OFFSETS = C.offsetsUrl || "https://offsets.imtheo.lol/Offsets.json";
    fetch(PROXY(OFFSETS))
      .then(r => r.json())
      .then(setOffsets)
      .catch(() => fetch(OFFSETS).then(r=>r.json()).then(setOffsets).catch(() => {
        setOffsets({"Roblox Version":"version-d584fb6c717a43d9","Dumper Version":"2.1.7","Dumped With":"RbxDumperV2","Dumped At":"01:04 06/08/2026","Total Offsets":"388"});
      }));

    refreshHovers();
  }

  function setOffsets(d) {
    const v  = document.getElementById("rbx-ver");
    const dv = document.getElementById("rbx-dump");
    const da = document.getElementById("rbx-date");
    const oc = document.getElementById("rbx-count");
    if (v)  v.textContent  = d["Roblox Version"]||"—";
    if (dv) dv.textContent = `${d["Dumper Version"]||"?"} (${d["Dumped With"]||"?"})`;
    if (da) da.textContent = d["Dumped At"]||"—";
    if (oc) oc.textContent = `${d["Total Offsets"]||"?"} offsets`;
    const btn = document.getElementById("offsets-btn");
    if (btn) btn.href = C.offsetsViewerUrl || "https://offsets.imtheo.lol/";
  }

  /* ══════════════════════════════════════
     PRICING
  ══════════════════════════════════════ */
  let priceDone = false;
  function loadPricing() {
    if (priceDone) return;
    priceDone = true;
    const btn = document.getElementById("buy-btn");
    if (btn) btn.addEventListener("click", () => window.open(C.shopUrl, "_blank"));
    refreshHovers();
  }

  /* ══════════════════════════════════════
     DISCORD  (invite API for live counts)
  ══════════════════════════════════════ */
  let dscDone = false;
  function loadDiscord() {
    if (dscDone) return;
    dscDone = true;

    const joinBtn = document.getElementById("dsc-join");
    const copyBtn = document.getElementById("dsc-copy");
    if (joinBtn) joinBtn.addEventListener("click", () => window.open(C.discord, "_blank"));
    if (copyBtn) copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(C.discord).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => copyBtn.textContent = "Copy Link", 2000);
      });
    });

    /* Discord invite API — no auth required, public endpoint */
    const inviteCode = C.discordInviteCode || "alternate";
    fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`)
      .then(r => r.json())
      .then(d => {
        const onEl = document.getElementById("dsc-online");
        const mbEl = document.getElementById("dsc-members");
        if (onEl && d.approximate_presence_count !== undefined)
          onEl.textContent = d.approximate_presence_count.toLocaleString();
        if (mbEl && d.approximate_member_count !== undefined)
          mbEl.textContent = d.approximate_member_count.toLocaleString();
      })
      .catch(() => {
        /* fallback: widget API */
        fetch(`https://discord.com/api/guilds/${C.discordGuildId}/widget.json`)
          .then(r => r.json())
          .then(d => {
            const onEl = document.getElementById("dsc-online");
            if (onEl && d.presence_count) onEl.textContent = d.presence_count.toLocaleString();
          }).catch(() => {});
      });

    refreshHovers();
  }

});
