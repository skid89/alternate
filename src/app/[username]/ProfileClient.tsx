'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Disc, 
  MapPin, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  MessageSquare,
  Send,
  Pin
} from 'lucide-react';
import { DiscordPresence, RobloxPresence } from '@/lib/presence';
import '@/styles/profile.css';

interface LinkData {
  id: string;
  title: string;
  url: string;
  isLarge: boolean;
}

interface SocialData {
  id: string;
  platform: string;
  value: string;
}

interface CommentData {
  id: string;
  authorName: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

interface ProfileProps {
  profile: {
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
    commentsEnabled: boolean;
    discordId: string | null;
    discordPresenceEnabled: boolean;
    robloxId: string | null;
    robloxPresenceEnabled: boolean;
  };
  badges: Array<{ name: string; icon: string; color: string }>;
  links: LinkData[];
  socials: SocialData[];
  comments: CommentData[];
  discordPresence: DiscordPresence | null;
  robloxPresence: RobloxPresence | null;
}

const getBadgeIcon = (name: string, color: string) => {
  switch (name.toLowerCase()) {
    case 'staff':
      return (
        <span className="badge-icon-tooltip-wrapper" data-tooltip="Staff">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </span>
      );
    case 'developer':
      return (
        <span className="badge-icon-tooltip-wrapper" data-tooltip="Developer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </span>
      );
    case 'verified':
      return (
        <span className="badge-icon-tooltip-wrapper" data-tooltip="Verified">
          <svg width="14" height="14" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </span>
      );
    case 'premium':
      return (
        <span className="badge-icon-tooltip-wrapper" data-tooltip="Premium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>
        </span>
      );
    case 'supporter':
      return (
        <span className="badge-icon-tooltip-wrapper" data-tooltip="Supporter">
          <svg width="14" height="14" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </span>
      );
    default:
      return (
        <span className="badge-icon-tooltip-wrapper" data-tooltip={name}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><circle cx="12" cy="12" r="10"/></svg>
        </span>
      );
  }
};

export default function ProfileClient({
  profile,
  badges,
  links,
  socials,
  comments,
  discordPresence,
  robloxPresence
}: ProfileProps) {
  const avatarSrc = profile.avatarUrl || "/pfp.png";
  const musicSrc = profile.musicUrl || "/mp3.mp3";

  const [entered, setEntered] = useState(!profile.entryText);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  
  // Custom comments states
  const [commentList, setCommentList] = useState<CommentData[]>(comments);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set Profile CSS variables globally
  useEffect(() => {
    document.documentElement.style.setProperty('--profile-bg', profile.bgColor);
    document.documentElement.style.setProperty('--profile-card-bg', profile.cardColor);
    document.documentElement.style.setProperty('--profile-accent', profile.accentColor);
    document.documentElement.style.setProperty('--profile-text', profile.textColor);
    document.documentElement.style.setProperty('--profile-text-muted', profile.textMutedColor);
    document.documentElement.style.setProperty('--profile-border-glow', profile.borderGlowColor);
    document.documentElement.style.setProperty('--profile-radius', `${profile.cardRadius}px`);
    document.documentElement.style.setProperty('--profile-blur', `${profile.cardBlur}px`);
    document.documentElement.style.setProperty('--profile-opacity', `${profile.cardOpacity}`);
    document.documentElement.style.setProperty('--profile-card-width', profile.cardWidth);
    
    // Apply font family
    document.body.style.fontFamily = `"${profile.font}", sans-serif`;
  }, [profile]);

  // Audio Playback Hooks
  useEffect(() => {
    if (musicSrc) {
      const audio = new Audio(musicSrc);
      audio.loop = true;
      audio.volume = profile.musicVolume;
      audioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      });

      return () => {
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [profile.musicUrl, profile.musicVolume]);

  const handleEnter = () => {
    setEntered(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Autoplay failed due to user-agent gesture security restrictions', err);
      });
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  // Click tracking client action
  const trackLinkClick = async (linkId: string) => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: profile.slug, type: 'click', target: linkId })
    }).catch(() => {});
  };

  // Submit Comments
  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentText.trim()) return;
    setCommenting(true);

    try {
      const res = await fetch('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          authorName: authorName.trim(),
          content: commentText.trim()
        })
      });

      if (res.ok) {
        setAuthorName('');
        setCommentText('');
        // Add pending / mock comment
        const newC = {
          id: Math.random().toString(),
          authorName: authorName.trim(),
          content: commentText.trim(),
          isPinned: false,
          createdAt: new Date().toISOString()
        };
        setCommentList(prev => [newC, ...prev]);
        alert('Comment submitted! It will appear once approved by the profile owner.');
      }
    } catch (_) {
      alert('Failed to submit comment.');
    } finally {
      setCommenting(false);
    }
  };

  // Custom Cursor rendering
  useEffect(() => {
    if (profile.cursorStyle === 'glow') {
      const cursorGlow = document.createElement('div');
      cursorGlow.className = 'cursor-trail-glow';
      document.body.appendChild(cursorGlow);

      const moveHandler = (e: MouseEvent) => {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
      };
      window.addEventListener('mousemove', moveHandler);

      return () => {
        window.removeEventListener('mousemove', moveHandler);
        cursorGlow.remove();
      };
    }
  }, [profile.cursorStyle]);

  return (
    <div className={`profile-viewport layout-${profile.layout.toLowerCase()}`}>
      {/* Film Grain / Noise Overlay */}
      {profile.backgroundEffects === 'noise' && <div className="noise-overlay"></div>}
      
      {/* Floating Sparkles Background */}
      {profile.backgroundEffects === 'particles' && (
        <div className="particles-container">
          {[...Array(25)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${10 + Math.random() * 15}s`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Entry Screen Overlay */}
      {!entered && (
        <div className="entry-overlay-screen" onClick={handleEnter}>
          <div className="entry-content">
            <span className="entry-text-prompt">{profile.entryText || 'Click to Enter'}</span>
          </div>
        </div>
      )}

      {/* Main Profile Page Body */}
      {entered && (
        <div className="profile-wrapper animate-scale">
          {/* Audio Player float */}
          {profile.musicUrl && (
            <div className="floating-music-bar">
              <button onClick={togglePlayback} className="music-control-btn">
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <div className="song-track-info">
                <span className="scrolling-title">{profile.musicTitle || 'Unknown Track'}</span>
                <span className="scrolling-artist">{profile.musicArtist || 'Unknown Artist'}</span>
              </div>
              <button onClick={toggleMute} className="music-control-btn">
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          )}

          {/* Profile Card */}
          <div className="profile-card">
            {/* Banner top */}
            {profile.bannerUrl && (
              <div className="profile-card-banner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.bannerUrl} alt="Banner" />
              </div>
            )}

            {/* Avatar & Badges */}
            <div className="profile-header">
              <div className={`avatar-container ${profile.avatarStyle}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarSrc} alt="PFP" className="profile-pfp" />
                {profile.avatarDecoration && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarDecoration} alt="Decoration" className="avatar-decoration" />
                )}
              </div>

              <div className="display-name-row">
                <h1 className="display-name-text">{profile.displayName}</h1>
              </div>
              <span className="slug-tag">@{profile.slug}</span>

              {/* Badges List */}
              {badges.length > 0 && (
                <div className="profile-badges-row">
                  {badges.map((b, idx) => (
                    <span 
                      key={idx} 
                      className="badge-icon-item" 
                      style={{ color: b.color }} 
                    >
                      {getBadgeIcon(b.name, b.color)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            {profile.location && (
              <span className="location-tag">
                <MapPin size={12} />
                {profile.location}
              </span>
            )}

            {/* Bio */}
            {profile.bio && <p className="profile-bio-text">{profile.bio}</p>}

            {/* Discord Active Presence Status */}
            {profile.discordPresenceEnabled && discordPresence && (
              <div className="presence-integration-card discord-presence">
                <div className="flex align-center gap-2">
                  <div className="presence-avatar">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={discordPresence.avatar} alt="Discord Avatar" />
                    <span className={`status-dot ${discordPresence.status}`}></span>
                  </div>
                  <div className="presence-details flex flex-col align-start">
                    <span style={{ fontWeight: 700 }} className="presence-user">@{discordPresence.username}</span>
                    <span className="presence-status-message text-muted">
                      {discordPresence.customStatus || discordPresence.status}
                    </span>
                    {discordPresence.spotify && (
                      <span className="presence-spotify-song text-muted">
                        Listening to 🎵 <strong>{discordPresence.spotify.song}</strong> by {discordPresence.spotify.artist}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Roblox Active Presence Status */}
            {profile.robloxPresenceEnabled && robloxPresence && (
              <div className="presence-integration-card roblox-presence">
                <div className="flex align-center gap-2">
                  <div className="presence-details flex flex-col align-start">
                    <span style={{ fontWeight: 700 }}>Roblox ID: {profile.robloxId}</span>
                    <span className="presence-status-message text-muted">
                      {robloxPresence.presenceType === 2 ? (
                        <span style={{ color: '#10b981' }}>🎮 Currently Playing: {robloxPresence.lastLocation}</span>
                      ) : robloxPresence.presenceType === 1 ? (
                        <span style={{ color: '#3b82f6' }}>Online on Roblox website</span>
                      ) : (
                        <span>Offline</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Links stack */}
            <div className="links-stack">
              {links.map((link) => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank"
                  onClick={() => trackLinkClick(link.id)}
                  className={`link-btn-item ${link.isLarge ? 'highlight-btn' : ''}`}
                >
                  <span>{link.title}</span>
                  <ExternalLink size={14} />
                </a>
              ))}
            </div>

            {/* Socials Row */}
            {socials.length > 0 && (
              <div className="socials-row">
                {socials.map((s) => (
                  <a 
                    key={s.id} 
                    href={s.value.startsWith('http') ? s.value : `https://${s.platform}.com/${s.value}`} 
                    target="_blank" 
                    className="social-icon-btn"
                    title={s.platform}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>{s.platform.substring(0,2).toUpperCase()}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Comments Section */}
            {profile.commentsEnabled && (
              <div className="profile-comments-container">
                <div className="comments-header">
                  <MessageSquare size={16} />
                  <h3>Community Comments</h3>
                </div>

                {/* Comment Post Form */}
                <form onSubmit={submitComment} className="comment-form-box">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    value={authorName} 
                    onChange={e => setAuthorName(e.target.value)} 
                    required 
                  />
                  <div className="comment-submit-row">
                    <input 
                      type="text" 
                      placeholder="Post a comment..." 
                      value={commentText} 
                      onChange={e => setCommentText(e.target.value)} 
                      required 
                    />
                    <button type="submit" disabled={commenting}>
                      <Send size={14} />
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="comments-scroller">
                  {commentList.map((c) => (
                    <div key={c.id} className="comment-bubble">
                      <div className="comment-bubble-header">
                        <span className="comment-author">{c.authorName}</span>
                        {c.isPinned && <Pin size={10} style={{ color: 'var(--profile-accent)', fill: 'var(--profile-accent)' }} />}
                        <span className="comment-time">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="comment-bubble-text">{c.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
