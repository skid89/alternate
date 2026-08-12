'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Compass, 
  MapPin, 
  ExternalLink, 
  Disc, 
  ShieldCheck, 
  Flame, 
  Check, 
  X,
  Search,
  MessageSquare,
  Send,
  Sparkles
} from 'lucide-react';
import '@/styles/landing.css';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [typedStatus, setTypedStatus] = useState('');
  const router = useRouter();

  // Debounced username availability check
  useEffect(() => {
    if (!username) {
      setAvailability('idle');
      return;
    }
    const cleanUser = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUser)) {
      setAvailability('taken'); // visually indicate not-allowed as unavailable
      return;
    }

    setAvailability('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUser, email: 'check@alternate.lol', password: 'checking-only' })
        });
        const data = await res.json();
        
        // If the error is 'Username is already taken' or similar
        if (data.error && data.error.includes('Username is already taken')) {
          setAvailability('taken');
        } else {
          setAvailability('available');
        }
      } catch (_) {
        setAvailability('available');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (availability === 'available' && username) {
      router.push(`/register?username=${username.trim().toLowerCase()}`);
    }
  };

  return (
    <div className="landing-viewport animate-fade">
      {/* Dynamic flowing background gradient */}
      <div className="landing-bg-gradient"></div>

      {/* Navigation Header */}
      <header className="landing-nav">
        <div className="container flex align-center justify-between">
          <Link href="/" className="landing-logo">/alternate</Link>
          <nav className="landing-nav-links flex align-center gap-3">
            <Link href="/leaderboard" className="nav-link">Leaderboard</Link>
            <a href="https://discord.gg/alternate" target="_blank" className="nav-link flex align-center gap-1">
              Community <ExternalLink size={12} />
            </a>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>Dashboard</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section Container */}
      <section className="container landing-hero-grid">
        {/* Left Column: marketing details */}
        <div className="landing-hero-left flex flex-col justify-center">
          <span className="premium-label flex align-center gap-1">
            <Sparkles size={12} /> best private linker
          </span>
          <h1 className="landing-main-title">
            /alternate
          </h1>
          <p className="landing-description">
            Create highly customizable personal bio-link profiles containing links, social badges, music, Discord/Roblox live presence, text animations, badging, and visual glowing effects. Designed black, white, and violet.
          </p>

          {/* Username Search bar */}
          <form onSubmit={handleClaim} className="username-claim-form" style={{ marginTop: '24px' }}>
            <div className="input-search-wrapper">
              <span className="domain-prefix">alternate.lol/</span>
              <input 
                type="text" 
                placeholder="username" 
                value={username} 
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                required
              />
              <div className="availability-indicator">
                {availability === 'checking' && <span className="indicator-dot loading"></span>}
                {availability === 'available' && <Check size={16} className="text-success" style={{ color: '#10b981' }} />}
                {availability === 'taken' && <X size={16} className="text-error" style={{ color: '#ef4444' }} />}
              </div>
            </div>
            <button 
              type="submit" 
              className={`btn ${availability === 'available' ? 'btn-accent' : 'btn-secondary'}`}
              disabled={availability !== 'available'}
            >
              Claim
            </button>
          </form>

          {/* Community Promotion Card */}
          <div className="community-card glass-card flex justify-between align-center" style={{ marginTop: '32px' }}>
            <div className="flex flex-col gap-1">
              <span style={{ fontWeight: 700, fontSize: '14px' }} className="flex align-center gap-1">
                <Flame size={16} style={{ color: '#8b5cf6' }} /> Private & Premium Slugs
              </span>
              <p className="text-muted" style={{ fontSize: '12px', maxWidth: '340px' }}>
                Join our Discord community to purchase premium verification badges, custom domains, and lifetime entitlements.
              </p>
            </div>
            <a 
              href="https://discord.gg/alternate" 
              target="_blank" 
              className="btn btn-secondary" 
              style={{ fontSize: '12px', padding: '8px 14px' }}
            >
              discord.gg/alternate
            </a>
          </div>
        </div>

        {/* Right Column: Realistic Live Preview Card */}
        <div className="landing-hero-right flex justify-center align-center">
          <div className="preview-card-outer">
            {/* Live active glow bubble behind preview */}
            <div className="preview-glow-background"></div>

            <div className="profile-card-preview-mock">
              {/* Avatar decoration mock */}
              <div className="mock-avatar-container circle">
                <div className="mock-pfp flex align-center justify-center">
                  <span style={{ fontSize: '20px', fontWeight: 800 }}>A</span>
                </div>
                {/* Simulated decorative ring */}
                <div className="mock-deco-ring"></div>
              </div>

              <h2 className="mock-name flex align-center gap-1">
                Alternate Creator
                <ShieldCheck size={16} style={{ color: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' }} />
              </h2>
              <span className="mock-slug">@alternate</span>

              {/* Badges */}
              <div className="mock-badges-row">
                <span className="mock-badge" style={{ color: '#ef4444' }} title="Staff">★</span>
                <span className="mock-badge" style={{ color: '#10b981' }} title="Developer">&lt;/&gt;</span>
                <span className="mock-badge" style={{ color: '#f59e0b' }} title="Premium">✦</span>
              </div>

              <span className="mock-location">
                <MapPin size={10} /> Cyberspace
              </span>

              <p className="mock-bio">
                Alternate allows you to customize colors, card margins, background grain filters, loop background music, and track custom analytics logs.
              </p>

              {/* Links */}
              <div className="mock-links">
                <div className="mock-link-item highlight">Official Server</div>
                <div className="mock-link-item">Leaderboard rankings</div>
              </div>

              {/* Presence */}
              <div className="mock-presence-box">
                <div className="flex align-center gap-2">
                  <div className="mock-presence-avatar">
                    <div className="status-indicator online"></div>
                  </div>
                  <div className="mock-presence-text flex flex-col align-start">
                    <span style={{ fontWeight: 700, fontSize: '12px' }}>Playing Roblox</span>
                    <span className="text-muted" style={{ fontSize: '10px' }}>Exploring Alternate World 🎮</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
