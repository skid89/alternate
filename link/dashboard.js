const API = location.hostname==='localhost'?'http://localhost:3001':'https://alternate-production.up.railway.app';
const TOKEN = localStorage.getItem('token');
if(!TOKEN) location.href='./';

// Tabs
document.querySelectorAll('.side-nav .sn').forEach(btn=>{
    btn.addEventListener('click',()=>{
        document.querySelectorAll('.side-nav .sn').forEach(b=>b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('p-'+btn.dataset.p)?.classList.add('active');
    });
});

// Chips - single select
document.querySelectorAll('.chips.single').forEach(g=>{
    g.querySelectorAll('button').forEach(b=>{
        b.addEventListener('click',()=>{
            g.querySelectorAll('button').forEach(x=>x.classList.remove('on'));
            b.classList.add('on');
        });
    });
});

// Chips - multi select
document.querySelectorAll('.chips.multi').forEach(g=>{
    const max=parseInt(g.dataset.max)||99;
    g.querySelectorAll('button').forEach(b=>{
        b.addEventListener('click',()=>{
            if(b.classList.contains('on')){b.classList.remove('on');return;}
            if(g.querySelectorAll('.on').length>=max)return;
            b.classList.add('on');
        });
    });
});

// Range value display
document.querySelectorAll('input[type="range"]').forEach(r=>{
    const rv=r.parentElement.querySelector('.rv');
    if(!rv)return;
    const update=()=>{
        const suf=rv.textContent.replace(/[\d]/g,'')||'';
        rv.textContent=r.value+(suf.includes('%')?'%':suf.includes('px')?'px':'');
    };
    r.addEventListener('input',update);
});

// Upload zones
document.querySelectorAll('.upload').forEach(zone=>{
    const input=zone.querySelector('input[type="file"]');
    if(!input)return;
    zone.addEventListener('click',()=>input.click());
    input.addEventListener('change',()=>{
        if(input.files[0]){
            zone.querySelector('span').textContent=input.files[0].name;
            zone.querySelector('i').className='fas fa-check';
            zone.querySelector('i').style.color='#4ade80';
        }
    });
});

// Add social link
const platforms='Discord,TikTok,YouTube,Twitter/X,Instagram,GitHub,Roblox,Steam,Spotify,Twitch,Telegram,SoundCloud,Kick,Custom'.split(',');
document.getElementById('addSocial')?.addEventListener('click',()=>{
    const list=document.getElementById('socialList');
    const item=document.createElement('div');item.className='link-item';
    item.innerHTML=`<select>${platforms.map(p=>`<option>${p}</option>`).join('')}</select><input type="url" placeholder="https://"><button class="link-rm"><i class="fas fa-trash"></i></button>`;
    list.appendChild(item);
    item.querySelector('.link-rm').addEventListener('click',()=>item.remove());
});

// Add button
document.getElementById('addBtn')?.addEventListener('click',()=>{
    const list=document.getElementById('btnList');
    const item=document.createElement('div');item.className='link-item';
    item.innerHTML=`<input type="text" placeholder="Label" style="width:100px"><input type="url" placeholder="https://"><button class="link-rm"><i class="fas fa-trash"></i></button>`;
    list.appendChild(item);
    item.querySelector('.link-rm').addEventListener('click',()=>item.remove());
});

// Load profile
async function loadProfile(){
    try{
        const r=await fetch(`${API}/api/me`,{headers:{Authorization:`Bearer ${TOKEN}`}});
        if(!r.ok){localStorage.removeItem('token');location.href='./';return;}
        const p=await r.json();
        // Fill form fields
        document.querySelectorAll('[id^="f-"]').forEach(el=>{
            const key=el.id.replace('f-','');
            if(p[key]===undefined)return;
            if(el.type==='checkbox')el.checked=!!p[key];
            else if(el.type==='range'){el.value=p[key];el.dispatchEvent(new Event('input'));}
            else el.value=p[key]||'';
        });
        // Load socials
        if(p.socials?.length){
            const list=document.getElementById('socialList');
            list.innerHTML='';
            p.socials.forEach(s=>{
                const item=document.createElement('div');item.className='link-item';
                item.innerHTML=`<select>${platforms.map(pl=>`<option${pl===s.platform?' selected':''}>${pl}</option>`).join('')}</select><input type="url" value="${s.url||''}"><button class="link-rm"><i class="fas fa-trash"></i></button>`;
                list.appendChild(item);
                item.querySelector('.link-rm').addEventListener('click',()=>item.remove());
            });
        }
    }catch(e){console.error(e);}
}

// Load analytics
async function loadAnalytics(){
    try{
        const r=await fetch(`${API}/api/analytics`,{headers:{Authorization:`Bearer ${TOKEN}`}});
        if(!r.ok)return;
        const d=await r.json();
        const boxes=document.querySelectorAll('.stat-box .sn');
        if(boxes[0])boxes[0].textContent=d.views?.total?.toLocaleString()||'0';
        if(boxes[1])boxes[1].textContent=d.clicks?.total?.toLocaleString()||'0';
        if(boxes[2])boxes[2].textContent=d.views?.today?.toLocaleString()||'0';
        if(boxes[3])boxes[3].textContent=d.views?.week?.toLocaleString()||'0';
    }catch(e){}
}

// Save
document.getElementById('saveBtn')?.addEventListener('click',async()=>{
    const btn=document.getElementById('saveBtn');
    btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>Saving';
    const data={};
    document.querySelectorAll('[id^="f-"]').forEach(el=>{
        const key=el.id.replace('f-','');
        if(el.type==='checkbox')data[key]=el.checked?1:0;
        else if(el.type==='range')data[key]=parseInt(el.value);
        else if(el.value)data[key]=el.value;
    });
    // Socials
    const socials=[];
    document.querySelectorAll('#socialList .link-item').forEach(item=>{
        const platform=item.querySelector('select')?.value;
        const url=item.querySelector('input[type="url"]')?.value;
        if(platform&&url)socials.push({platform,url});
    });
    data.socials=socials;

    try{
        const r=await fetch(`${API}/api/me`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${TOKEN}`},body:JSON.stringify(data)});
        btn.innerHTML=r.ok?'<i class="fas fa-check"></i>Saved':'<i class="fas fa-times"></i>Error';
    }catch(e){btn.innerHTML='<i class="fas fa-times"></i>Error';}
    setTimeout(()=>{btn.innerHTML='<i class="fas fa-save"></i>Save';},2000);
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click',()=>{
    localStorage.removeItem('token');localStorage.removeItem('username');location.href='./';
});

loadProfile();
loadAnalytics();

