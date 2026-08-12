/* ══════════════════════════════════════════════
   ALTERNATE — app.js
══════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const safeConfig = (window.CONFIG && typeof window.CONFIG === "object") ? window.CONFIG : {};
  if (safeConfig && !Object.isFrozen(safeConfig)) Object.freeze(safeConfig);
  const C = safeConfig;

  /* ─── ELEMENTS ──────────────────────────────── */
  const ring    = document.getElementById("cursor-ring");
  const dot_el  = document.getElementById("cursor-dot");
  const cnv     = document.getElementById("grid-canvas");
  const snowCnv = document.getElementById("snow-canvas");
  const ctx     = cnv.getContext("2d");
  const sctx    = snowCnv.getContext("2d");
  const startup = document.getElementById("startup-screen");
  const gun     = document.getElementById("intro-gun");
  const introTxt= document.getElementById("intro-text");
  const typedEl = document.getElementById("intro-typed");
  const main    = document.getElementById("main-content");
  const guiImg  = document.getElementById("gui-img");

  /* ══════════════════════════════════════════════
     CURSOR (damped ring + instant dot)
  ══════════════════════════════════════════════ */
  let mx=innerWidth/2, my=innerHeight/2, dx=mx, dy=my;
  let tRX=0, tRY=0, rX=0, rY=0;

  window.addEventListener("mousemove", e=>{
    mx=e.clientX; my=e.clientY;
    if(guiImg){
      const r=guiImg.getBoundingClientRect();
      tRX=-((e.clientY-r.top -r.height/2)/r.height)*7;
      tRY= ((e.clientX-r.left-r.width /2)/r.width )*7;
    }
  });

  function refreshHovers(){
    document.querySelectorAll("button,a,input,select").forEach(el=>{
      el.onmouseenter=()=>document.body.classList.add("hovered");
      el.onmouseleave=()=>document.body.classList.remove("hovered");
    });
  }

  (function animCursor(){
    dx+=(mx-dx)*0.13; dy+=(my-dy)*0.13;
    rX+=(tRX-rX)*0.08; rY+=(tRY-rY)*0.08;
    ring.style.left=dx+"px"; ring.style.top=dy+"px";
    dot_el.style.left=mx+"px"; dot_el.style.top=my+"px";
    if(guiImg) guiImg.style.transform=`rotateX(${rX}deg) rotateY(${rY}deg)`;
    requestAnimationFrame(animCursor);
  })();

  /* ══════════════════════════════════════════════
     CANVAS — B&W grid + spotlight
  ══════════════════════════════════════════════ */
  const CELL=52;
  let cols,rows,cells=[];

  function resizeAll(){
    cnv.width=snowCnv.width=innerWidth;
    cnv.height=snowCnv.height=innerHeight;
    cols=Math.ceil(cnv.width/CELL)+1;
    rows=Math.ceil(cnv.height/CELL)+1;
    cells=Array.from({length:cols},()=>new Float32Array(rows));
  }
  window.addEventListener("resize",resizeAll);
  resizeAll();

  (function drawGrid(){
    ctx.clearRect(0,0,cnv.width,cnv.height);
    // grid lines
    ctx.strokeStyle="rgba(255,255,255,0.018)"; ctx.lineWidth=1; ctx.beginPath();
    for(let c=0;c<=cols;c++){ctx.moveTo(c*CELL,0);ctx.lineTo(c*CELL,cnv.height);}
    for(let r=0;r<=rows;r++){ctx.moveTo(0,r*CELL);ctx.lineTo(cnv.width,r*CELL);}
    ctx.stroke();
    // hover tiles — white
    const mc=Math.floor(mx/CELL),mr=Math.floor(my/CELL);
    [[0,0,1],[1,0,.3],[-1,0,.3],[0,1,.3],[0,-1,.3],[1,1,.1],[-1,1,.1],[1,-1,.1],[-1,-1,.1]].forEach(([dc,dr,v])=>{
      const nc=mc+dc,nr=mr+dr;
      if(nc>=0&&nc<cols&&nr>=0&&nr<rows) cells[nc][nr]=Math.max(cells[nc][nr],v);
    });
    for(let c=0;c<cols;c++) for(let r=0;r<rows;r++){
      const v=cells[c][r];
      if(v>0.005){
        ctx.fillStyle=`rgba(255,255,255,${v*0.07})`;
        ctx.fillRect(c*CELL,r*CELL,CELL,CELL);
        cells[c][r]*=0.91;
      }
    }
    // spotlight — white
    const g=ctx.createRadialGradient(dx,dy,0,dx,dy,200);
    g.addColorStop(0,"rgba(255,255,255,0.04)");g.addColorStop(1,"transparent");
    ctx.fillStyle=g; ctx.fillRect(0,0,cnv.width,cnv.height);
    requestAnimationFrame(drawGrid);
  })();

  /* ══════════════════════════════════════════════
     SNOWFLAKES
  ══════════════════════════════════════════════ */
  const flakes=Array.from({length:70},()=>({
    x:Math.random()*innerWidth,
    y:Math.random()*innerHeight,
    r:Math.random()*2+0.5,
    sp:Math.random()*0.6+0.2,
    drift:Math.random()*0.4-0.2,
    op:Math.random()*0.35+0.08
  }));

  (function drawSnow(){
    sctx.clearRect(0,0,snowCnv.width,snowCnv.height);
    flakes.forEach(f=>{
      sctx.beginPath();
      sctx.arc(f.x,f.y,f.r,0,Math.PI*2);
      sctx.fillStyle=`rgba(255,255,255,${f.op})`;
      sctx.fill();
      f.y+=f.sp; f.x+=f.drift;
      if(f.y>snowCnv.height+4){ f.y=-4; f.x=Math.random()*snowCnv.width; }
      if(f.x>snowCnv.width+4){ f.x=-4; }
      if(f.x<-4){ f.x=snowCnv.width+4; }
    });
    requestAnimationFrame(drawSnow);
  })();

  /* ══════════════════════════════════════════════
     INTRO
     gun fades in huge → zooms out → slides left
     text typewriters in as gun slides
     screen fades out → main visible
  ══════════════════════════════════════════════ */
  startup.style.opacity = "1";
  setTimeout(()=>{
    startup.classList.add("fade-out");
    setTimeout(()=>{
      startup.style.display="none";
      main.classList.remove("hidden-main");
      main.classList.add("visible");
      attemptAutoplay();
      refreshHovers();
    },700);
  },250);

  function finishIntro(){
    startup.classList.add("fade-out");
    setTimeout(()=>{
      startup.style.display="none";
      main.classList.remove("hidden-main");
      main.classList.add("visible");
      attemptAutoplay();
      refreshHovers();
    },700);
  }

  /* ══════════════════════════════════════════════
     MUSIC PLAYER — simple black/white bar
  ══════════════════════════════════════════════ */
  const audio    = document.getElementById("audio");
  const mpPlay   = document.getElementById("mp-play");
  const barFill  = document.getElementById("mp-bar-fill");
  const mpTime   = document.getElementById("mp-time");
  const mpVol    = document.getElementById("mp-vol");

  if(audio){
    audio.volume = 0.5;
    audio.muted = true;
    audio.autoplay = true;
    audio.loop = true;
    audio.playsInline = true;
    audio.dataset.played = "0";
    audio.addEventListener("canplay",()=>{
      if(audio.dataset.played === "0") attemptAutoplay();
    });
  }

  function setPlaying(v){
    if(mpPlay){
      mpPlay.classList.toggle("playing",v);
      mpPlay.textContent = v ? "❚❚" : "▶";
    }
  }

  function attemptAutoplay(){
    if(!audio) return;
    audio.play().then(()=>{
      audio.muted = false;
      setPlaying(true);
    }).catch(()=>{
      const unlock=()=>{
        audio.muted = false;
        audio.play().then(()=>setPlaying(true)).catch(()=>{});
        document.removeEventListener("pointerdown",unlock);
      };
      document.addEventListener("pointerdown",unlock, { once:true });
    });
  }

  if(mpPlay){
    mpPlay.addEventListener("click",()=>{
      if(!audio) return;
      if(audio.paused){ audio.play(); setPlaying(true); }
      else { audio.pause(); setPlaying(false); }
    });
  }

  if(mpVol){ mpVol.addEventListener("input",()=>{ if(audio) audio.volume=mpVol.value; }); }

  if(audio){
    audio.addEventListener("canplay",()=>{
      if(audio.paused && !audio.dataset.played){
        audio.dataset.played = "1";
        audio.play().catch(()=>{});
      }
    });
    audio.addEventListener("timeupdate",()=>{
      if(!audio.duration) return;
      if(barFill) barFill.style.width=((audio.currentTime/audio.duration)*100)+"%";
      const m=Math.floor(audio.currentTime/60);
      const s=Math.floor(audio.currentTime%60).toString().padStart(2,"0");
      if(mpTime) mpTime.textContent=`${m}:${s}`;
    });
  }

  const progressEl = document.getElementById("mp-progress");
  if(progressEl){
    progressEl.addEventListener("click",e=>{
      if(!audio||!audio.duration) return;
      const r=e.currentTarget.getBoundingClientRect();
      audio.currentTime=((e.clientX-r.left)/r.width)*audio.duration;
    });
  }

  /* ══════════════════════════════════════════════
     DRAG-SCROLL TABS
  ══════════════════════════════════════════════ */
  const tabTrack = document.getElementById("tabs-track");
  if(tabTrack){
    tabTrack.style.touchAction = "pan-x";
    let isDown=false, startX=0, scrollLeft=0, moved=false;
    tabTrack.addEventListener("pointerdown", e=>{
      if(e.button !== 0) return;
      if(e.target.closest && e.target.closest('.tab-btn')) return;
      isDown = true;
      startX = e.clientX;
      scrollLeft = tabTrack.scrollLeft;
      moved = false;
      tabTrack.setPointerCapture?.(e.pointerId);
    });
    tabTrack.addEventListener("pointermove", e=>{
      if(!isDown) return;
      const dx = e.clientX - startX;
      if(Math.abs(dx) > 6){
        moved = true;
        tabTrack.scrollLeft = scrollLeft - dx;
      }
    });
    tabTrack.addEventListener("pointerup", e=>{
      if(!isDown) return;
      isDown = false;
      tabTrack.releasePointerCapture?.(e.pointerId);
      if(moved) e.preventDefault();
    });
    tabTrack.addEventListener("pointercancel", ()=>{ isDown=false; });
  }

  /* ══════════════════════════════════════════════
     MODALS
  ══════════════════════════════════════════════ */
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

  let featDone=false, featData={};
  let infoDone=false;
  let priceDone=false;
  let dscDone=false;

  // Preload sections so tabs show content immediately
  loadFeatures();
  loadInfo();
  loadPricing();
  loadDiscord();

  document.querySelectorAll(".acc-h").forEach(h=>{
    h.addEventListener("click",()=>{
      const body=document.getElementById(h.dataset.t);
      const isOpen=body.classList.contains("open");
      document.querySelectorAll(".acc-b").forEach(b=>b.classList.remove("open"));
      document.querySelectorAll(".acc-h").forEach(a=>a.classList.remove("active"));
      if(!isOpen){body.classList.add("open");h.classList.add("active");}
    });
  });

  /* ══════════════════════════════════════════════
     FEATURES — real interactive inputs
  ══════════════════════════════════════════════ */
  function loadFeatures(){
    if(featDone) return;
    fetch("script.txt")
      .then(r=>{if(!r.ok)throw 0;return r.text();})
      .then(parseFeat).catch(()=>parseFeat(FALLBACK_TXT));
  }

  // Classify each line
  function classify(raw){
    const text=raw.replace(/^[-*]\s*/,"").trim();
    const pm=text.match(/^(.+?)\s*\((.+)\)$/);
    const name=pm?pm[1].trim():text;
    const inner=pm?pm[2].trim():null;
    const opts=inner?inner.split(",").map(s=>s.trim()).filter(Boolean):[];

    const numericHint = inner && /\d+\s*(?:-|–|to)\s*\d+|\d+%|\d+\s*(?:ms|studs|seconds|secs|speed)|up to \d+|custom slider|slider|range/i.test(inner);
    const impliedSlider = !inner && /slider|range|ms|studs|speed|opacity|transparency|delay|value|distance|amount|ratio|speed|percentage/i.test(name);
    const impliedToggle = !inner && /(?:enabled|disabled|bypass|apply|changer|headless|korblox|boost|noclip|fly|afk|stop|sticky|lock|look at|tracer|hud|text|gradient|show|hide|use|enable|disable|on|off)$/i.test(name);

    if(opts.length>1) return {name,type:"d",opts};
    if(inner && (numericHint || /^\d/.test(inner))) return {name,type:"s",opts:[],range:inner};
    if(impliedSlider) return {name,type:"s",opts:[],range:"0–100"};
    if(impliedToggle) return {name,type:"t",opts:[]};
    return {name,type:"i",opts};
  }

  function makeDraggable(el){
    if(!el) return;
    let isDown=false, startX=0, scrollLeft=0;
    el.style.touchAction = "pan-x";
    el.addEventListener("pointerdown", e=>{
      if(e.button !== 0) return;
      if(e.target.closest && e.target.closest("button")) return;
      isDown = true;
      startX = e.clientX;
      scrollLeft = el.scrollLeft;
      el.setPointerCapture?.(e.pointerId);
    });
    el.addEventListener("pointermove", e=>{
      if(!isDown) return;
      const dx = e.clientX - startX;
      if(Math.abs(dx) > 6) el.scrollLeft = scrollLeft - dx;
    });
    el.addEventListener("pointerup", e=>{ if(!isDown) return; isDown=false; el.releasePointerCapture?.(e.pointerId); });
    el.addEventListener("pointercancel", ()=>{ isDown=false; });
  }

  function parseFeat(txt){
    featDone=true;
    document.getElementById("feat-loader")?.remove();
    const nav=document.getElementById("feat-tabs-nav");
    const body=document.getElementById("feat-body");
    nav.innerHTML=""; featData={};
    let cat=null;

    txt.split("\n").forEach(line=>{
      const t=line.trim();
      if(!t)return;
      if(t[0]==="["&&t.at(-1)==="]"){cat=t.slice(1,-1);featData[cat]=[];}
      else if(cat&&(t[0]==="-"||t[0]==="*")) featData[cat].push(classify(t));
    });

    // Build drag-scrollable tab nav
    makeDraggable(nav);
    Object.keys(featData).forEach((cat,i)=>{
      const btn=document.createElement("button");
      btn.className="ftab"+(i===0?" active":"");
      btn.textContent=cat;
      btn.addEventListener("click",()=>{
        document.querySelectorAll(".ftab").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active"); renderFeat(cat);
      });
      nav.appendChild(btn);
    });

    const cats=Object.keys(featData);
    if(cats.length) renderFeat(cats[0]);
    refreshHovers();
  }

  function renderFeat(cat){
    const body=document.getElementById("feat-body");
    let old=body.querySelector(".feat-section");
    if(old)old.remove();

    const sec=document.createElement("div");
    sec.className="feat-section";

    // Legend
    const leg=document.createElement("div");
    leg.className="feat-legend";
    leg.innerHTML=`<div class="feat-legend-item"><span class="fleg-dot fleg-green"></span>Toggle</div><div class="feat-legend-item"><span class="fleg-dot fleg-pink"></span>Dropdown</div><div class="feat-legend-item"><span class="fleg-dot fleg-blue"></span>Slider</div><div class="feat-legend-item"><span class="fleg-dot fleg-grey"></span>Info</div>`;
    sec.appendChild(leg);

    (featData[cat]||[]).forEach(item=>{
      const row=document.createElement("div");
      row.className="feat-row";

      // Left side: dot + label
      const left=document.createElement("div");
      left.className="feat-row-left";
      const tdot=document.createElement("span");
      tdot.className=`ftype-dot ${item.type}`;
      const lbl=document.createElement("span");
      lbl.className="feat-name"; lbl.textContent=item.name;
      left.appendChild(tdot); left.appendChild(lbl);
      row.appendChild(left);

      // Right side widget
      if(item.type==="t"){
        // Toggle switch
        const tog=document.createElement("div");
        tog.className="f-toggle";
        tog.addEventListener("click",()=>tog.classList.toggle("on"));
        row.appendChild(tog);
      } else if(item.type==="d"&&item.opts.length){
        // Real select dropdown
        const sel=document.createElement("select");
        sel.className="f-select";
        item.opts.forEach(o=>{
          const opt=document.createElement("option");
          opt.textContent=o; sel.appendChild(opt);
        });
        row.appendChild(sel);
      } else if(item.type==="s"){
        // Real range slider
        const wrap=document.createElement("div");
        wrap.className="f-slider-wrap";
        const rng=document.createElement("input");
        rng.type="range"; rng.className="f-range";
        rng.min="0"; rng.max="100"; rng.value="50";
        const val=document.createElement("span");
        val.className="f-slider-val"; val.textContent="50";
        rng.addEventListener("input",()=>val.textContent=rng.value);
        wrap.appendChild(rng); wrap.appendChild(val);
        row.appendChild(wrap);
      }

      sec.appendChild(row);
    });

    body.appendChild(sec);
    refreshHovers();
  }

  /* ══════════════════════════════════════════════
     INFO — Roblox + Offsets via robust proxy chain
     Using allorigins raw endpoint which works reliably
  ══════════════════════════════════════════════ */

  function loadInfo(){
    if(infoDone)return; infoDone=true;

    // Games
    const gEl=document.getElementById("games-list");
    if(gEl && Array.isArray(C.games)) C.games.forEach(g=>{
      gEl.innerHTML+=`<div class="game-card"><div class="game-icon">${g.icon}</div><h4>${g.name}</h4><p>${g.details}</p><div class="tag-row">${g.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div></div>`;
    });

    // Executors
    const eEl=document.getElementById("exec-list");
    if(eEl && Array.isArray(C.executors)) C.executors.forEach(n=>{
      const s=document.createElement("span"); s.className="exec-b"; s.textContent=n; eEl.appendChild(s);
    });

    // Owner links
    const lEl=document.getElementById("owner-links");
    if(lEl) C.owner.links.forEach(l=>{
      const a=document.createElement("a"); a.className="dev-link"; a.href=l.url; a.target="_blank";
      a.textContent = l.label;
      lEl.appendChild(a);
    });

    // Set defaults before remote fetches
    setText("owner-display-name", C.owner.name || "koni");
    setText("owner-username", `@${C.owner.robloxId||"5fovtraceboss"}`);
    setText("owner-id", C.owner.robloxId || "8393274455");
    setText("owner-created", "05/01/2025");
    const avatarEl=document.getElementById("owner-avatar");
    if(avatarEl) avatarEl.src = "gun.png";

    // Roblox avatar — try proxy then fallback
    apiGet(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${C.owner.robloxId}&size=420x420&format=Png&isCircular=false`)
      .then(d=>{
        const url=d?.data?.[0]?.imageUrl;
        if(url){ const el=document.getElementById("owner-avatar"); if(el)el.src=url; }
      }).catch(()=>{});

    // Roblox profile
    apiGet(`https://users.roblox.com/v1/users/${C.owner.robloxId}`)
      .then(d=>{
        setText("owner-display-name", d.displayName||C.owner.name||"koni");
        setText("owner-username",     d.name?`@${d.name}`:`@${C.owner.robloxId || "5fovtraceboss"}`);
        setText("owner-id",           d.id||C.owner.robloxId);
        if(d.created) setText("owner-created", new Date(d.created).toLocaleDateString("en-US",{month:"2-digit",day:"2-digit",year:"numeric"}));
      })
      .catch(()=>{
        setText("owner-display-name",C.owner.name||"koni");
        setText("owner-username", `@${C.owner.robloxId || "5fovtraceboss"}`);
      });

    // Offsets
    const OFF="https://offsets.imtheo.lol/Offsets.json";
    apiGet(OFF)
      .then(setOff)
      .catch(()=>setOff({
        "Roblox Version":"unknown",
        "Dumper Version":"unknown","Dumped With":"unknown",
        "Dumped At":"unknown","Total Offsets":"unknown"
      }));

    refreshHovers();
  }

  /* Reliable API helper: try allorigins raw, then corsproxy, then direct */
  function parseJSONResponse(response){
    return response.text().then(text=>{
      if(!response.ok) throw new Error(`Request failed ${response.status}`);
      try { return JSON.parse(text); }
      catch(err) { throw new Error("Invalid JSON response"); }
    });
  }

  function apiGet(url){
    const endpoints = [
      url,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://api.allorigins.cf/raw?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
      `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`
    ];
    let chain = Promise.reject();
    endpoints.forEach(endpoint => {
      chain = chain.catch(() => fetch(endpoint).then(parseJSONResponse));
    });
    return chain;
  }

  function setText(id,v){ const el=document.getElementById(id); if(el)el.textContent=v; }

  function setOff(d){
    setText("rbx-ver",  d["Roblox Version"]||"—");
    setText("rbx-dump", `${d["Dumper Version"]||"?"} (${d["Dumped With"]||"?"})`);
    setText("rbx-date", d["Dumped At"]||"—");
    setText("rbx-count",`${d["Total Offsets"]||"?"} offsets`);
    const btn=document.getElementById("offsets-btn");
    if(btn) btn.href=C.offsetsViewerUrl||"https://offsets.imtheo.lol/";
  }

  /* ══════════════════════════════════════════════
     PRICING
  ══════════════════════════════════════════════ */
  function loadPricing(){
    if(priceDone)return; priceDone=true;
    const btn=document.getElementById("buy-btn");
    if(btn) btn.addEventListener("click",()=>window.open(C.shopUrl,"_blank"));
    refreshHovers();
  }

  /* ══════════════════════════════════════════════
     DISCORD
  ══════════════════════════════════════════════ */
  function loadDiscord(){
    if(dscDone)return; dscDone=true;
    const jb=document.getElementById("dsc-join"),cb=document.getElementById("dsc-copy");
    if(jb) jb.addEventListener("click",()=>window.open(C.discord,"_blank"));
    if(cb) cb.addEventListener("click",()=>{
      navigator.clipboard.writeText(C.discord).then(()=>{
        cb.textContent="Copied!"; setTimeout(()=>cb.textContent="Copy Link",2000);
      });
    });
    fetch(`https://discord.com/api/v10/invites/${C.discordInviteCode}?with_counts=true`)
      .then(r=>r.json())
      .then(d=>{
        if(d.approximate_presence_count!=null) setText("dsc-online",d.approximate_presence_count.toLocaleString());
        if(d.approximate_member_count !=null) setText("dsc-members",d.approximate_member_count.toLocaleString());
      }).catch(()=>{});
    refreshHovers();
  }

  /* Fallback script.txt content in case fetch fails */
  const FALLBACK_TXT=`[Aimbot]
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
- Target HUD
- Smoothing / Inertia (Use Smoothing, Smoothing+, Dynamic Smoothing X/Y)
- Easing (Linear, Sine, Quad, Cubic, Quart, Quint, Expo, Circular, Back, Bounce, Elastic, Adaptive)
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
- Use Closest Point
- Checks (Enemy, Team, NPC, Wall, Dead, Knocked)
[Visuals (ESP)]
- Enable ESP
- ESP Font (ProggyClean, SmallestPixel, Tahoma, TahomaBold, Arial, SourceSans)
- Show On (NPC, Enemy, Team, Self)
- Max Distance
- Box ESP (Full, Cornered Box)
- Glow Amount
- Name ESP (Top, Bottom, Left, Right)
- Distance ESP (Studs, Meters)
- Health Bar
- Health Bar Gradient
- Health Text
- Armor Bar
- Weapon ESP
- State Flags (Knocked, Dead, Reloading, Running)
[Player Chams]
- Player Chams
- Fill Color
- Outline Color
- Show On Self
- Show On Others
- Show On NPCs
- Checks (Wall check, Dead check)
- Fill Transparency
- Outline Transparency
[Movement]
- Speed Boost
- Ground Speed
- Up Speed
- Down Speed
- Speed Method (Default WalkSpeed, Velocity-based)
- Jump Boost
- Jump Method (Default JumpPower, Velocity-based, CFrame-based)
- Noclip
- Fly
- Fly Speed
- Anti AFK
- Aspect Ratio Changer
[Skins]
- Purple Skin (Revolver, Double-Barrel SG, TacticalShotgun)
- Red Skin (Revolver, Double-Barrel SG, TacticalShotgun)
- Green Skin (Revolver, Double-Barrel SG, TacticalShotgun)
- Blue Skin (Revolver, Double-Barrel SG, TacticalShotgun)
- Grey Skin (Revolver, Double-Barrel SG, TacticalShotgun)
- Ghost Skin
- Rainbow Skin
- Cosmic Skin
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
- Blood Red (Crimson eclipse)
- Sunset (Amber gradient)
- HD Space (High-res cosmos)
- Shiverfrost (Aurora borealis)
- Blue Nebula (Galactic dust)
- Crossroads (2007 vintage day)
[Avatar]
- Headless
- Korblox Right Leg
- Korblox Left Leg
- Animation Changer
- Zombie Animation (Walk, Run, Idle, Jump, Fall, Swim)
- Mage Animation (Walk, Run, Idle, Jump, Fall, Swim)
- Ninja Animation (Walk, Run, Idle, Jump, Fall, Swim)`;

});
