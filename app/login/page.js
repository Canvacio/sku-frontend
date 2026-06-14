'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = 'https://sku-backend-production.up.railway.app';

const COFFEE_IMAGE = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80&auto=format&fit=crop';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials. Please try again.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('email', data.email);
      router.push('/chat');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          display: flex;
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ── Left panel ── */
        .login-left {
          position: relative;
          flex: 1;
          display: none;
          overflow: hidden;
        }
        @media (min-width: 768px) { .login-left { display: block; } }

        .login-left-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .login-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(44, 24, 16, 0.45) 0%,
            rgba(44, 24, 16, 0.1) 60%,
            rgba(44, 24, 16, 0.7) 100%
          );
        }

        .login-left-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px 40px;
        }

        .login-left-brand {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .login-left-tagline {
          color: #fff;
        }

        .login-left-tagline h2 {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }

        .login-left-tagline p {
          font-size: 0.95rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.8);
          max-width: 340px;
        }

        /* ── Right panel ── */
        .login-right {
          width: 100%;
          display: flex;
          flex-direction: column;
          padding: 24px;
          background: var(--cream);
        }
        @media (min-width: 768px) {
          .login-right {
            width: 480px;
            flex-shrink: 0;
            padding: 40px 56px;
          }
        }

        .login-right-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: auto;
          padding-bottom: 40px;
        }

        .login-right-brand {
          font-size: 1rem;
          font-weight: 700;
          color: var(--brown-900);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .login-help-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          transition: border-color 0.15s;
        }
        .login-help-btn:hover { border-color: var(--brown-500); color: var(--brown-700); }

        .login-form-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 380px;
          width: 100%;
          margin: 0 auto;
        }

        .login-heading {
          font-size: clamp(1.6rem, 3vw, 2rem);
          font-weight: 800;
          color: var(--brown-900);
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }

        .login-subheading {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 36px;
        }

        .login-error {
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          color: #991B1B;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .login-field {
          margin-bottom: 18px;
        }

        .login-field-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }

        .login-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.02em;
        }

        .login-forgot {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--brown-700);
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
        }
        .login-forgot:hover { text-decoration: underline; }

        .login-input-wrap {
          position: relative;
        }

        .login-input {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          font-size: 0.9rem;
          color: var(--text-primary);
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .login-input:focus {
          border-color: var(--brown-500);
          box-shadow: 0 0 0 3px rgba(139, 94, 60, 0.1);
        }
        .login-input::placeholder { color: var(--text-muted); }

        .login-eye {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          padding: 4px;
        }
        .login-eye:hover { color: var(--brown-700); }

        .login-btn {
          width: 100%;
          padding: 14px;
          background: var(--brown-800);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s, transform 0.1s;
          font-family: inherit;
          margin-top: 8px;
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) { background: var(--brown-900); transform: translateY(-1px); }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .login-divider::before, .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .login-social-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .login-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          background: #fff;
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          font-family: inherit;
        }
        .login-social-btn:hover { border-color: var(--brown-300); background: var(--cream); }

        .login-footer {
          text-align: center;
          margin-top: 28px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .login-footer a, .login-join {
          color: var(--brown-700);
          font-weight: 700;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
        }
        .login-join:hover, .login-footer a:hover { text-decoration: underline; }

        .login-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 32px;
          margin-top: auto;
          border-top: 1px solid var(--border);
          font-size: 0.75rem;
          color: var(--text-muted);
          flex-wrap: wrap;
          gap: 8px;
        }

        .login-bottom-links {
          display: flex;
          gap: 16px;
        }
        .login-bottom-links a {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.75rem;
        }
        .login-bottom-links a:hover { color: var(--brown-700); }
      `}</style>

      <div className="login-root">

        {/* Left panel — coffee image + tagline */}
        <div className="login-left">
        <img
          src={COFFEE_IMAGE}
          alt="Freshly poured coffee"
          className="login-left-img"
        />
          <div className="login-left-overlay" />
          <div className="login-left-content">
            <div className="login-left-tagline">
              <h2>The science of coffee, get your best coffee bean.</h2>
              <p>Join our community of enthusiasts and discover your next favorite roast through AI-powered curation.</p>
            </div>
          </div>
        </div>

        {/* Right panel — login form */}
        <div className="login-right">
          <div className="login-right-top">
            <Link href="/chat" className="login-right-brand" style={{ textDecoration: 'none' }}>
            <span>☕</span>
            <span>Cofibean AI</span>
          </Link>
            <button className="login-help-btn">?</button>
          </div>

          <div className="login-form-wrap">
            <h1 className="login-heading">Welcome Back</h1>
            <p className="login-subheading">Please enter your details to access your curator dashboard.</p>

            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <div className="login-field-header">
                <label className="login-label">Email Address</label>
              </div>
              <div className="login-input-wrap">
                <input
                  className="login-input"
                  type="email"
                  placeholder="curator@cofibean.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-field-header">
                <label className="login-label">Password</label>
                <button className="login-forgot" type="button">Forgot Password?</button>
              </div>
              <div className="login-input-wrap">
                <input
                  className="login-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  className="login-eye"
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={!email || !password || loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <div className="login-divider">or continue with</div>

            <div className="login-social-row">
              <button className="login-social-btn" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="login-social-btn" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>
            </div>

            <div className="login-footer">
              Don&apos;t have an account?
              <button className="login-join" type="button">Join the club</button>
            </div>
          </div>

          <div className="login-bottom-bar">
            <span>© 2025 Cofibean AI. Expertly Curated.</span>
            <div className="login-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="/chat">Contact Support</a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}