// === Snow ===
(function(){const c=document.getElementById('snowCanvas');if(!c)return;const ctx=c.getContext('2d');let f=[];function r(){c.width=innerWidth;c.height=innerHeight}function init(){r();f=[];for(let i=0;i<60;i++)f.push({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*2+.5,s:Math.random()*.7+.2,d:(Math.random()-.5)*.3,o:Math.random()*.4+.15})}function draw(){ctx.clearRect(0,0,c.width,c.height);f.forEach(p=>{p.y+=p.s;p.x+=p.d;if(p.y>c.height){p.y=-5;p.x=Math.random()*c.width}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${p.o})`;ctx.fill()});requestAnimationFrame(draw)}addEventListener('resize',r);init();draw()})();

// === Notification ===
(function(){const n=document.getElementById('notif'),u=document.getElementById('notifUrl'),f=document.getElementById('notifFill'),x=document.getElementById('notifCancel');let t=null;function show(url){clearTimeout(t);u.textContent=url.length>50?url.slice(0,50)+'...':url;f.style.transition='none';f.style.width='0%';n.classList.add('active');requestAnimationFrame(()=>{f.style.transition='width 5s linear';f.style.width='100%'});t=setTimeout(()=>{window.open(url,'_blank');hide()},5000)}function hide(){n.classList.remove('active');clearTimeout(t);f.style.transition='none';f.style.width='0%'}x?.addEventListener('click',hide);document.addEventListener('click',e=>{const el=e.target.closest('[data-external]');if(el){e.preventDefault();show(el.dataset.external)}})})();

// === Typewriter ===
(function(){const el=document.getElementById('heroTitle');if(!el)return;const texts=['/alternate','@2jkoni'];let idx=0,ci=0,del=false;function type(){const cur=texts[idx];if(del){ci--;el.textContent=cur.substring(0,ci);if(ci===0){del=false;idx=(idx+1)%texts.length;setTimeout(type,400);return}setTimeout(type,80)}else{ci++;el.textContent=cur.substring(0,ci);if(ci===cur.length){del=true;setTimeout(type,2000);return}setTimeout(type,100)}}setTimeout(type,2500)})();

// === Parallax (only when mouse is near the element) ===
(function(){
    const img = document.getElementById('heroImg');
    const dc = document.getElementById('dcCard');
    let mx = innerWidth/2, my = innerHeight/2, cx = mx, cy = my;
    let imgHover = false, dcHover = false;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    if(img) {
        const hero = img.closest('.hero');
        if(hero) {
            hero.addEventListener('mouseenter', () => imgHover = true);
            hero.addEventListener('mouseleave', () => { imgHover = false; });
        }
    }
    if(dc) {
        dc.addEventListener('mouseenter', () => dcHover = true);
        dc.addEventListener('mouseleave', () => { dcHover = false; dc.style.transform = ''; });
    }

    function u() {
        cx += (mx - cx) * 0.06;
        cy += (my - cy) * 0.06;

        if(img) {
            if(imgHover) {
                const dx = (cx - innerWidth/2) / 80;
                const dy = (cy - innerHeight/2) / 80;
                img.style.transform = `translate(${dx}px, ${dy}px) rotateY(${dx*0.2}deg) rotateX(${-dy*0.2}deg)`;
            } else {
                img.style.transform = '';
            }
        }
        if(dc && dcHover) {
            const r = dc.getBoundingClientRect();
            const dx = (mx - r.left - r.width/2) / r.width;
            const dy = (my - r.top - r.height/2) / r.height;
            dc.style.transform = `perspective(600px) rotateX(${dy*-3}deg) rotateY(${dx*3}deg) translateX(${dx*4}px) translateY(${dy*4}px)`;
        }
        requestAnimationFrame(u);
    }
    u();
})();

// === Features Overlay (ui.lua exact replica) ===
(function(){
    const overlay = document.getElementById('featOverlay');
    const openBtn = document.getElementById('featuresBtn');
    const closeBtn = document.getElementById('featClose');

    openBtn?.addEventListener('click', () => { overlay.classList.add('active'); document.body.classList.add('feat-open'); });
    closeBtn?.addEventListener('click', () => { overlay.classList.remove('active'); document.body.classList.remove('feat-open'); });
    overlay?.addEventListener('click', e => { if(e.target === overlay) { overlay.classList.remove('active'); document.body.classList.remove('feat-open'); }});

    // Data matching script.lua Map exactly
    const data = {
        combat: {
            subtabs: ['Aimbot', 'Silent', 'Aimbot+'],
            content: {
                'Aimbot': {
                    left: [
                        { title: 'Aimbot', controls: [
                            {t:'check',l:'Enabled',on:true},{t:'check',l:'Prediction',on:true},{t:'slider',l:'FOV Radius',v:120,m:500},
                            {t:'check',l:'Show FOV'},{t:'drop',l:'Target Part',v:'Head'},{t:'check',l:'Smoothing',on:true},
                            {t:'slider',l:'Smoothness',v:8,m:20},{t:'key',l:'Keybind',v:'MB2'},{t:'check',l:'Use Offsets'},
                            {t:'check',l:'Air Offset'},{t:'slider',l:'Lock Time',v:0,m:500},{t:'check',l:'Delay Jump'},
                            {t:'check',l:'Fall Delay'},{t:'check',l:'Unlock Delay'},{t:'slider',l:'Miss Chance',v:0,m:100},
                            {t:'check',l:'Use Easing'}
                        ]}
                    ],
                    right: [
                        { title: 'Target / Main', controls: [
                            {t:'drop',l:'Priority',v:'Closest'},{t:'check',l:'Ignore Knocked',on:true},{t:'check',l:'Ignore Friends',on:true},
                            {t:'check',l:'Wall Check'},{t:'check',l:'Target HUD',on:true},{t:'slider',l:'Air X Smoothing',v:55,m:100},
                            {t:'check',l:'Advanced Prediction',on:true},{t:'drop',l:'Pred Style',v:'Classic'},
                            {t:'slider',l:'Ground Pred Right',v:39,m:100},{t:'slider',l:'Ground Pred Left',v:26,m:100},
                            {t:'slider',l:'Air Pred Up',v:12,m:100},{t:'slider',l:'Air Pred Down',v:10,m:100},
                            {t:'slider',l:'Air Pred Right',v:28,m:100},{t:'slider',l:'Air Pred Left',v:10,m:100},
                            {t:'check',l:'Deadzone'},{t:'check',l:'Aim Sway',on:true},
                            {t:'slider',l:'Y Offset (Grounded)',v:6,m:10},{t:'slider',l:'Y Offset (Jumping)',v:8,m:10},
                            {t:'slider',l:'Y Offset (Falling)',v:7,m:10},{t:'slider',l:'Sway Amount',v:3,m:10}
                        ]}
                    ]
                },
                'Silent': {
                    left: [{ title: 'Silent Aim', controls: [
                        {t:'check',l:'Enabled'},{t:'slider',l:'FOV Radius',v:80,m:500},{t:'check',l:'Show FOV'},
                        {t:'drop',l:'Target Part',v:'Head'},{t:'slider',l:'Hit Chance',v:100,m:100},{t:'key',l:'Keybind',v:'None'}
                    ]}],
                    right: [{ title: 'Target / Main', controls: [
                        {t:'drop',l:'Priority',v:'Closest'},{t:'check',l:'Ignore Knocked',on:true},{t:'check',l:'Wall Check'}
                    ]}]
                },
                'Aimbot+': {
                    left: [{ title: 'Settings', controls: [
                        {t:'check',l:'Anti-Lock'},{t:'check',l:'Resolver'},{t:'drop',l:'Anti-Aim',v:'Off'},{t:'key',l:'AA Keybind',v:'None'}
                    ]}],
                    right: [{ title: 'Aimbot+', controls: [
                        {t:'check',l:'Auto Shoot'},{t:'check',l:'Rage Mode'},{t:'slider',l:'Min Damage',v:0,m:100}
                    ]}]
                }
            }
        },
        visuals: {
            subtabs: ['ESP/Chams', 'World'],
            content: {
                'ESP/Chams': {
                    left: [{ title: 'ESP', controls: [
                        {t:'check',l:'Enabled'},{t:'check',l:'Boxes',on:true},{t:'check',l:'Names',on:true},
                        {t:'check',l:'Health Bars',on:true},{t:'check',l:'Distance'},{t:'check',l:'Weapon',on:true},
                        {t:'check',l:'Tracers'},{t:'check',l:'Flags'}
                    ]}],
                    right: [{ title: 'Chams', controls: [
                        {t:'check',l:'Enabled'},{t:'drop',l:'Material',v:'ForceField'},{t:'slider',l:'Transparency',v:50,m:100},
                        {t:'check',l:'Self Chams'},{t:'check',l:'Weapon Chams'}
                    ]}]
                },
                'World': {
                    left: [
                        { title: 'Lighting', controls: [{t:'check',l:'Custom Lighting'},{t:'slider',l:'Brightness',v:2,m:10},{t:'slider',l:'Ambient',v:100,m:255},{t:'check',l:'No Fog'},{t:'slider',l:'Clock Time',v:12,m:24},{t:'check',l:'Fullbright'}]},
                        { title: 'Weather', controls: [{t:'check',l:'No Weather'},{t:'check',l:'No Rain'},{t:'check',l:'No Clouds'}]}
                    ],
                    right: [
                        { title: 'Skybox', controls: [{t:'check',l:'Custom Skybox'},{t:'drop',l:'Skybox',v:'Space'},{t:'check',l:'Remove Sun'},{t:'check',l:'Remove Moon'}]},
                        { title: 'Materials', controls: [{t:'check',l:'Custom Materials'},{t:'drop',l:'Char Material',v:'ForceField'},{t:'drop',l:'Tool Material',v:'ForceField'},{t:'check',l:'Self Material'},{t:'drop',l:'Self Material Type',v:'Neon'}]}
                    ]
                }
            }
        },
        misc: {
            subtabs: ['Misc', 'Playerlist'],
            content: {
                'Misc': {
                    left: [{ title: 'Movement', controls: [
                        {t:'check',l:'Speed Boost'},{t:'slider',l:'Speed',v:16,m:100},{t:'check',l:'Fly'},
                        {t:'slider',l:'Fly Speed',v:50,m:200},{t:'key',l:'Fly Key',v:'None'},{t:'check',l:'No Clip'},
                        {t:'check',l:'Infinite Jump'},{t:'slider',l:'Jump Power',v:50,m:200},{t:'check',l:'Anti Void'},
                        {t:'check',l:'Anti Ragdoll'},{t:'check',l:'Auto Stomp'}
                    ]}],
                    right: [
                        { title: 'Triggerbot / Skins', controls: [{t:'check',l:'Triggerbot'},{t:'slider',l:'Delay (ms)',v:50,m:500},{t:'check',l:'Custom Skins'},{t:'drop',l:'Skin',v:'Purple'},{t:'check',l:'Skin Particles'},{t:'check',l:'Scroll Texture'}]},
                        { title: 'Avatar', controls: [{t:'check',l:'Custom Avatar'},{t:'check',l:'China Hat'},{t:'slider',l:'Hat Size',v:5,m:10},{t:'check',l:'Hat Light'},{t:'check',l:'Anti Backstab'}]}
                    ]
                },
                'Playerlist': {
                    left: [{ title: 'Player List', controls: [{t:'check',l:'Show Player List'},{t:'check',l:'Show Health',on:true},{t:'check',l:'Show Distance',on:true}]}],
                    right: [{ title: 'Actions', controls: [{t:'check',l:'Teleport'},{t:'check',l:'Spectate'},{t:'check',l:'Whitelist'},{t:'check',l:'Target'}]}]
                }
            }
        },
        settings: {
            subtabs: ['Main'],
            content: {
                'Main': {
                    left: [
                        { title: 'Configs', controls: [{t:'drop',l:'Config',v:'default'},{t:'check',l:'Auto-Load'}]},
                        { title: 'Menu', controls: [{t:'key',l:'Toggle Menu',v:'INS'},{t:'check',l:'Watermark',on:true},{t:'check',l:'Keybind List',on:true}]}
                    ],
                    right: [
                        { title: 'Notifications', controls: [{t:'check',l:'Enabled',on:true},{t:'drop',l:'Type',v:'Full'},{t:'drop',l:'Position',v:'Top Right'},{t:'slider',l:'Duration',v:3,m:10}]},
                        { title: 'Themes', controls: [{t:'drop',l:'Theme',v:'Default'},{t:'check',l:'Custom Accent'}]}
                    ]
                }
            }
        }
    };

    let curTab = 'combat', curSub = 0;

    function makeCtrl(c) {
        const div = document.createElement('div');
        div.className = 'fr';
        const label = document.createElement('span');
        label.className = 'fr-label';
        label.textContent = c.l;
        div.appendChild(label);

        if (c.t === 'check') {
            const box = document.createElement('div');
            box.className = 'fc' + (c.on ? ' on' : '');
            box.addEventListener('click', () => { box.classList.toggle('on'); });
            div.appendChild(box);
        } else if (c.t === 'slider') {
            const wrap = document.createElement('div');
            wrap.className = 'fsl';
            const track = document.createElement('div');
            track.className = 'fsl-track';
            const fill = document.createElement('div');
            fill.className = 'fsl-fill';
            const pct = c.m ? (c.v / c.m * 100) : 0;
            fill.style.width = pct + '%';
            track.appendChild(fill);
            const val = document.createElement('span');
            val.className = 'fsl-val';
            val.textContent = c.v;
            wrap.appendChild(track);
            wrap.appendChild(val);
            div.appendChild(wrap);

            // Make slider draggable
            let dragging = false;
            track.addEventListener('mousedown', e => { dragging = true; updateSlider(e); });
            document.addEventListener('mousemove', e => { if(dragging) updateSlider(e); });
            document.addEventListener('mouseup', () => { dragging = false; });
            function updateSlider(e) {
                const rect = track.getBoundingClientRect();
                let pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                fill.style.width = (pct * 100) + '%';
                val.textContent = Math.round(pct * c.m);
            }
        } else if (c.t === 'drop') {
            const dd = document.createElement('span');
            dd.className = 'fd';
            dd.textContent = c.v;
            div.appendChild(dd);
        } else if (c.t === 'key') {
            const kb = document.createElement('span');
            kb.className = 'fk';
            kb.textContent = c.v;
            div.appendChild(kb);
        }
        return div;
    }

    function render() {
        const td = data[curTab], sn = td.subtabs[curSub], content = td.content[sn];
        const left = document.getElementById('featLeft');
        const right = document.getElementById('featRight');
        left.innerHTML = '';
        right.innerHTML = '';

        content.left.forEach(sec => {
            const secDiv = document.createElement('div');
            secDiv.className = 'fs';
            const title = document.createElement('div');
            title.className = 'fs-title';
            title.textContent = sec.title;
            secDiv.appendChild(title);
            sec.controls.forEach(c => secDiv.appendChild(makeCtrl(c)));
            left.appendChild(secDiv);
        });

        content.right.forEach(sec => {
            const secDiv = document.createElement('div');
            secDiv.className = 'fs';
            const title = document.createElement('div');
            title.className = 'fs-title';
            title.textContent = sec.title;
            secDiv.appendChild(title);
            sec.controls.forEach(c => secDiv.appendChild(makeCtrl(c)));
            right.appendChild(secDiv);
        });
    }

    function renderSubs() {
        const bar = document.getElementById('featSubtabs');
        const td = data[curTab];
        bar.innerHTML = '';
        td.subtabs.forEach((n, i) => {
            const btn = document.createElement('button');
            btn.className = 'fst' + (i === curSub ? ' active' : '');
            btn.textContent = n;
            btn.onclick = () => { curSub = i; bar.querySelectorAll('.fst').forEach(x => x.classList.remove('active')); btn.classList.add('active'); render(); };
            bar.appendChild(btn);
        });
    }

    document.querySelectorAll('.ft').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.ft').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            curTab = tab.dataset.t;
            curSub = 0;
            renderSubs();
            render();
        });
    });

    renderSubs();
    render();
})();
