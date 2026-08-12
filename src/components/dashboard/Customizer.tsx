'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Layout, 
  Palette, 
  Image, 
  Music, 
  MousePointer, 
  Eye, 
  Sliders, 
  Sparkles,
  Music4,
  Volume2
} from 'lucide-react';
import '@/styles/customizer.css';

interface ProfileData {
  id: string;
  slug: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  entryText: string | null;
  layout: string;
  font: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  cardColor: string;
  textColor: string;
  textMutedColor: string;
  borderGlowColor: string;
  cardOpacity: number;
  cardBlur: number;
  cardRadius: number;
  cardWidth: string;
  backgroundType: string;
  backgroundUrl: string | null;
  backgroundEffects: string;
  avatarUrl: string | null;
  avatarDecoration: string | null;
  avatarStyle: string;
  bannerUrl: string | null;
  musicUrl: string | null;
  musicAutoplay: boolean;
  musicVolume: number;
  musicTitle: string | null;
  musicArtist: string | null;
  cursorStyle: string;
  customCursor: string | null;
}

export default function Customizer({ initialProfile }: { initialProfile: ProfileData }) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [activeTab, setActiveTab] = useState<'layout' | 'design' | 'bg' | 'audio' | 'cursor' | 'metadata'>('layout');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  // Set CSS variables on the preview box based on state
  useEffect(() => {
    const preview = document.getElementById('profile-live-preview');
    if (preview) {
      preview.style.setProperty('--preview-bg', profile.bgColor);
      preview.style.setProperty('--preview-card-bg', profile.cardColor);
      preview.style.setProperty('--preview-accent', profile.accentColor);
      preview.style.setProperty('--preview-text', profile.textColor);
      preview.style.setProperty('--preview-text-muted', profile.textMutedColor);
      preview.style.setProperty('--preview-border-glow', profile.borderGlowColor);
      preview.style.setProperty('--preview-radius', `${profile.cardRadius}px`);
      preview.style.setProperty('--preview-blur', `${profile.cardBlur}px`);
      preview.style.setProperty('--preview-opacity', `${profile.cardOpacity}`);
      preview.style.setProperty('--preview-font', profile.font);
      preview.style.setProperty('--preview-card-width', profile.cardWidth);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               (name === 'cardOpacity' || name === 'cardBlur' || name === 'cardRadius' || name === 'musicVolume') 
               ? parseFloat(value) : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save customizations');
      }

      setMessage({ type: 'success', text: 'Customizations successfully saved and published!' });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred while saving.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="customizer-layout">
      {/* Settings Form */}
      <form onSubmit={handleSave} className="customizer-form">
        <div className="customizer-tabs">
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'layout' ? 'active' : ''}`}
            onClick={() => setActiveTab('layout')}
          >
            <Layout size={16} /> Layout
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'design' ? 'active' : ''}`}
            onClick={() => setActiveTab('design')}
          >
            <Palette size={16} /> Theme & Colors
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'bg' ? 'active' : ''}`}
            onClick={() => setActiveTab('bg')}
          >
            <Image size={16} /> Background
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            <Music size={16} /> Audio
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'cursor' ? 'active' : ''}`}
            onClick={() => setActiveTab('cursor')}
          >
            <MousePointer size={16} /> Cursors
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'metadata' ? 'active' : ''}`}
            onClick={() => setActiveTab('metadata')}
          >
            <Sliders size={16} /> Profile Details
          </button>
        </div>

        <div className="tab-content glass-card">
          {message && (
            <div className={`form-message ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* TAB 1: Layout */}
          {activeTab === 'layout' && (
            <div className="tab-pane flex flex-col gap-3">
              <h3>Profile Layout</h3>
              <div className="input-group">
                <label className="input-label">Layout Template</label>
                <select name="layout" value={profile.layout} onChange={handleChange} className="input-field">
                  <option value="DEFAULT">Default (Centered Grid)</option>
                  <option value="MINIMAL">Minimalist (No border stark)</option>
                  <option value="SLEEK">Sleek (Lavender Soft Glow)</option>
                  <option value="PORTFOLIO">Portfolio (Side banner layout)</option>
                  <option value="CARDS">Card grid (Separated items)</option>
                  <option value="COMPACT">Compact (Tight content boxes)</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Profile Card Width</label>
                <select name="cardWidth" value={profile.cardWidth} onChange={handleChange} className="input-field">
                  <option value="550px">Slim (550px)</option>
                  <option value="650px">Standard (650px)</option>
                  <option value="750px">Wide (750px)</option>
                  <option value="100%">Full width (Fluid)</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Base Font Family</label>
                <select name="font" value={profile.font} onChange={handleChange} className="input-field">
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Inter">Inter</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: Design & Colors */}
          {activeTab === 'design' && (
            <div className="tab-pane flex flex-col gap-3">
              <h3>Theme & Colors</h3>
              <div className="color-pickers-grid">
                <div className="color-picker-item">
                  <label className="input-label">Background Color</label>
                  <input type="color" name="bgColor" value={profile.bgColor} onChange={handleChange} />
                </div>
                <div className="color-picker-item">
                  <label className="input-label">Card Background</label>
                  <input type="color" name="cardColor" value={profile.cardColor} onChange={handleChange} />
                </div>
                <div className="color-picker-item">
                  <label className="input-label">Accent / Buttons</label>
                  <input type="color" name="accentColor" value={profile.accentColor} onChange={handleChange} />
                </div>
                <div className="color-picker-item">
                  <label className="input-label">Card Glow Border</label>
                  <input type="color" name="borderGlowColor" value={profile.borderGlowColor} onChange={handleChange} />
                </div>
                <div className="color-picker-item">
                  <label className="input-label">Primary Text</label>
                  <input type="color" name="textColor" value={profile.textColor} onChange={handleChange} />
                </div>
                <div className="color-picker-item">
                  <label className="input-label">Secondary Text</label>
                  <input type="color" name="textMutedColor" value={profile.textMutedColor} onChange={handleChange} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Card Opacity ({profile.cardOpacity})</label>
                <input type="range" name="cardOpacity" min="0.1" max="1" step="0.05" value={profile.cardOpacity} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Card Blur ({profile.cardBlur}px)</label>
                <input type="range" name="cardBlur" min="0" max="40" step="1" value={profile.cardBlur} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Card Border Radius ({profile.cardRadius}px)</label>
                <input type="range" name="cardRadius" min="0" max="30" step="2" value={profile.cardRadius} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* TAB 3: Background */}
          {activeTab === 'bg' && (
            <div className="tab-pane flex flex-col gap-3">
              <h3>Wallpapers & Effects</h3>
              <div className="input-group">
                <label className="input-label">Background Type</label>
                <select name="backgroundType" value={profile.backgroundType} onChange={handleChange} className="input-field">
                  <option value="color">Solid Color</option>
                  <option value="gradient">Subtle Gradient</option>
                  <option value="image">Custom Wallpaper Image URL</option>
                </select>
              </div>

              {profile.backgroundType === 'image' && (
                <div className="input-group">
                  <label className="input-label">Image URL</label>
                  <input type="text" name="backgroundUrl" value={profile.backgroundUrl || ''} onChange={handleChange} className="input-field" placeholder="https://domain.com/wallpaper.jpg" />
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Dynamic Effects overlay</label>
                <select name="backgroundEffects" value={profile.backgroundEffects} onChange={handleChange} className="input-field">
                  <option value="none">None (Static background)</option>
                  <option value="particles">Floating Sparks (Particles)</option>
                  <option value="noise">Stark Film Grain / Noise</option>
                  <option value="animated-gradient">Soft Flowing Gradient (Slow animation)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: Audio / Music */}
          {activeTab === 'audio' && (
            <div className="tab-pane flex flex-col gap-3">
              <h3>Audio Playlist & Player</h3>
              <p className="text-muted" style={{ fontSize: '13px' }}>Upload or link an audio track that visitors can play when entering your bio page.</p>
              
              <div className="input-group">
                <label className="input-label">Audio URL (Direct file link .mp3, .ogg)</label>
                <input type="text" name="musicUrl" value={profile.musicUrl || ''} onChange={handleChange} className="input-field" placeholder="https://domain.com/audio.mp3" />
              </div>
              <div className="input-group">
                <label className="input-label">Song Title</label>
                <input type="text" name="musicTitle" value={profile.musicTitle || ''} onChange={handleChange} className="input-field" placeholder="e.g. Lavender Glow" />
              </div>
              <div className="input-group">
                <label className="input-label">Artist / Creator</label>
                <input type="text" name="musicArtist" value={profile.musicArtist || ''} onChange={handleChange} className="input-field" placeholder="e.g. Alternate Band" />
              </div>
              
              <div className="flex align-center gap-1" style={{ fontSize: '13px', marginTop: '8px' }}>
                <input type="checkbox" name="musicAutoplay" id="musicAutoplay" checked={profile.musicAutoplay} onChange={handleChange} />
                <label htmlFor="musicAutoplay">Autoplay audio (Note: restricted by browser policies until user interacts)</label>
              </div>
              <div className="input-group" style={{ marginTop: '8px' }}>
                <label className="input-label">Default Playback Volume ({Math.round(profile.musicVolume * 100)}%)</label>
                <input type="range" name="musicVolume" min="0" max="1" step="0.05" value={profile.musicVolume} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* TAB 5: Cursor */}
          {activeTab === 'cursor' && (
            <div className="tab-pane flex flex-col gap-3">
              <h3>Custom Cursors</h3>
              <div className="input-group">
                <label className="input-label">Cursor Effect</label>
                <select name="cursorStyle" value={profile.cursorStyle} onChange={handleChange} className="input-field">
                  <option value="default">Default OS Pointer</option>
                  <option value="glow">Soft Glowing Trail</option>
                  <option value="sparkles">Sparkling stars on click</option>
                  <option value="custom">Custom Image / SVG Cursor</option>
                </select>
              </div>

              {profile.cursorStyle === 'custom' && (
                <div className="input-group">
                  <label className="input-label">Cursor Image URL (Direct PNG, SVG, max 32x32)</label>
                  <input type="text" name="customCursor" value={profile.customCursor || ''} onChange={handleChange} className="input-field" placeholder="https://domain.com/cursor.png" />
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Metadata details */}
          {activeTab === 'metadata' && (
            <div className="tab-pane flex flex-col gap-3">
              <h3>Profile Info & Metadata</h3>
              <div className="input-group">
                <label className="input-label">Avatar image URL</label>
                <input type="text" name="avatarUrl" value={profile.avatarUrl || ''} onChange={handleChange} className="input-field" placeholder="https://domain.com/pfp.jpg" />
              </div>
              <div className="input-group">
                <label className="input-label">Display Name</label>
                <input type="text" name="displayName" value={profile.displayName} onChange={handleChange} className="input-field" />
              </div>
              <div className="input-group">
                <label className="input-label">Bio Description</label>
                <textarea name="bio" value={profile.bio || ''} onChange={handleChange} className="input-field" rows={4} style={{ resize: 'none' }} placeholder="Write a short summary..."></textarea>
              </div>
              <div className="input-group">
                <label className="input-label">Location</label>
                <input type="text" name="location" value={profile.location || ''} onChange={handleChange} className="input-field" placeholder="e.g. Auckland, NZ" />
              </div>
              <div className="input-group">
                <label className="input-label">Page-Enter Text (Click-to-enter prompt)</label>
                <input type="text" name="entryText" value={profile.entryText || ''} onChange={handleChange} className="input-field" placeholder="e.g. click to proceed" />
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', alignSelf: 'flex-start' }} disabled={saving}>
          {saving ? 'Publishing...' : 'Save & Publish Changes'}
        </button>
      </form>

      {/* Real-time Live Preview Panel */}
      <div className="customizer-preview-panel">
        <div className="preview-sticky-box">
          <div className="preview-header flex align-center gap-1">
            <Eye size={14} />
            <span>Interactive Real-time Preview</span>
          </div>

          <div id="profile-live-preview" className="profile-preview-card-wrapper">
            <div className="preview-card-inner">
              {/* Avatar & Display Details */}
              <div className="preview-avatar-box">
                <div className={`preview-pfp ${profile.avatarStyle}`}>
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt="PFP" />
                  ) : (
                    <div className="preview-pfp-fallback">PFP</div>
                  )}
                </div>
                <h2 className="preview-display-name">{profile.displayName || 'Display Name'}</h2>
                <span className="preview-username">@{profile.slug}</span>
              </div>

              {/* Bio description */}
              {profile.bio && <p className="preview-bio">{profile.bio}</p>}

              {/* Location indicator */}
              {profile.location && <span className="preview-location">{profile.location}</span>}

              {/* Mock custom links */}
              <div className="preview-links-stack">
                <div className="preview-link-btn">Demo Custom URL 1</div>
                <div className="preview-link-btn">Demo Custom URL 2</div>
              </div>

              {/* Mock music player */}
              {profile.musicUrl && (
                <div className="preview-music-player">
                  <Music4 size={14} className="music-pulse-icon" />
                  <div className="music-details">
                    <span className="song-title">{profile.musicTitle || 'Unfinished track'}</span>
                    <span className="song-artist">{profile.musicArtist || 'Unknown Artist'}</span>
                  </div>
                  <Volume2 size={14} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
