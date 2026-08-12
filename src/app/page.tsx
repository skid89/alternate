'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Check, 
  X,
  ChevronDown
} from 'lucide-react';
import '@/styles/landing.css';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  // Debounced username availability check
  useEffect(() => {
    if (!username) {
      setAvailability('idle');
      setErrorMsg('');
      return;
    }
    const cleanUser = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUser)) {
      setAvailability('taken');
      setErrorMsg('3-20 chars, lowercase alphanumeric & underscores');
      return;
    }

    setAvailability('checking');
    setErrorMsg('');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${cleanUser}`);
        const data = await res.json();
        
        if (data.available) {
          setAvailability('available');
        } else {
          setAvailability('taken');
          setErrorMsg(data.error || 'Username is already taken');
        }
      } catch (_) {
        setAvailability('available');
      }
    }, 300);

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
      {/* Background gradients */}
      <div className="landing-glow-left"></div>
      <div className="landing-glow-right"></div>
      <div className="landing-bg-dots"></div>

      {/* Navigation Header */}
      <header className="landing-nav">
        <div className="container flex align-center justify-between">
          <Link href="/" className="landing-logo">/alternate</Link>
          <nav className="landing-nav-links flex align-center gap-3">
            <Link href="/leaderboard" className="nav-link">Leaderboard</Link>
            <a href="https://discord.gg/alternate" target="_blank" className="nav-link">Discord</a>
            <Link href="/" className="nav-link">Partner</Link>
            <Link href="/" className="nav-link">Pricing</Link>
            <Link href="/login" className="btn btn-login-nav">Dashboard</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section Container */}
      <section className="container landing-hero-grid">
        {/* Left Column: marketing details */}
        <div className="landing-hero-left flex flex-col justify-center">
          <h1 className="landing-main-title">
            One link.<br />
            <span className="gradient-text">Entirely yours.</span>
          </h1>
          <p className="landing-description">
            Build a fast, expressive profile with real layouts, music, live widgets, and the details that make it unmistakably you.
          </p>

          {/* Username Search bar */}
          <form onSubmit={handleClaim} className="username-claim-form">
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
              className={`btn btn-claim ${availability === 'available' ? 'btn-accent' : 'btn-disabled'}`}
              disabled={availability !== 'available'}
            >
              Claim
            </button>
          </form>
          {errorMsg && <span className="claim-error-text">{errorMsg}</span>}

          {/* Stats Row */}
          <div className="stats-row flex align-center gap-4">
            <div className="stat-item">
              <span className="stat-number">29,400+</span>
              <span className="stat-label">Creators</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">586</span>
              <span className="stat-label">Premium</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">2M</span>
              <span className="stat-label">Profile Views</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sleek wowie profile preview */}
        <div className="landing-hero-right flex justify-center align-center">
          <div className="preview-card-outer">
            <div className="preview-glow-background"></div>
            <div className="profile-card-preview-mock">
              {/* Top stats info */}
              <div className="mock-top-stats">
                <span className="mock-views-badge flex align-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  6,239
                </span>
                <span className="mock-rank-badge">
                  # 1
                </span>
              </div>

              {/* Avatar decoration mock */}
              <div className="mock-avatar-container">
                <div className="mock-pfp">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=80" alt="Avatar" />
                </div>
                <div className="mock-deco-ring"></div>
              </div>

              <h2 className="mock-name">
                wowie
              </h2>

              {/* Badges */}
              <div className="mock-badges-row">
                <span className="mock-badge-icon" title="Bug Hunter" style={{ color: '#a78bfa' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </span>
                <span className="mock-badge-icon" title="Verified" style={{ color: '#3b82f6' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </span>
                <span className="mock-badge-icon" title="Developer" style={{ color: '#10b981' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </span>
                <span className="mock-badge-icon" title="Premium" style={{ color: '#f59e0b' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>
                </span>
              </div>

              <span className="mock-location">
                Website made in Vietnam.
              </span>

              {/* Prebuilt Pre-configured Social Buttons */}
              <div className="mock-links-grid">
                <div className="mock-link-pill">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.8 19.9L5.2 22.8c-.8.2-1.7-.3-1.9-1.2L.5 8c-.2-.8.3-1.7 1.2-1.9L15.3.5c.8-.2 1.7.3 1.9 1.2l2.8 13.6c.2.8-.3 1.7-1.2 1.9l-1.9.4 1 4.7 1-.4z"/></svg>
                </div>
                <div className="mock-link-pill">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.3 5.15a16.5 16.5 0 0 0-4.1-1.27.07.07 0 0 0-.07.03c-.18.33-.38.74-.51 1.05a15.2 15.2 0 0 0-4.88 0c-.13-.3-.34-.72-.53-1.05a.07.07 0 0 0-.07-.03 16.5 16.5 0 0 0-4.1 1.27c-.01 0-.02.01-.02.02a16.8 16.8 0 0 0-3.24 7.6c0 .01 0 .02.01.03a16.7 16.7 0 0 0 5 2.5.07.07 0 0 0 .08-.02c.4-.55.76-1.13 1.07-1.74a.07.07 0 0 0-.04-.1 11 11 0 0 1-1.57-.75.08.08 0 0 1-.01-.12c.1-.08.2-.15.3-.23a.07.07 0 0 1 .07 0 12 12 0 0 0 9.8 0 .07.07 0 0 1 .07 0c.1.08.2.15.3.23a.08.08 0 0 1-.01.12c-.5.3-.98.55-1.57.75a.07.07 0 0 0-.04.1 17.5 17.5 0 0 0 1.08 1.73.07.07 0 0 0 .08.03 16.6 16.6 0 0 0 5.04-2.5.07.07 0 0 0 .01-.02 16.7 16.7 0 0 0-3.23-7.6c-.01 0-.01-.01-.02-.02zM8.5 13.4c-.9 0-1.63-.82-1.63-1.83s.72-1.83 1.63-1.83c.9 0 1.63.83 1.62 1.83S9.4 13.4 8.5 13.4zm7 0c-.9 0-1.63-.82-1.63-1.83s.72-1.83 1.63-1.83c.9 0 1.63.83 1.63 1.83.01 1-.72 1.83-1.63 1.83z"/></svg>
                </div>
                <div className="mock-link-pill">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
                </div>
                <div className="mock-link-pill">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.5 3v13.5a3.5 3.5 0 1 1-5-3.13V9.33a7.5 7.5 0 0 0 6 6.67V10a5.5 5.5 0 0 1-1-9.9V0h3v3a6 6 0 0 0 3.5 1.5v3a9 9 0 0 1-6.5-4.5z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Indicator */}
      <footer className="landing-footer flex justify-center align-center">
        <div className="scroll-indicator flex flex-col align-center">
          <ChevronDown size={16} className="scroll-icon" />
          <span>Explore what is inside</span>
        </div>
      </footer>
    </div>
  );
}
