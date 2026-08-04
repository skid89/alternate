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

    // Data from features-data.js (extracted 1:1 from script.lua)
    const data = FEATURES_DATA;

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


// === Simple Overlay Handlers (reseller/media/status) ===
(function(){
    const overlayMap = {
        'resellerBtn': 'resellerOverlay',
        'mediaBtn': 'mediaOverlay',
        'statusBtn': 'statusOverlay'
    };

    for (const [btnId, overlayId] of Object.entries(overlayMap)) {
        const btn = document.getElementById(btnId);
        const overlay = document.getElementById(overlayId);
        if (!btn || !overlay) continue;

        btn.addEventListener('click', () => { overlay.classList.add('active'); document.body.classList.add('feat-open'); });
        overlay.addEventListener('click', e => { if(e.target === overlay) { overlay.classList.remove('active'); document.body.classList.remove('feat-open'); }});
    }

    // Close buttons
    document.querySelectorAll('.overlay-simple-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.close;
            const overlay = document.getElementById(id);
            if (overlay) { overlay.classList.remove('active'); document.body.classList.remove('feat-open'); }
        });
    });
})();
