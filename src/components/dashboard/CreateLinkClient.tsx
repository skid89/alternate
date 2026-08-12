'use client';

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const PLATFORM_PRESETS = [
  { id: 'custom', name: 'Custom Link', title: '', url: '', placeholder: 'https://example.com' },
  { id: 'discord', name: 'Discord', title: 'Join my Discord', url: 'https://discord.gg/', placeholder: 'https://discord.gg/invite' },
  { id: 'roblox', name: 'Roblox', title: 'My Roblox Profile', url: 'https://roblox.com/users/', placeholder: 'https://roblox.com/users/profile-id/profile' },
  { id: 'youtube', name: 'YouTube', title: 'Watch my YouTube', url: 'https://youtube.com/@', placeholder: 'https://youtube.com/@channel' },
  { id: 'tiktok', name: 'TikTok', title: 'Follow my TikTok', url: 'https://tiktok.com/@', placeholder: 'https://tiktok.com/@username' },
  { id: 'instagram', name: 'Instagram', title: 'Instagram', url: 'https://instagram.com/', placeholder: 'https://instagram.com/username' },
  { id: 'twitter', name: 'Twitter / X', title: 'Twitter / X', url: 'https://x.com/', placeholder: 'https://x.com/username' },
  { id: 'github', name: 'GitHub Profile', title: 'GitHub', url: 'https://github.com/', placeholder: 'https://github.com/username' },
  { id: 'spotify', name: 'My Spotify', title: 'Spotify Playlist', url: 'https://open.spotify.com/', placeholder: 'https://open.spotify.com/user/userid' },
  { id: 'steam', name: 'Steam Profile', title: 'Steam Group', url: 'https://steamcommunity.com/id/', placeholder: 'https://steamcommunity.com/id/username' }
];

export default function CreateLinkClient({ addLinkAction }: { addLinkAction: (formData: FormData) => void }) {
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORM_PRESETS[0]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isLarge, setIsLarge] = useState(false);

  const handlePlatformChange = (platformId: string) => {
    const preset = PLATFORM_PRESETS.find(p => p.id === platformId);
    if (preset) {
      setSelectedPlatform(preset);
      setTitle(preset.title);
      setUrl(preset.url);
    }
  };

  return (
    <form action={addLinkAction} className="flex flex-col gap-2" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '20px', marginBottom: '10px' }}>
      <div className="input-group">
        <label className="input-label">Select Prebuilt Platform Preset</label>
        <select 
          className="input-field" 
          value={selectedPlatform.id}
          onChange={(e) => handlePlatformChange(e.target.value)}
          style={{ background: 'var(--card-bg-elevated)', color: '#ffffff' }}
        >
          {PLATFORM_PRESETS.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label className="input-label">Link Title</label>
        <input 
          type="text" 
          name="title" 
          className="input-field" 
          placeholder="e.g. My GitHub" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required 
        />
      </div>

      <div className="input-group">
        <label className="input-label">Redirect URL</label>
        <input 
          type="text" 
          name="url" 
          className="input-field" 
          placeholder={selectedPlatform.placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required 
        />
      </div>

      <div className="flex align-center gap-1" style={{ fontSize: '13px', marginTop: '4px' }}>
        <input 
          type="checkbox" 
          name="isLarge" 
          id="isLarge" 
          checked={isLarge}
          onChange={(e) => setIsLarge(e.target.checked)}
        />
        <label htmlFor="isLarge">Highlight Link (Large Banner Style)</label>
      </div>

      <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', alignSelf: 'flex-start' }}>
        <PlusCircle size={16} /> Add Link Preset
      </button>
    </form>
  );
}
