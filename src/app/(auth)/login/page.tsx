'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Disc, LogIn } from 'lucide-react';
import '@/styles/auth.css';

export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlError = searchParams.get('error');
  const errorMsg = urlError === 'session_required' ? 'You must be logged in to view the dashboard.' :
                   urlError === 'token_exchange' ? 'Failed to authenticating OAuth credentials with Discord.' :
                   urlError === 'oauth_configuration' ? 'Discord connection credentials are misconfigured.' :
                   urlError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  // Discord auth link (needs Client ID)
  // Let's hardcode redirect or trigger callback URL from Discord config
  const handleDiscordOAuth = () => {
    // Redirect to Discord OAuth flow handled by server redirect URI
    router.push('/api/auth/callback/discord');
  };

  return (
    <div className="auth-viewport animate-fade">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <Link href="/" className="auth-logo">/alternate</Link>
          <p className="auth-subtitle">Sign in to manage your profile linker</p>
        </div>

        {errorMsg && !error && (
          <div className="auth-toast-error">
            ⚠ {errorMsg}
          </div>
        )}

        {error && (
          <div className="auth-toast-error">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Username or Email</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. admin" 
              value={loginId} 
              onChange={e => setLoginId(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            <LogIn size={16} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">or connect identity</div>

        <div className="oauth-stack">
          <button 
            onClick={handleDiscordOAuth}
            className="btn btn-oauth-discord" 
            style={{ width: '100%', display: 'flex', gap: '8px' }}
          >
            <Disc size={16} /> Sign In with Discord
          </button>
        </div>

        <div className="auth-footer">
          Don&apos;t have an account? <Link href="/register">Claim one here</Link>
        </div>
      </div>
    </div>
  );
}
