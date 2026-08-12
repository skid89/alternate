document.addEventListener("DOMContentLoaded", () => {
  // --- CONFIG ACCESS ---
  const config = window.CONFIG || {
    discord: "https://discord.gg/alternate",
    games: [
      { name: "Da Track", details: "Custom skin changer and silent aim" },
      { name: "Hood Customs", details: "Skin changer support" }
    ],
    executors: ["Wave", "Synapse Z", "Macsploit", "Solara", "Sentinel"],
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

  // --- HTML ELEMENT REFERENCES ---
  const customCursor = document.getElementById("custom-cursor");
  const customCursorDot = document.getElementById("custom-cursor-dot");
  const startupScreen = document.getElementById("startup-screen");
  const revealBtn = document.getElementById("reveal-btn");
  const revealText = document.getElementById("reveal-text");
  const mainContent = document.getElementById("main-content");
  const guiCard = document.getElementById("gui-card");
  
  // Tab Buttons
  const tabFeaturesBtn = document.getElementById("tab-features");
  const tabInfoBtn = document.getElementById("tab-info");
  const tabDiscordBtn = document.getElementById("tab-discord");
  
  // Modals
  const modalFeatures = document.getElementById("modal-features");
  const modalInfo = document.getElementById("modal-info");
  const closeBtns = document.querySelectorAll(".modal-close, .modal-overlay");
  
  // Features Content
  const featuresLoader = document.getElementById("features-loader");
  const featuresContent = document.getElementById("features-content");
  
  // Info Content
  const gamesList = document.getElementById("games-list");
  const executorsList = document.getElementById("executors-list");
  const ownerLinks = document.getElementById("owner-links");
  const ownerAvatar = document.getElementById("owner-avatar");
  const ownerDisplayName = document.getElementById("owner-display-name");
  const ownerUsername = document.getElementById("owner-username");
  const ownerId = document.getElementById("owner-id");
  const ownerCreated = document.getElementById("owner-created");

  // --- MOUSE TRACKING & PHYSICS ---
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let dampedMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  // Custom Cursor Update Loop
  function updateCursor() {
    // Lerp damped cursor coordinates (dampening effect)
    dampedMouse.x += (mouse.x - dampedMouse.x) * 0.12;
    dampedMouse.y += (mouse.y - dampedMouse.y) * 0.12;

    customCursor.style.left = `${dampedMouse.x}px`;
    customCursor.style.top = `${dampedMouse.y}px`;
    
    // Dot follows mouse directly
    customCursorDot.style.left = `${mouse.x}px`;
    customCursorDot.style.top = `${mouse.y}px`;

    // 3D Parallax Dampening logic for card
    currentRotX += (targetRotX - currentRotX) * 0.08;
    currentRotY += (targetRotY - currentRotY) * 0.08;
    
    if (guiCard) {
      guiCard.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
    }

    requestAnimationFrame(updateCursor);
  }
  requestAnimationFrame(updateCursor);

  // Mouse move event listeners
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Calculate rotation angles for parallax card
    const cardRect = guiCard ? guiCard.getBoundingClientRect() : null;
    if (cardRect) {
      const centerX = cardRect.left + cardRect.width / 2;
      const centerY = cardRect.top + cardRect.height / 2;
      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);
      
      // Limit rotations to max 12 degrees
      targetRotX = -deltaY * 12;
      targetRotY = deltaX * 12;
    }
  });

  // Cursor Hover classes on interactive elements
  const addCursorHover = () => document.body.classList.add("cursor-hover");
  const removeCursorHover = () => document.body.classList.remove("cursor-hover");

  function refreshCursorHoverListeners() {
    const hoverables = document.querySelectorAll("a, button, input, select, textarea, .control, .modal-close");
    hoverables.forEach(elem => {
      elem.removeEventListener("mouseenter", addCursorHover);
      elem.removeEventListener("mouseleave", removeCursorHover);
      elem.addEventListener("mouseenter", addCursorHover);
      elem.addEventListener("mouseleave", removeCursorHover);
    });
  }
  refreshCursorHoverListeners();

  // --- INTERACTIVE BACKGROUND CANVAS GRID ---
  const canvas = document.getElementById("grid-canvas");
  const ctx = canvas.getContext("2d");

  let gridCells = [];
  const cellSize = 50; // Size of grid cells in pixels
  let cols, rows;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.ceil(canvas.width / cellSize);
    rows = Math.ceil(canvas.height / cellSize);
    
    // Reinitialize grid intensity array
    gridCells = [];
    for (let c = 0; c < cols; c++) {
      gridCells[c] = [];
      for (let r = 0; r < rows; r++) {
        gridCells[c][r] = 0; // Intensity initialized to 0
      }
    }
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Canvas animation loop
  function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Calculate which grid cell the mouse is currently in, and activate it
    const activeCol = Math.floor(mouse.x / cellSize);
    const activeRow = Math.floor(mouse.y / cellSize);
    
    if (activeCol >= 0 && activeCol < cols && activeRow >= 0 && activeRow < rows) {
      gridCells[activeCol][activeRow] = 1.0; // Max intensity on cursor cell
      
      // Light up neighboring cells slightly
      const neighbors = [
        [0, 1], [0, -1], [1, 0], [-1, 0]
      ];
      neighbors.forEach(([dc, dr]) => {
        const nc = activeCol + dc;
        const nr = activeRow + dr;
        if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) {
          gridCells[nc][nr] = Math.max(gridCells[nc][nr], 0.4);
        }
      });
    }

    // 2. Draw active tiles (black, white, pink theme)
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const intensity = gridCells[c][r];
        if (intensity > 0.01) {
          // Fill grid cells that are active with a glowing pink trail
          ctx.fillStyle = `rgba(255, 105, 180, ${intensity * 0.14})`;
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          
          // Fade grid cell intensity over time (dampening effect)
          gridCells[c][r] *= 0.94;
        }
      }
    }

    // 3. Draw grid lines (subtle dark grid borders)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.018)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let c = 0; c <= cols; c++) {
      ctx.moveTo(c * cellSize, 0);
      ctx.lineTo(c * cellSize, canvas.height);
    }
    for (let r = 0; r <= rows; r++) {
      ctx.moveTo(0, r * cellSize);
      ctx.lineTo(canvas.width, r * cellSize);
    }
    ctx.stroke();

    // 4. Subtle mouse spotlight glow
    const gradient = ctx.createRadialGradient(
      dampedMouse.x, dampedMouse.y, 10,
      dampedMouse.x, dampedMouse.y, 200
    );
    gradient.addColorStop(0, "rgba(255, 105, 180, 0.07)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(drawCanvas);
  }
  requestAnimationFrame(drawCanvas);

  // --- STARTUP ANIMATION LOGIC ---
  if (revealBtn) {
    revealBtn.addEventListener("click", () => {
      // 1. Trigger reveal text animation
      revealText.classList.remove("hidden");
      revealText.classList.add("show");
      
      // Rotate and slide the button
      revealBtn.style.transform = "scale(0.8) rotate(360deg)";
      revealBtn.style.opacity = "0";
      revealBtn.style.pointerEvents = "none";

      // 2. Transition Loader -> Main Website
      setTimeout(() => {
        startupScreen.style.opacity = "0";
        startupScreen.style.visibility = "hidden";
        mainContent.classList.remove("hidden-main");
      }, 1400);
    });
  }

  // --- TAB NAVIGATION ACTIONS ---
  if (tabDiscordBtn) {
    tabDiscordBtn.addEventListener("click", () => {
      window.open(config.discord, "_blank");
    });
  }

  if (tabFeaturesBtn) {
    tabFeaturesBtn.addEventListener("click", () => {
      modalFeatures.classList.add("active");
      loadFeatures();
    });
  }

  if (tabInfoBtn) {
    tabInfoBtn.addEventListener("click", () => {
      modalInfo.classList.add("active");
      loadInfoSection();
    });
  }

  // Close modals
  closeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal").forEach(modal => {
        modal.classList.remove("active");
      });
    });
  });

  // Close modal on Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal").forEach(modal => {
        modal.classList.remove("active");
      });
    }
  });

  // --- FEATURE PARSER FROM script.txt ---
  let featuresLoaded = false;
  function loadFeatures() {
    if (featuresLoaded) return; // Prevent double loads

    fetch("script.txt")
      .then(response => {
        if (!response.ok) throw new Error("File not found");
        return response.text();
      })
      .then(text => {
        parseAndRenderFeatures(text);
        featuresLoaded = true;
      })
      .catch(error => {
        console.warn("Could not load script.txt, using local fallback features:", error);
        // Fallback features list if script.txt fetch fails
        const fallbackText = `
[Aimbot]
- Enabled
- Lock Method (Mouse, Camera)
- Target Mode (FOV, Mouse, Distance, Center)
- Aim Type (Normal, Closest Part)
- Ground Part (Head, Torso, etc.)
- Air Part (UpperTorso, etc.)
- Ignore Fall State
- Checks (Enemy, Team, NPC, Wall, Dead, Knocked)
- Auto Stop on Dead
- Sticky Aim
- Lock Target

[Silent Aim]
- Enabled
- Target Type (Closest to Mouse, Distance, FOV)
- Hit Part (Head, Torso, etc.)
- Use Closest Point
- Checks (Enemy, Team, NPC, Wall, Dead, Knocked)

[Visuals (ESP)]
- Enable ESP
- ESP Font (ProggyClean, Tahoma, SourceSans, etc.)
- Show On (NPC, Enemy, Team, Self)
- Max Distance
- Box ESP (Full, Cornered)
- Glow Amount
- Box Fill (Fill Transparency 1 & 2)
- Name ESP (Top, Bottom, Left, Right)
- Distance ESP (Top, Bottom, Left, Right)
- Health Bar & Health Bar Gradient
- Health Text & Armor Bar
- Weapon ESP
- State Flags

[Player Chams]
- Player Chams (Fill/Outline Color Picker)
- Show On Self, Others, NPCs
- Checks (Dead, Wall)
- Fill/Outline Transparency
        `;
        parseAndRenderFeatures(fallbackText);
        featuresLoaded = true;
      });
  }

  function parseAndRenderFeatures(text) {
    featuresLoader.style.display = "none";
    featuresContent.innerHTML = "";

    const lines = text.split("\n");
    let currentCategory = null;
    let categories = {};

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Category Header like [Aimbot]
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        currentCategory = trimmed.substring(1, trimmed.length - 1);
        categories[currentCategory] = [];
      } else if (currentCategory && (trimmed.startsWith("-") || trimmed.startsWith("*"))) {
        // Feature bullet point
        const feature = trimmed.substring(1).trim();
        categories[currentCategory].push(feature);
      }
    });

    // Render HTML Cards
    Object.keys(categories).forEach(catName => {
      const card = document.createElement("div");
      card.className = "feature-category-card";

      const title = document.createElement("h3");
      title.textContent = catName;
      card.appendChild(title);

      const list = document.createElement("ul");
      categories[catName].forEach(feat => {
        const item = document.createElement("li");
        item.textContent = feat;
        list.appendChild(item);
      });
      card.appendChild(list);

      featuresContent.appendChild(card);
    });

    refreshCursorHoverListeners();
  }

  // --- INFO SECTION RENDER & ROBLOX API FETCH ---
  let infoLoaded = false;
  function loadInfoSection() {
    if (infoLoaded) return;

    // 1. Render Games
    gamesList.innerHTML = "";
    config.games.forEach(game => {
      const gameCard = document.createElement("div");
      gameCard.className = "game-card";
      
      const title = document.createElement("h4");
      title.textContent = game.name;
      
      const details = document.createElement("p");
      details.textContent = game.details;
      
      gameCard.appendChild(title);
      gameCard.appendChild(details);
      gamesList.appendChild(gameCard);
    });

    // 2. Render Executors
    executorsList.innerHTML = "";
    config.executors.forEach(exec => {
      const badge = document.createElement("span");
      badge.className = "executor-badge";
      badge.textContent = exec;
      executorsList.appendChild(badge);
    });

    // 3. Render Owner links
    ownerLinks.innerHTML = "";
    config.owner.links.forEach(link => {
      const btn = document.createElement("a");
      btn.className = "owner-link-btn";
      btn.href = link.url;
      btn.target = "_blank";
      btn.textContent = link.label;
      ownerLinks.appendChild(btn);
    });

    // 4. Fetch Roblox Profile info dynamically
    fetchRobloxProfile(config.owner.robloxId);
    
    infoLoaded = true;
  }

  function fetchRobloxProfile(userId) {
    // Standard Roblox Avatar body shot CDN URL
    const avatarUrl = `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png&isCircular=false`;
    
    // Pre-calculated fallback details in case network is offline
    const fallbackProfile = {
      description: "",
      created: "2025-05-01T04:15:20.162Z",
      isBanned: false,
      id: parseInt(userId),
      name: "5fovtraceboss",
      displayName: "koni"
    };

    // Load dynamic avatar image from Roblox CDN (always supports CORS)
    fetch(avatarUrl)
      .then(res => res.json())
      .then(json => {
        if (json.data && json.data[0] && json.data[0].imageUrl) {
          ownerAvatar.src = json.data[0].imageUrl;
        } else {
          ownerAvatar.src = "https://tr.rbxcdn.com/30DAY-Avatar-8768D4231D32EF9CBC674A5265D71B79-Png/420/420/Avatar/Png/noFilter";
        }
      })
      .catch(() => {
        ownerAvatar.src = "https://tr.rbxcdn.com/30DAY-Avatar-8768D4231D32EF9CBC674A5265D71B79-Png/420/420/Avatar/Png/noFilter";
      });

    // Load profile stats - attempt via public CORS proxy to bypass Roblox API restrictions
    const profileUrl = `https://corsproxy.io/?url=${encodeURIComponent(`https://users.roblox.com/v1/users/${userId}`)}`;
    
    fetch(profileUrl)
      .then(res => {
        if (!res.ok) throw new Error("CORS proxy error");
        return res.json();
      })
      .then(profile => {
        renderRobloxProfile(profile);
      })
      .catch(() => {
        console.warn("Could not fetch profile from Roblox API via proxy. Loading local cached fallback profile.");
        renderRobloxProfile(fallbackProfile);
      });
  }

  function renderRobloxProfile(profile) {
    ownerDisplayName.textContent = profile.displayName || "koni";
    ownerUsername.textContent = `@${profile.name || "5fovtraceboss"}`;
    ownerId.textContent = profile.id || "8393274455";
    
    if (profile.created) {
      const date = new Date(profile.created);
      ownerCreated.textContent = date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric"
      });
    } else {
      ownerCreated.textContent = "05/01/2025";
    }

    refreshCursorHoverListeners();
  }
});
