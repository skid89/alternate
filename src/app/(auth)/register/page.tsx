'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Sparkles } from 'lucide-react';
import '@/styles/auth.css';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return;

    // Client validation
    if (!/^[a-z0-9_]{3,20}$/.test(username.trim().toLowerCase())) {
      setError('Username must be 3-20 characters, lowercase alphanumeric or underscores.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim().toLowerCase(), 
          email: email.trim().toLowerCase(), 
          password 
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-viewport animate-fade">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <Link href="/" className="auth-logo">/alternate</Link>
          <p className="auth-subtitle">Claim your username link and design your page</p>
        </div>

        {error && (
          <div className="auth-toast-error">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Claim Username</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--card-bg-elevated)', border: '1px solid var(--card-border)', borderRadius: '12px', paddingLeft: '14px' }}>
              <span className="text-muted" style={{ fontSize: '14px' }}>alternate.lol/</span>
              <input 
                type="text" 
                className="input-field" 
                placeholder="username" 
                value={username} 
                onChange={e => setUsername(e.target.value.toLowerCase())} 
                style={{ border: 'none', background: 'transparent', flexGrow: 1, paddingLeft: '4px' }}
                required 
              />
            </div>
            <span className="text-muted" style={{ fontSize: '10px' }}>Only lowercase letters, numbers, and underscores are allowed.</span>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="you@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Create Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="•••••••• (Min 8 characters)" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary animate-pulse" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            <UserPlus size={16} /> {loading ? 'Registering...' : 'Claim Linker'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}
