const API = location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://alternate-production.up.railway.app';

// Alias check
(function(){
    const input = document.getElementById('aliasIn');
    const res = document.getElementById('aliasRes');
    if(!input||!res) return;
    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        const v = input.value.trim().toLowerCase();
        if(!v){res.textContent='';res.className='alias-res';return;}
        if(!/^[a-zA-Z0-9_]+$/.test(v)){res.textContent='invalid';res.className='alias-res no';return;}
        if(v.length<3){res.textContent='too short';res.className='alias-res no';return;}
        res.textContent='...';res.className='alias-res wait';
        timer = setTimeout(async()=>{
            try{
                const r=await fetch(`${API}/api/alias/check/${v}`);
                const d=await r.json();
                res.textContent=d.available?'available':d.reason||'taken';
                res.className='alias-res '+(d.available?'ok':'no');
            }catch(e){res.textContent='error';res.className='alias-res no';}
        },300);
    });
})();

// Recent users
(function(){
    const el=document.getElementById('recentUsers');
    if(!el)return;
    fetch(`${API}/api/users/recent`).then(r=>r.json()).then(users=>{
        el.innerHTML='';
        if(!users.length){el.innerHTML='<span>No users yet</span>';return;}
        users.forEach(u=>{el.innerHTML+=`<span>${u.display_name||u.username}</span>`;});
    }).catch(()=>{el.innerHTML='<span>alternate.lol users</span>';});
})();

// Login
(function(){
    const modal=document.getElementById('modal');
    const openBtn=document.getElementById('loginOpen');
    const closeBtn=document.getElementById('modalClose');
    const form=document.getElementById('loginForm');
    const err=document.getElementById('lErr');

    openBtn?.addEventListener('click',()=>modal.classList.add('open'));
    closeBtn?.addEventListener('click',()=>modal.classList.remove('open'));
    modal?.addEventListener('mousedown',e=>{if(e.target===modal)modal.classList.remove('open');});

    form?.addEventListener('submit',async e=>{
        e.preventDefault();err.textContent='';
        const username=document.getElementById('lUser').value.trim();
        const password=document.getElementById('lPass').value;
        try{
            const r=await fetch(`${API}/api/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
            const d=await r.json();
            if(!r.ok){err.textContent=d.error||'Login failed';return;}
            localStorage.setItem('token',d.token);
            localStorage.setItem('username',d.username);
            location.href='dashboard.html';
        }catch(e){err.textContent='Connection error';}
    });

    if(localStorage.getItem('token')){
        fetch(`${API}/api/me`,{headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}})
            .then(r=>{if(r.ok)location.href='dashboard.html';else localStorage.removeItem('token');})
            .catch(()=>{});
    }
})();

// External links
document.addEventListener('click',e=>{
    const el=e.target.closest('[data-external]');
    if(el){e.preventDefault();window.open(el.dataset.external,'_blank');}
});

