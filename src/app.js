/* ═══════════════════════════════════════════════
   ALTERNATE — app.js
═══════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const C = window.CONFIG;

  /* ── ELEMENTS ─────────────────────────────── */
  const ring     = document.getElementById("cursor-ring");
  const dot      = document.getElementById("cursor-dot");
  const cnv      = document.getElementById("grid-canvas");
  const ctx      = cnv.getContext("2d");
  const startup  = document.getElementById("startup-screen");
  const gun      = document.getElementById("intro-gun");
  const introTxt = document.getElementById("intro-text");
  const typed    = document.getElementById("intro-typed");
  const main     = document.getElementById("main-content");
  const guiImg   = document.getElementById("gui-img");

  /* ══════════════════════════════════════════
     CURSOR
  ══════════════════════════════════════════ */
  let mx = innerWidth/2, my = innerHeight/2, dx = mx, dy = my;
  let tRX = 0, tRY = 0, rX = 0, rY = 0;

  window.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    if (guiImg) {
      const r = guiImg.getBoundingClientRect();
      tRX = -((e.clientY - r.top  - r.height/2) / r.height) * 8;
      tRY =  ((e.clientX - r.left - r.width /2) / r.width ) * 8;
    }
  });

  function refreshHovers() {
    document.querySelectorAll("button,a,input[type=range]").forEach(el => {
      el.onmouseenter = () => document.body.classList.add("hovered");
      el.onmouseleave = () => document.body.classList.remove("hovered");
    });
  }

  (function animCursor() {
    dx += (mx-dx)*0.13; dy += (my-dy)*0.13;
    rX += (tRX-rX)*0.08; rY += (tRY-rY)*0.08;
    ring.style.left = dx+"px"; ring.style.top = dy+"px";
    dot.style.left  = mx+"px"; dot.style.top  = my+"px";
    if (guiImg) guiImg.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`;
    requestAnimationFrame(animCursor);
  })();

  /* ══════════════════════════════════════════
     CANVAS
  ══════════════════════════════════════════ */
  const CELL = 50;
  let cols, rows, cells = [];
  function resize() {
    cnv.width = innerWidth; cnv.height = innerHeight;
    cols = Math.ceil(cnv.width /CELL)+1;
    rows = Math.ceil(cnv.height/CELL)+1;
    cells = Array.from({length:cols},()=>new Float32Array(rows));
  }
  window.addEventListener("resize", resize);
  resize();

  (function drawCanvas() {
    ctx.clearRect(0,0,cnv.width,cnv.height);
    ctx.strokeStyle="rgba(255,255,255,0.015)"; ctx.lineWidth=1; ctx.beginPath();
    for(let c=0;c<=cols;c++){ctx.moveTo(c*CELL,0);ctx.lineTo(c*CELL,cnv.height);}
    for(let r=0;r<=rows;r++){ctx.moveTo(0,r*CELL);ctx.lineTo(cnv.width,r*CELL);}
    ctx.stroke();

    const mc=Math.floor(mx/CELL), mr=Math.floor(my/CELL);
    [[0,0,1],[1,0,.3],[-1,0,.3],[0,1,.3],[0,-1,.3],[1,1,.1],[-1,1,.1],[1,-1,.1],[-1,-1,.1]].forEach(([dc,dr,v])=>{
      const nc=mc+dc,nr=mr+dr;
      if(nc>=0&&nc<cols&&nr>=0&&nr<rows) cells[nc][nr]=Math.max(cells[nc][nr],v);
    });
    for(let c=0;c<cols;c++) for(let r=0;r<rows;r++){
      const v=cells[c][r];
      if(v>0.005){ctx.fillStyle=`rgba(255,79,163,${v*0.11})`;ctx.fillRect(c*CELL,r*CELL,CELL,CELL);cells[c][r]*=0.92;}
    }
    const g=ctx.createRadialGradient(dx,dy,0,dx,dy,200);
    g.addColorStop(0,"rgba(255,79,163,0.05)");g.addColorStop(1,"transparent");
    ctx.fillStyle=g;ctx.fillRect(0,0,cnv.width,cnv.height);
    requestAnimationFrame(drawCanvas);
  })();

  /* ══════════════════════════════════════════
     INTRO ANIMATION
     Phase 1 (0ms):   gun fades in, already huge (scale 3.5)
     Phase 2 (200ms): gun zooms out → scale(0.4) over 1.0s
     Phase 3 (1400ms): gun slides slowly LEFT off screen over 1.8s
     Phase 4 (1600ms): /alternate typewriters in (during slide)
     Phase 5 (3600ms): entire intro fades out → main in
  ══════════════════════════════════════════ */
  gun.style.transformOrigin = "center center";
  gun.style.transition = "none";
  gun.style.transform  = "scale(3.5) translateX(0px)";
  gun.style.opacity    = "0";
  introTxt.style.opacity = "0";

  // Phase 1 — appear
  setTimeout(() => {
    gun.style.transition = "opacity 0.3s ease";
    gun.style.opacity    = "1";
  }, 80);

  // Phase 2 — zoom out to small
  setTimeout(() => {
    gun.style.transition = "transform 1.0s cubic-bezier(0.34,1.1,0.64,1), opacity 0.3s ease";
    gun.style.transform  = "scale(0.38) translateX(0px)";
  }, 220);

  // Phase 3 — slide slowly left (gun exits)
  setTimeout(() => {
    gun.style.transition = "transform 2.0s cubic-bezier(0.4,0,0.2,1), opacity 0.6s ease 1.4s";
    gun.style.transform  = "scale(0.38) translateX(-280vw)";
    gun.style.opacity    = "0"; // fade as it leaves
  }, 1350);

  // Phase 4 — typewriter starts (overlaps with slide)
  setTimeout(() => {
    introTxt.style.transition = "opacity 0.4s ease";
    introTxt.style.opacity    = "1";
    typewrite("alternate", typed, 80);
  }, 1700);

  // Phase 5 — fade whole screen out
  setTimeout(finishIntro, 4200);

  function typewrite(text, el, speed) {
    let i = 0;
    el.textContent = "";
    const interval = setInterval(() => {
      if (i < text.length) { el.textContent += text[i]; i++; }
      else clearInterval(interval);
    }, speed);
  }

  function finishIntro() {
    startup.classList.add("fade-out");
    setTimeout(() => {
      startup.style.display = "none";
      main.classList.remove("hidden-main");
      main.classList.add("visible");
      refreshHovers();
    }, 800);
  }

  /* ══════════════════════════════════════════
     MUSIC PLAYER
  ══════════════════════════════════════════ */
  const audio     = document.getElementById("audio");
  const playBtn   = document.getElementById("mp-play");
  const iconPlay  = document.getElementById("icon-play");
  const iconPause = document.getElementById("icon-pause");
  const volSlider = document.getElementById("mp-vol");
  const barFill   = document.getElementById("mp-bar-fill");
  const mpTime    = document.getElementById("mp-time");

  audio.volume = 0.6;

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      iconPlay.classList.add("hidden");
      iconPause.classList.remove("hidden");
    } else {
      audio.pause();
      iconPlay.classList.remove("hidden");
      iconPause.classList.add("hidden");
    }
  });

  volSlider.addEventListener("input", () => { audio.volume = volSlider.value; });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    barFill.style.width = pct + "%";
    const m = Math.floor(audio.currentTime / 60);
    const s = Math.floor(audio.currentTime % 60).toString().padStart(2,"0");
    mpTime.textContent = `${m}:${s}`;
  });

  // Click on progress bar to seek
  document.getElementById("mp-bar-bg").addEventListener("click", e => {
    if (!audio.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - r.left) / r.width;
    audio.currentTime = pct * audio.duration;
  });

  /* ══════════════════════════════════════════
     MODALS
  ══════════════════════════════════════════ */
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

  document.querySelectorAll(".close-btn").forEach(b => b.addEventListener("click", closeAll));
  document.querySelectorAll(".modal-bg").forEach(b => b.addEventListener("click", closeAll));
  window.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

  /* ── Accordion ────────────────────────────── */
  document.querySelectorAll(".acc-h").forEach(h => {
    h.addEventListener("click", () => {
      const body = document.getElementById(h.dataset.t);
      const open = body.classList.contains("open");
      document.querySelectorAll(".acc-b").forEach(b => b.classList.remove("open"));
      document.querySelectorAll(".acc-h").forEach(a => a.classList.remove("active"));
      if (!open) { body.classList.add("open"); h.classList.add("active"); }
    });
  });

  /* ══════════════════════════════════════════
     FEATURES
  ══════════════════════════════════════════ */
  let featDone = false, featData = {};

  function loadFeatures() {
    if (featDone) return;
    fetch("script.txt")
      .then(r => { if (!r.ok) throw 0; return r.text(); })
      .then(parseFeat).catch(() => parseFeat(FALLBACK));
  }

  function parseFeat(txt) {
    featDone = true;
    document.getElementById("feat-loader")?.remove();
    const nav  = document.getElementById("feat-tabs-nav");
    const grid = document.getElementById("feat-grid");
    nav.innerHTML = ""; grid.innerHTML = ""; featData = {};
    let cat = null;
    txt.split("\n").forEach(line => {
      const t = line.trim();
      if (!t) return;
      if (t[0]==="[" && t.at(-1)==="]") { cat=t.slice(1,-1); featData[cat]=[]; }
      else if (cat && (t[0]==="-"||t[0]==="*")) featData[cat].push(t.slice(1).trim());
    });
    Object.keys(featData).forEach((c,i) => {
      const btn = document.createElement("button");
      btn.className = "ftab"+(i===0?" active":"");
      btn.textContent = c;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".ftab").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active"); showFeat(c);
      });
      nav.appendChild(btn);
    });
    const cats = Object.keys(featData);
    if (cats.length) showFeat(cats[0]);
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

  const FALLBACK = `[Aimbot]
- Enabled
- Lock Method (Mouse, Camera)
- Target Mode (FOV, Mouse, Distance, Center)
- Sticky Aim / Lock Target
- Smoothing / Inertia
- Dynamic Prediction
[Silent Aim]
- Enabled
- Target Type (Closest, Distance, FOV)
- Hit Part (Head, Torso, HRP)
[Visuals (ESP)]
- Box ESP (Full, Cornered)
- Name ESP / Health Bar
- Armor Bar / Weapon ESP
[Player Chams]
- Fill & Outline Color
- Transparency Control
[Movement]
- Speed Boost / Jump Boost
- Noclip / Fly / Anti AFK
[Skins]
- Purple / Red / Green / Blue
- Ghost / Rainbow / Cosmic
[Skyboxes]
- Space / Pink / Night / Forest
- Nebula / Sunset / Blood Red
[Avatar]
- Headless / Korblox
- Animation Changer`;

  /* ══════════════════════════════════════════
     INFO
  ══════════════════════════════════════════ */
  let infoDone = false;

  function loadInfo() {
    if (infoDone) return; infoDone = true;

    // Games
    const gEl = document.getElementById("games-list");
    if (gEl) C.games.forEach(g => {
      gEl.innerHTML += `<div class="game-card"><div class="game-icon">${g.icon}</div><h4>${g.name}</h4><p>${g.details}</p><div class="tag-row">${g.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div></div>`;
    });

    // Executors
    const eEl = document.getElementById("exec-list");
    if (eEl) C.executors.forEach(n => {
      const s = document.createElement("span"); s.className="exec-b"; s.textContent=n; eEl.appendChild(s);
    });

    // Owner links
    const lEl = document.getElementById("owner-links");
    if (lEl) C.owner.links.forEach(l => {
      const a=document.createElement("a"); a.className="dev-link"; a.href=l.url; a.target="_blank"; a.textContent=`${l.icon}  ${l.label}`; lEl.appendChild(a);
    });

    const PROXY = url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`;

    // Roblox full-body avatar
    fetch(PROXY(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${C.owner.robloxId}&size=420x420&format=Png&isCircular=false`))
      .then(r=>r.json())
      .then(d=>{
        if(d.data?.[0]?.imageUrl){
          const el=document.getElementById("owner-avatar");
          if(el) el.src=d.data[0].imageUrl;
        }
      }).catch(()=>{});

    // Roblox profile
    fetch(PROXY(`https://users.roblox.com/v1/users/${C.owner.robloxId}`))
      .then(r=>r.json())
      .then(d=>{
        if(d.displayName) document.getElementById("owner-display-name").textContent=d.displayName;
        if(d.name)        document.getElementById("owner-username").textContent=`@${d.name}`;
        if(d.id)          document.getElementById("owner-id").textContent=d.id;
        if(d.created)     document.getElementById("owner-created").textContent=new Date(d.created).toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"});
      }).catch(()=>{});

    // Offsets
    const OFF = C.offsetsUrl||"https://offsets.imtheo.lol/Offsets.json";
    fetch(PROXY(OFF))
      .then(r=>r.json())
      .then(setOff)
      .catch(()=>fetch(OFF).then(r=>r.json()).then(setOff).catch(()=>setOff({"Roblox Version":"version-d584fb6c717a43d9","Dumper Version":"2.1.7","Dumped With":"RbxDumperV2","Dumped At":"01:04 06/08/2026","Total Offsets":"388"})));

    refreshHovers();
  }

  function setOff(d) {
    const v=document.getElementById("rbx-ver"), dv=document.getElementById("rbx-dump"),
          da=document.getElementById("rbx-date"), oc=document.getElementById("rbx-count");
    if(v)  v.textContent  = d["Roblox Version"]||"—";
    if(dv) dv.textContent = `${d["Dumper Version"]||"?"} (${d["Dumped With"]||"?"})`;
    if(da) da.textContent = d["Dumped At"]||"—";
    if(oc) oc.textContent = `${d["Total Offsets"]||"?"} offsets`;
    const btn=document.getElementById("offsets-btn");
    if(btn) btn.href=C.offsetsViewerUrl||"https://offsets.imtheo.lol/";
  }

  /* ══════════════════════════════════════════
     PRICING
  ══════════════════════════════════════════ */
  let priceDone = false;
  function loadPricing() {
    if (priceDone) return; priceDone = true;
    const btn = document.getElementById("buy-btn");
    if (btn) btn.addEventListener("click", ()=>window.open(C.shopUrl,"_blank"));
    refreshHovers();
  }

  /* ══════════════════════════════════════════
     DISCORD
  ══════════════════════════════════════════ */
  let dscDone = false;
  function loadDiscord() {
    if (dscDone) return; dscDone = true;
    const jb=document.getElementById("dsc-join"), cb=document.getElementById("dsc-copy");
    if(jb) jb.addEventListener("click",()=>window.open(C.discord,"_blank"));
    if(cb) cb.addEventListener("click",()=>{
      navigator.clipboard.writeText(C.discord).then(()=>{cb.textContent="Copied!";setTimeout(()=>cb.textContent="Copy Link",2000);});
    });

    // Discord invite API (public, no token)
    fetch(`https://discord.com/api/v10/invites/${C.discordInviteCode}?with_counts=true`)
      .then(r=>r.json())
      .then(d=>{
        const onEl=document.getElementById("dsc-online"), mbEl=document.getElementById("dsc-members");
        if(onEl&&d.approximate_presence_count!==undefined) onEl.textContent=d.approximate_presence_count.toLocaleString();
        if(mbEl&&d.approximate_member_count!==undefined)   mbEl.textContent=d.approximate_member_count.toLocaleString();
      })
      .catch(()=>{
        // fallback: widget
        fetch(`https://discord.com/api/guilds/${C.discordGuildId}/widget.json`)
          .then(r=>r.json())
          .then(d=>{
            const onEl=document.getElementById("dsc-online");
            if(onEl&&d.presence_count) onEl.textContent=d.presence_count.toLocaleString();
          }).catch(()=>{});
      });
    refreshHovers();
  }

});
