/* ══════════════════════════════════════════════
   ALTERNATE — app.js
══════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const C = window.CONFIG;

  /* ─── ELEMENTS ──────────────────────────── */
  const ring    = document.getElementById("cursor-ring");
  const dot     = document.getElementById("cursor-dot");
  const cnv     = document.getElementById("grid-canvas");
  const ctx     = cnv.getContext("2d");
  const startup = document.getElementById("startup-screen");
  const gun     = document.getElementById("intro-gun");
  const introTxt= document.getElementById("intro-text");
  const typed   = document.getElementById("intro-typed");
  const main    = document.getElementById("main-content");
  const guiImg  = document.getElementById("gui-img");

  /* ══════════════════════════════════════════
     CURSOR  (damped ring + instant dot)
  ══════════════════════════════════════════ */
  let mx=innerWidth/2, my=innerHeight/2, dx=mx, dy=my;
  let tRX=0, tRY=0, rX=0, rY=0;

  window.addEventListener("mousemove", e => {
    mx=e.clientX; my=e.clientY;
    if (guiImg) {
      const r=guiImg.getBoundingClientRect();
      tRX=-((e.clientY-r.top -r.height/2)/r.height)*8;
      tRY= ((e.clientX-r.left-r.width /2)/r.width )*8;
    }
  });

  function refreshHovers() {
    document.querySelectorAll("button,a,input[type=range]").forEach(el=>{
      el.onmouseenter=()=>document.body.classList.add("hovered");
      el.onmouseleave=()=>document.body.classList.remove("hovered");
    });
  }

  (function animCursor(){
    dx+=(mx-dx)*0.13; dy+=(my-dy)*0.13;
    rX+=(tRX-rX)*0.08; rY+=(tRY-rY)*0.08;
    ring.style.left=dx+"px"; ring.style.top=dy+"px";
    dot.style.left =mx+"px"; dot.style.top =my+"px";
    if(guiImg) guiImg.style.transform=`rotateX(${rX}deg) rotateY(${rY}deg)`;
    requestAnimationFrame(animCursor);
  })();

  /* ══════════════════════════════════════════
     CANVAS  (pink tile glow + grid lines)
  ══════════════════════════════════════════ */
  const CELL=50;
  let cols,rows,cells=[];
  function resize(){
    cnv.width=innerWidth; cnv.height=innerHeight;
    cols=Math.ceil(cnv.width/CELL)+1;
    rows=Math.ceil(cnv.height/CELL)+1;
    cells=Array.from({length:cols},()=>new Float32Array(rows));
  }
  window.addEventListener("resize",resize);
  resize();

  (function drawCanvas(){
    ctx.clearRect(0,0,cnv.width,cnv.height);
    ctx.strokeStyle="rgba(255,255,255,0.015)"; ctx.lineWidth=1; ctx.beginPath();
    for(let c=0;c<=cols;c++){ctx.moveTo(c*CELL,0);ctx.lineTo(c*CELL,cnv.height);}
    for(let r=0;r<=rows;r++){ctx.moveTo(0,r*CELL);ctx.lineTo(cnv.width,r*CELL);}
    ctx.stroke();
    const mc=Math.floor(mx/CELL),mr=Math.floor(my/CELL);
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
     1) gun fades in huge (scale 3.5)
     2) zooms out to small (scale 0.38) — 1.0s
     3) slides slowly left off screen — 2.0s
     4) /alternate typewriters in during slide
     5) screen fades out → main appears
  ══════════════════════════════════════════ */
  gun.style.transformOrigin="center center";
  gun.style.transition="none";
  gun.style.transform="scale(3.5)";
  gun.style.opacity="0";
  introTxt.style.opacity="0";
  introTxt.style.transform="scale(0.97)";

  setTimeout(()=>{ gun.style.transition="opacity 0.3s ease"; gun.style.opacity="1"; }, 80);

  setTimeout(()=>{
    gun.style.transition="transform 1.0s cubic-bezier(0.34,1.1,0.64,1)";
    gun.style.transform="scale(0.38)";
  }, 220);

  setTimeout(()=>{
    gun.style.transition="transform 2.0s cubic-bezier(0.4,0,0.2,1), opacity 0.6s ease 1.4s";
    gun.style.transform="scale(0.38) translateX(-280vw)";
    gun.style.opacity="0";
  }, 1350);

  setTimeout(()=>{
    introTxt.style.transition="opacity 0.4s ease, transform 0.4s ease";
    introTxt.style.opacity="1";
    introTxt.style.transform="scale(1)";
    typewrite("alternate", typed, 75);
  }, 1700);

  setTimeout(finishIntro, 4200);

  function typewrite(text, el, speed) {
    let i=0; el.textContent="";
    const iv=setInterval(()=>{ if(i<text.length){el.textContent+=text[i];i++;}else clearInterval(iv); },speed);
  }

  function finishIntro() {
    startup.classList.add("fade-out");
    setTimeout(()=>{
      startup.style.display="none";
      main.classList.remove("hidden-main");
      main.classList.add("visible");
      tryAutoplay();
      refreshHovers();
    }, 800);
  }

  /* ══════════════════════════════════════════
     MUSIC PLAYER  (autoplay on intro end)
  ══════════════════════════════════════════ */
  const audio     = document.getElementById("audio");
  const playBtn   = document.getElementById("mp-play");
  const iconPlay  = document.getElementById("icon-play");
  const iconPause = document.getElementById("icon-pause");
  const volSlider = document.getElementById("mp-vol");
  const barFill   = document.getElementById("mp-bar-fill");
  const mpTime    = document.getElementById("mp-time");

  audio.volume = 0.5;

  function setPlaying(isPlaying) {
    if (isPlaying) {
      iconPlay.classList.add("hidden");
      iconPause.classList.remove("hidden");
    } else {
      iconPlay.classList.remove("hidden");
      iconPause.classList.add("hidden");
    }
  }

  // Try autoplay (browsers require user gesture first, so we attempt silently)
  function tryAutoplay() {
    audio.play().then(()=>setPlaying(true)).catch(()=>{
      // Autoplay blocked — wait for first click anywhere
      const unlock=()=>{ audio.play().then(()=>setPlaying(true)).catch(()=>{}); document.removeEventListener("click",unlock); };
      document.addEventListener("click",unlock);
    });
  }

  playBtn.addEventListener("click", ()=>{
    if(audio.paused){ audio.play(); setPlaying(true); }
    else { audio.pause(); setPlaying(false); }
  });

  volSlider.addEventListener("input",()=>{ audio.volume=volSlider.value; });

  audio.addEventListener("timeupdate",()=>{
    if(!audio.duration) return;
    barFill.style.width=((audio.currentTime/audio.duration)*100)+"%";
    const m=Math.floor(audio.currentTime/60);
    const s=Math.floor(audio.currentTime%60).toString().padStart(2,"0");
    mpTime.textContent=`${m}:${s}`;
  });

  document.getElementById("mp-bar-bg").addEventListener("click",e=>{
    if(!audio.duration) return;
    const r=e.currentTarget.getBoundingClientRect();
    audio.currentTime=((e.clientX-r.left)/r.width)*audio.duration;
  });

  /* ══════════════════════════════════════════
     MODALS
  ══════════════════════════════════════════ */
  let activeModal=null;

  function openModal(id){
    if(activeModal) activeModal.classList.remove("active");
    activeModal=document.getElementById(id);
    if(activeModal) activeModal.classList.add("active");
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.toggle("active",b.dataset.modal===id));
    refreshHovers();
  }
  function closeAll(){
    if(activeModal){activeModal.classList.remove("active");activeModal=null;}
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
  }

  document.querySelectorAll(".tab-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      if(activeModal&&activeModal.id===btn.dataset.modal){closeAll();return;}
      openModal(btn.dataset.modal);
      if(btn.dataset.modal==="modal-features") loadFeatures();
      if(btn.dataset.modal==="modal-info")     loadInfo();
      if(btn.dataset.modal==="modal-pricing")  loadPricing();
      if(btn.dataset.modal==="modal-discord")  loadDiscord();
    });
  });
  document.querySelectorAll(".close-btn").forEach(b=>b.addEventListener("click",closeAll));
  document.querySelectorAll(".modal-bg").forEach(b=>b.addEventListener("click",closeAll));
  window.addEventListener("keydown",e=>{if(e.key==="Escape")closeAll();});

  /* ── Accordion ──────────────────────────── */
  document.querySelectorAll(".acc-h").forEach(h=>{
    h.addEventListener("click",()=>{
      const body=document.getElementById(h.dataset.t);
      const open=body.classList.contains("open");
      document.querySelectorAll(".acc-b").forEach(b=>b.classList.remove("open"));
      document.querySelectorAll(".acc-h").forEach(a=>a.classList.remove("active"));
      if(!open){body.classList.add("open");h.classList.add("active");}
    });
  });

  /* ══════════════════════════════════════════
     FEATURES  (rich rows from script.txt)
  ══════════════════════════════════════════ */
  let featDone=false, featData={};

  function loadFeatures(){
    if(featDone) return;
    fetch("script.txt")
      .then(r=>{if(!r.ok)throw 0;return r.text();})
      .then(parseFeat).catch(()=>parseFeat(FALLBACK));
  }

  /* Classify each feature line into a type + extract info */
  function classifyLine(raw) {
    const text = raw.replace(/^[-*]\s*/, "").trim();
    // Extract sub-options from parens: "Name (opt1, opt2, opt3)"
    const parenMatch = text.match(/^(.+?)\s*\((.+)\)$/);
    const name  = parenMatch ? parenMatch[1].trim() : text;
    const inner = parenMatch ? parenMatch[2].trim() : null;

    // Is toggle? (simple boolean features with no options)
    const isToggle = !inner && (
      /enabled|disable|bypass|apply|changer|headless|korblox|boost|noclip|fly|afk|stop|sticky|lock|look at|tracer|hud|text|gradient/i.test(name)
    );

    // Is slider? (numeric ranges or speed values)
    const isSlider = inner && /^\d/.test(inner) ||
      (!inner && /speed|time \(ms\)|smoothness|amount|transparency|jump delay|lock time|fly speed|switch speed|ratio|distance|ms\)/i.test(name));

    // Has dropdown options?
    const opts = inner ? inner.split(",").map(s=>s.trim()).filter(Boolean) : [];

    if (isToggle) return { name, type:"toggle", opts:[] };
    if (isSlider) return { name, type:"slider", opts, inner };
    if (opts.length > 0) return { name, type:"dropdown", opts };
    return { name, type:"info", opts:[] };
  }

  function parseFeat(txt) {
    featDone=true;
    document.getElementById("feat-loader")?.remove();
    const nav=document.getElementById("feat-tabs-nav");
    const body=document.getElementById("feat-body");
    nav.innerHTML=""; featData={};
    let cat=null;

    txt.split("\n").forEach(line=>{
      const t=line.trim();
      if(!t) return;
      if(t[0]==="["&&t.at(-1)==="]"){cat=t.slice(1,-1);featData[cat]=[];}
      else if(cat&&(t[0]==="-"||t[0]==="*")) featData[cat].push(classifyLine(t));
    });

    Object.keys(featData).forEach((cat,i)=>{
      const btn=document.createElement("button");
      btn.className="ftab"+(i===0?" active":"");
      btn.textContent=cat;
      btn.addEventListener("click",()=>{
        document.querySelectorAll(".ftab").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active"); showFeat(cat);
      });
      nav.appendChild(btn);
    });

    // Remove loader placeholder
    const loader = body.querySelector("#feat-loader");
    if(loader) loader.remove();

    const cats=Object.keys(featData);
    if(cats.length) showFeat(cats[0]);
    refreshHovers();
  }

  function showFeat(cat) {
    // Use the feat-body scroll container directly
    const body = document.getElementById("feat-body");
    // Remove any existing content section
    let old = body.querySelector(".feat-section");
    if(old) old.remove();

    const section = document.createElement("div");
    section.className = "feat-section";

    // Legend
    const legend = document.createElement("div");
    legend.className = "feat-legend";
    legend.innerHTML = `
      <div class="feat-legend-item"><span class="feat-legend-dot legend-green"></span>Toggle</div>
      <div class="feat-legend-item"><span class="feat-legend-dot legend-pink"></span>Options</div>
      <div class="feat-legend-item"><span class="feat-legend-dot legend-blue"></span>Slider</div>
      <div class="feat-legend-item"><span class="feat-legend-dot legend-grey"></span>Info</div>`;
    section.appendChild(legend);

    (featData[cat]||[]).forEach(item=>{
      const row = document.createElement("div");
      row.className = "feat-row";

      const labelWrap = document.createElement("div");
      labelWrap.className = "feat-row-label";

      const typeDot = document.createElement("span");
      typeDot.className = `feat-type-dot ${item.type}`;

      const labelText = document.createElement("span");
      labelText.className = "feat-label-text";
      labelText.textContent = item.name;

      labelWrap.appendChild(typeDot);
      labelWrap.appendChild(labelText);
      row.appendChild(labelWrap);

      // Right side widget
      if (item.type === "toggle") {
        const tog = document.createElement("div");
        tog.className = "feat-toggle";
        row.appendChild(tog);
        tog.addEventListener("click", ()=>tog.classList.toggle("on"));
      } else if (item.type === "dropdown" && item.opts.length) {
        const badge = document.createElement("div");
        badge.className = "feat-dropdown-badge";
        // Show first 4 options max to keep it clean
        item.opts.slice(0,5).forEach(o=>{
          const s=document.createElement("span");
          s.className="feat-opt"; s.textContent=o; badge.appendChild(s);
        });
        if(item.opts.length>5){
          const m=document.createElement("span");
          m.className="feat-opt"; m.textContent=`+${item.opts.length-5}`; badge.appendChild(m);
        }
        row.appendChild(badge);
      } else if (item.type === "slider") {
        const sw = document.createElement("div");
        sw.className = "feat-slider-wrap";
        const sliderLabel = item.inner || "—";
        sw.innerHTML = `<div class="feat-slider-bar"><div class="feat-slider-fill"></div></div><span class="feat-slider-label">${sliderLabel.split(",")[0]}</span>`;
        row.appendChild(sw);
      }

      section.appendChild(row);
    });

    body.appendChild(section);
  }

  const FALLBACK=`[Aimbot]
- Enabled (AimbotEnabled)
- Lock Method (Mouse, Camera)
- Target Mode (FOV, Mouse, Distance, Center)
- Aim Type (Normal, Closest Part)
- Ground Part (Head, Torso, UpperTorso, LowerTorso, HumanoidRootPart)
- Air Part (Head, Torso, UpperTorso, LowerTorso, HumanoidRootPart)
- Ignore Fall State
- Checks (Enemy, Team, NPC, Wall, Dead, Knocked)
- Auto Stop on Dead
- Sticky Aim
- Lock Target
- Look At Target (Keybind Trigger)
- Target HUD (Realtime Target Info Display)
- Target Tracer (Screen Start: Bottom, Top, Cursor; End: Feet, Head)
- Smoothing / Inertia (Use Smoothing, Smoothing+, Dynamic Smoothing X/Y)
- Easing (Linear, Sine, Quad, Cubic, Quart, Quint, Expo, Circular, Back, Bounce, Elastic, Adaptive, Zigzag, Pulse, Sharp)
- Easing Direction (In, Out, InOut)
- Prediction (X/Z Prediction, Y Prediction, Air X/Z Prediction, Air Y Prediction, Dynamic Prediction, Pull Resistance)
- Offsets (Offset Up, Offset Down, Offset Left, Offset Right, Air Offset Value, Air Offset Smoothness)
- Lock Time (ms)
- Switch Speed (Ground Switch Speed, Up Switch Speed, Down Switch Speed)
- Delay Jump (Jump Delay ms, X Jump Delay)
[Silent Aim]
- Enabled (SilentEnabled)
- Target Type (Closest to Mouse, Distance, FOV)
- Hit Part (Head, Torso, UpperTorso, LowerTorso, HumanoidRootPart)
- Use Closest Point (Scalable hitboxes)
- Checks (Enemy, Team, NPC, Wall, Dead, Knocked)
[Visuals (ESP)]
- Enable ESP (ESP_Enabled)
- ESP Font (ProggyClean, SmallestPixel, Tahoma, TahomaBold, Arial, SourceSans)
- Show On (NPC, Enemy, Team, Self)
- Max Distance (custom sliders up to 10000 studs)
- Box ESP (Full, Cornered Box)
- Glow Amount (Glow Percentage)
- Box Fill (Fill Transparency 1 & 2)
- Name ESP (Position: Top, Bottom, Left, Right; Type: Display Name, Username, Both)
- Distance ESP (Position: Top, Bottom, Left, Right; Type: Studs, Meters)
- Health Bar (Smooth Vertical Health Indicator)
- Health Bar Gradient (Visual ColorCorrection)
- Health Text (Numeric Health Value display)
- Armor Bar (Vertical Shield indicator)
- Weapon ESP (Show equipped tool names)
- State Flags (Knocked, Dead, Reloading, Running state indicators)
[Player Chams]
- Player Chams (Chams Fill & Outline rendering)
- Fill Color (Full RGB color picker)
- Outline Color (Full RGB outline picker)
- Show On Self (Cham your own character)
- Show On Others (Cham other players)
- Show On NPCs (Cham bots)
- Checks (Wall check, Dead check)
- Fill Transparency (0-100% slider)
- Outline Transparency (0-100% slider)
[Movement]
- Speed Boost (Walk Speed manipulation)
- Ground Speed (Switch ground speed)
- Up Speed (Switch jumps speed)
- Down Speed (Switch fall speed)
- Speed Method (Default WalkSpeed, Velocity-based)
- Jump Boost (Jump Power manipulation)
- Jump Method (Default JumpPower, Velocity-based, CFrame-based)
- Noclip (Complete Stepped-based collision bypass)
- Fly (Velocity or CFrame-based flight controls)
- Fly Speed (10-300 studs/sec flight speed)
- Anti AFK (Prevents idle disconnection)
- Aspect Ratio Changer (Resolutions 20-100%)
[Skins]
- Purple Skin (Revolver, Double-Barrel SG, TacticalShotgun)
- Red Skin (Revolver, Double-Barrel SG, TacticalShotgun)
- Green Skin (Revolver, Double-Barrel SG, TacticalShotgun)
- Blue Skin (Revolver, Double-Barrel SG, TacticalShotgun)
- Grey Skin (Revolver, Double-Barrel SG, TacticalShotgun)
- Ghost Skin (Pulsating transparent look)
- Rainbow Skin (Neon rainbow cycle)
- Cosmic Skin (Animated cosmic texture with custom beams)
[Skyboxes]
- Piss (Vintage Gold)
- Space (Deep Void)
- Dark (Blackout Skies)
- Space V2 (Nebula skies)
- Pink (BlackPink glow)
- Forest (Woodland environment)
- Night (Starry night)
- Lava (Volcanic ash)
- Rainy (Storm clouds)
- Green (Emerald mist)
- Nebulous (Distant galaxies)
- Blue Clouds (High altitude day)
- Candy Floss (Pink/Blue cotton skies)
- Green Skies (Radioactive glow)
- White Skies (Clean minimalist day)
- Blood Red (Crimson eclipse)
- Scary (Halloween theme)
- Realistic Day (Volumetric clouds)
- Realistic Space (Distant stars)
- Classic (Roblox legacy sky)
- Sunset (Amber gradient)
- HD Space (High-res cosmos)
- Cold Winter (Shivering frost)
- Shiverfrost (Aurora borealis)
- Blue Nebula (Galactic dust)
- Red Space (Mars orbit)
- Green Clouds (Emerald fog)
- Purple Clouds (Lilac twilight)
- Nibiru (Apocalyptic storm)
- Nebulae (Nebula clouds)
- Moody (Dark overcast)
- Whistle (Dreamy sky)
- Crossroads (2007 vintage day)
[Avatar]
- Headless (Non-destructive transparency bypass)
- Korblox Right Leg (Simulates Right Leg asset 902942089)
- Korblox Left Leg (Simulates Left Leg asset 902942077)
- Animation Changer (Applies custom Roblox animations)
- Zombie Animation (Walk, Run, Idle, Jump, Fall, Swim)
- Mage Animation (Walk, Run, Idle, Jump, Fall, Swim)
- Ninja Animation (Walk, Run, Idle, Jump, Fall, Swim)`;

  /* ══════════════════════════════════════════
     INFO  (Roblox + Offsets with multiple proxy fallbacks)
  ══════════════════════════════════════════ */
  let infoDone=false;

  function loadInfo(){
    if(infoDone) return; infoDone=true;

    // Games
    const gEl=document.getElementById("games-list");
    if(gEl) C.games.forEach(g=>{
      gEl.innerHTML+=`<div class="game-card"><div class="game-icon">${g.icon}</div><h4>${g.name}</h4><p>${g.details}</p><div class="tag-row">${g.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div></div>`;
    });

    // Executors
    const eEl=document.getElementById("exec-list");
    if(eEl) C.executors.forEach(n=>{
      const s=document.createElement("span"); s.className="exec-b"; s.textContent=n; eEl.appendChild(s);
    });

    // Owner links
    const lEl=document.getElementById("owner-links");
    if(lEl) C.owner.links.forEach(l=>{
      const a=document.createElement("a"); a.className="dev-link"; a.href=l.url; a.target="_blank";
      a.textContent=`${l.icon}  ${l.label}`; lEl.appendChild(a);
    });

    // Roblox data — try multiple proxies
    fetchWithFallback(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${C.owner.robloxId}&size=420x420&format=Png&isCircular=false`
    ).then(d=>{
      if(d?.data?.[0]?.imageUrl){
        const el=document.getElementById("owner-avatar");
        if(el) el.src=d.data[0].imageUrl;
      }
    }).catch(()=>{});

    fetchWithFallback(
      `https://users.roblox.com/v1/users/${C.owner.robloxId}`
    ).then(d=>{
      if(d.displayName) setText("owner-display-name", d.displayName);
      if(d.name)        setText("owner-username", `@${d.name}`);
      if(d.id)          setText("owner-id", d.id);
      if(d.created)     setText("owner-created", new Date(d.created).toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"}));
    }).catch(()=>{
      // Hardcoded fallback — always shows koni's data
      setText("owner-display-name","koni");
      setText("owner-username","@5fovtraceboss");
    });

    // Offsets
    const OFF=C.offsetsUrl||"https://offsets.imtheo.lol/Offsets.json";
    fetchWithFallback(OFF)
      .then(setOff)
      .catch(()=>setOff({
        "Roblox Version":"version-d584fb6c717a43d9",
        "Dumper Version":"2.1.7",
        "Dumped With":"RbxDumperV2",
        "Dumped At":"01:04 06/08/2026",
        "Total Offsets":"388"
      }));

    refreshHovers();
  }

  /* Multiple proxy fallbacks for CORS */
  function fetchWithFallback(url) {
    const proxies = [
      `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      url // direct (works if CORS is allowed)
    ];

    function tryNext(i) {
      if(i>=proxies.length) return Promise.reject(new Error("All proxies failed"));
      return fetch(proxies[i])
        .then(r=>{ if(!r.ok) throw 0; return r.json(); })
        .then(data=>{
          // allorigins wraps the response in {contents: "..."}
          if(data && typeof data.contents === "string") return JSON.parse(data.contents);
          return data;
        })
        .catch(()=>tryNext(i+1));
    }
    return tryNext(0);
  }

  function setText(id, val) {
    const el=document.getElementById(id);
    if(el) el.textContent=val;
  }

  function setOff(d) {
    setText("rbx-ver",  d["Roblox Version"]||"—");
    setText("rbx-dump", `${d["Dumper Version"]||"?"} (${d["Dumped With"]||"?"})`);
    setText("rbx-date", d["Dumped At"]||"—");
    setText("rbx-count",`${d["Total Offsets"]||"?"} offsets`);
    const btn=document.getElementById("offsets-btn");
    if(btn) btn.href=C.offsetsViewerUrl||"https://offsets.imtheo.lol/";
  }

  /* ══════════════════════════════════════════
     PRICING
  ══════════════════════════════════════════ */
  let priceDone=false;
  function loadPricing(){
    if(priceDone) return; priceDone=true;
    const btn=document.getElementById("buy-btn");
    if(btn) btn.addEventListener("click",()=>window.open(C.shopUrl,"_blank"));
    refreshHovers();
  }

  /* ══════════════════════════════════════════
     DISCORD  (live counts via invite API)
  ══════════════════════════════════════════ */
  let dscDone=false;
  function loadDiscord(){
    if(dscDone) return; dscDone=true;
    const jb=document.getElementById("dsc-join"), cb=document.getElementById("dsc-copy");
    if(jb) jb.addEventListener("click",()=>window.open(C.discord,"_blank"));
    if(cb) cb.addEventListener("click",()=>{
      navigator.clipboard.writeText(C.discord).then(()=>{cb.textContent="Copied!";setTimeout(()=>cb.textContent="Copy Link",2000);});
    });

    fetch(`https://discord.com/api/v10/invites/${C.discordInviteCode}?with_counts=true`)
      .then(r=>r.json())
      .then(d=>{
        if(d.approximate_presence_count!==undefined) setText("dsc-online", d.approximate_presence_count.toLocaleString());
        if(d.approximate_member_count !==undefined)  setText("dsc-members",d.approximate_member_count.toLocaleString());
      })
      .catch(()=>{
        fetch(`https://discord.com/api/guilds/${C.discordGuildId}/widget.json`)
          .then(r=>r.json())
          .then(d=>{ if(d.presence_count) setText("dsc-online",d.presence_count.toLocaleString()); })
          .catch(()=>{});
      });

    refreshHovers();
  }

});
