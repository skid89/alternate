// Dashboard — full logic
(function(){
    // Tab navigation
    const tabs = document.querySelectorAll('.sidebar-btn');
    const panels = document.querySelectorAll('.tab-panel');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    // Collapsible cards
    document.querySelectorAll('.card-header[data-collapse]').forEach(header => {
        header.addEventListener('click', () => {
            const body = header.nextElementSibling;
            body.classList.toggle('open');
            header.classList.toggle('collapsed');
        });
    });

    // Live preview sync
    const pvName = document.getElementById('pvName');
    const pvBio = document.getElementById('pvBio');
    const nameInput = document.getElementById('displayName');
    const bioInput = document.getElementById('bio');
    if(nameInput && pvName) nameInput.addEventListener('input', e => { pvName.textContent = e.target.value || 'username'; });
    if(bioInput && pvBio) bioInput.addEventListener('input', e => { pvBio.textContent = e.target.value || ''; });

    // Accent color live update on preview
    document.querySelectorAll('input[type="color"]').forEach(picker => {
        picker.addEventListener('input', e => {
            if(picker.id === 'accentColor' || picker.closest('.form-field')?.querySelector('label')?.textContent?.includes('Accent')) {
                document.documentElement.style.setProperty('--accent', e.target.value);
            }
        });
    });

    // Chip grids - multi select (avatar effects, max 2)
    const fxGrid = document.getElementById('avatarEffects');
    const fxError = document.getElementById('fxError');
    if(fxGrid){
        let active = [];
        fxGrid.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                if(chip.classList.contains('active')){
                    chip.classList.remove('active');
                    active = active.filter(v => v !== chip.dataset.val);
                    fxError.textContent = '';
                } else {
                    if(active.length >= 2){ fxError.textContent = 'Maximum 2 effects'; setTimeout(()=>fxError.textContent='',3000); return; }
                    chip.classList.add('active');
                    active.push(chip.dataset.val);
                }
            });
        });
    }

    // Chip grids - single select
    document.querySelectorAll('.chip-grid.single').forEach(grid => {
        grid.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                grid.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });
    });

    // Range sliders
    const ranges = [['bgOpacity','bgOpacityVal','%'],['bgBlur','bgBlurVal','px'],['cardBlur','cardBlurVal','px'],['cardRadius','cardRadiusVal','px'],['musicVol','musicVolVal','%'],['particleCount','particleCountVal','']];
    ranges.forEach(([id, valId, suf]) => {
        const el = document.getElementById(id), val = document.getElementById(valId);
        if(el && val) el.addEventListener('input', () => val.textContent = el.value + suf);
    });

    // Upload zones
    document.querySelectorAll('.upload-zone').forEach(zone => {
        const input = zone.querySelector('input[type="file"]');
        if(!input) return;
        zone.addEventListener('click', () => input.click());
        input.addEventListener('change', () => {
            if(input.files[0]){
                zone.querySelector('span').textContent = input.files[0].name;
                zone.querySelector('i').className = 'fas fa-check';
                zone.querySelector('i').style.color = '#4ade80';
            }
        });
    });

    // Add social link
    document.getElementById('addSocialBtn')?.addEventListener('click', () => {
        const list = document.getElementById('socialList');
        const item = document.createElement('div');
        item.className = 'link-item';
        item.innerHTML = '<select><option>Discord</option><option>TikTok</option><option>YouTube</option><option>Twitter/X</option><option>Instagram</option><option>GitHub</option><option>Roblox</option><option>Steam</option><option>Spotify</option><option>Twitch</option><option>Telegram</option><option>SoundCloud</option><option>Kick</option><option>Custom</option></select><input type="url" placeholder="https://"><button class="rm-btn"><i class="fas fa-trash"></i></button>';
        list.appendChild(item);
        item.querySelector('.rm-btn').addEventListener('click', () => item.remove());
    });

    // Add button
    document.getElementById('addBtnBtn')?.addEventListener('click', () => {
        const list = document.getElementById('buttonList');
        const item = document.createElement('div');
        item.className = 'link-item';
        item.innerHTML = '<input type="text" placeholder="Button label" class="lbl-input"><input type="url" placeholder="https://"><button class="rm-btn"><i class="fas fa-trash"></i></button>';
        list.appendChild(item);
        item.querySelector('.rm-btn').addEventListener('click', () => item.remove());
    });

    // Remove btn handlers
    document.querySelectorAll('.rm-btn').forEach(btn => btn.addEventListener('click', () => btn.closest('.link-item').remove()));

    // Music source toggle
    document.getElementById('musicSource')?.addEventListener('change', e => {
        document.getElementById('musicUploadZone').style.display = e.target.value === 'file' ? 'flex' : 'none';
        document.getElementById('musicUrlField').style.display = e.target.value !== 'file' ? 'block' : 'none';
    });

    // Font family toggle
    document.getElementById('fontFamily')?.addEventListener('change', e => {
        document.getElementById('customFontField').style.display = e.target.value === 'custom' ? 'block' : 'none';
    });

    // Accent color live
    document.getElementById('accentColor')?.addEventListener('input', e => {
        document.documentElement.style.setProperty('--accent', e.target.value);
    });

    // Save all
    document.getElementById('saveAllBtn')?.addEventListener('click', () => {
        const btn = document.getElementById('saveAllBtn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        setTimeout(() => { btn.innerHTML = '<i class="fas fa-check"></i> Saved!'; setTimeout(() => { btn.innerHTML = '<i class="fas fa-save"></i> Save All'; }, 2000); }, 800);
    });

    // Preview toggle
    document.getElementById('previewBtn')?.addEventListener('click', () => { document.getElementById('previewPanel')?.classList.toggle('hidden'); });
    document.getElementById('closePreview')?.addEventListener('click', () => { document.getElementById('previewPanel')?.classList.add('hidden'); });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => { window.location.href = './'; });
})();
