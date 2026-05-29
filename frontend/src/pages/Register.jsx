import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
  }

  return (
    <>
      <style>{`
        .reg-page {
          min-height: 100vh;
          display: flex;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* ─── LEFT: Form panel ─── */
        .reg-form-side {
          width: 46%;
          flex-shrink: 0;
          background: #080808;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 80px 52px 40px;
          position: relative;
          overflow: hidden;
        }
        .reg-form-side::before {
          content: '';
          position: absolute; width: 420px; height: 420px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 65%);
          top: -140px; right: -80px; pointer-events: none;
        }
        .reg-top-nav {
          display: flex; align-items: center; justify-content: space-between;
          position: relative; z-index: 1; margin-bottom: 8px;
        }
        .reg-logo {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
          transition: opacity 0.15s;
        }
        .reg-logo:hover { opacity: 0.8; }
        .reg-logo-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(145deg, #0d9488 0%, #0f766e 60%, #2dd4bf 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 12px rgba(13,148,136,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
          flex-shrink: 0;
        }
        .reg-logo-text {
          font-size: 19px; font-weight: 800; color: #fff;
          letter-spacing: -0.4px;
        }
        .reg-login-link {
          font-size: 13px; color: rgba(255,255,255,0.35);
        }
        .reg-login-link a { color: #14b8a6; font-weight: 500; }
        .reg-login-link a:hover { color: #5eead4; }

        .reg-form-body {
          position: relative; z-index: 1;
          width: 100%; max-width: 380px;
          margin: 0 auto;
        }
        .reg-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(13,148,136,0.1); border: 1px solid rgba(13,148,136,0.22);
          border-radius: 100px; padding: 5px 13px;
          font-size: 11.5px; font-weight: 600; color: #5eead4;
          letter-spacing: 0.4px; margin-bottom: 20px;
        }
        .reg-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #14b8a6; box-shadow: 0 0 8px rgba(129,140,248,0.7);
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .reg-title {
          font-size: 28px; font-weight: 800; color: #fff;
          letter-spacing: -0.6px; line-height: 1.2; margin-bottom: 8px;
        }
        .reg-sub {
          font-size: 14px; color: rgba(255,255,255,0.36);
          margin-bottom: 28px; line-height: 1.5;
        }

        /* Field rows */
        .reg-field { margin-bottom: 14px; }
        .reg-label {
          display: block; font-size: 12.5px; font-weight: 500;
          color: rgba(255,255,255,0.5); margin-bottom: 7px; letter-spacing: 0.1px;
        }
        .reg-input-wrap { position: relative; }
        .reg-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.22); pointer-events: none;
        }
        .reg-input {
          width: 100%; padding: 12px 14px 12px 40px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 11px; font-size: 14px; font-family: inherit;
          color: #fff; outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .reg-input::placeholder { color: rgba(255,255,255,0.2); }
        .reg-input:focus {
          border-color: rgba(13,148,136,0.6);
          background: rgba(13,148,136,0.07);
        }

        .reg-submit {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #0d9488, #0f766e);
          color: #fff; border: none; cursor: pointer;
          font-size: 14px; font-weight: 700; font-family: inherit;
          border-radius: 11px; margin-top: 6px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.15s, transform 0.1s;
          box-shadow: 0 4px 24px rgba(13,148,136,0.35);
        }
        .reg-submit:hover { opacity: 0.9; transform: translateY(-1px); }
        .reg-submit:active { transform: scale(0.98); }
        .reg-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .reg-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 16px 0; color: rgba(255,255,255,0.18); font-size: 11.5px;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .reg-divider::before, .reg-divider::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .reg-google {
          width: 100%; padding: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 11px; cursor: pointer;
          font-size: 13.5px; font-weight: 500; font-family: inherit;
          color: rgba(255,255,255,0.75);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .reg-google:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.15); color: #fff;
        }

        .reg-alert {
          background: rgba(239,68,68,0.1); color: #f87171;
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; padding: 11px 14px;
          font-size: 13.5px; margin-bottom: 16px;
        }

        .reg-form-footer {
          position: relative; z-index: 1;
          text-align: center; font-size: 12px;
          color: rgba(255,255,255,0.2);
        }
        .reg-form-footer a { color: rgba(255,255,255,0.35); }
        .reg-form-footer a:hover { color: rgba(255,255,255,0.6); }

        /* ─── RIGHT: Brand panel ─── */
        .reg-brand-side {
          flex: 1;
          background: #07060f;
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          justify-content: space-between;
          padding: 100px 60px 56px;
        }
        .reg-brand-glow-1 {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.22) 0%, transparent 60%);
          top: -120px; right: -100px; pointer-events: none;
        }
        .reg-brand-glow-2 {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 60%);
          bottom: 60px; left: -80px; pointer-events: none;
        }
        .reg-brand-glow-3 {
          position: absolute; width: 250px; height: 250px; border-radius: 50%;
          background: radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 60%);
          bottom: 40%; right: 20%; pointer-events: none;
        }
        .reg-bg-char {
          position: absolute; font-size: 480px; font-weight: 900; line-height: 1;
          color: rgba(13,148,136,0.04); top: -40px; right: -30px;
          pointer-events: none; user-select: none;
          font-family: Georgia, serif;
        }

        .reg-brand-top { position: relative; z-index: 1; }
        .reg-brand-badge {
          display: inline-flex; align-items: center; gap: 6px;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 100px;
          padding: 6px 14px; font-size: 11.5px; color: rgba(255,255,255,0.4);
          margin-bottom: 32px;
        }

        .reg-brand-mid {
          position: relative; z-index: 1; flex: 1;
          display: flex; flex-direction: column; justify-content: center;
          padding: 40px 0;
        }
        .reg-brand-headline {
          font-size: clamp(28px, 3.5vw, 44px); font-weight: 800;
          color: #fff; letter-spacing: -1px; line-height: 1.15;
          margin-bottom: 16px;
        }
        .reg-brand-headline-accent {
          background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 50%, #67e8f9 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .reg-brand-sub {
          font-size: 15px; color: rgba(255,255,255,0.38);
          line-height: 1.65; max-width: 380px; margin-bottom: 44px;
        }

        /* Feature cards */
        .reg-features { display: flex; flex-direction: column; gap: 12px; }
        .reg-feat-card {
          display: flex; align-items: flex-start; gap: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 16px 18px;
          transition: border-color 0.2s, background 0.2s;
        }
        .reg-feat-card:hover {
          border-color: rgba(13,148,136,0.3); background: rgba(13,148,136,0.05);
        }
        .reg-feat-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .reg-feat-icon-1 { background: rgba(13,148,136,0.15); }
        .reg-feat-icon-2 { background: rgba(34,211,238,0.12); }
        .reg-feat-icon-3 { background: rgba(74,222,128,0.12); }
        .reg-feat-text { flex: 1; }
        .reg-feat-title {
          font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,0.85);
          margin-bottom: 2px;
        }
        .reg-feat-desc { font-size: 12px; color: rgba(255,255,255,0.3); line-height: 1.4; }

        .reg-brand-bottom {
          position: relative; z-index: 1;
          padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
        }
        .reg-stat { text-align: center; }
        .reg-stat-num { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
        .reg-stat-lbl { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 1px; }
        .reg-stat-div { width: 1px; height: 28px; background: rgba(255,255,255,0.08); }

        @media (max-width: 860px) {
          .reg-brand-side { display: none; }
          .reg-form-side { width: 100%; padding: 36px 28px; }
        }
      `}</style>

      <div className="reg-page">

        {/* ── LEFT: Form ── */}
        <div className="reg-form-side">
          <div className="reg-top-nav">
            <Link to="/" className="reg-logo">
              <div className="reg-logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M15 3H9a5 5 0 000 10h3v8"/>
                  <path d="M15 3a5 5 0 010 10"/>
                  <line x1="18" y1="3" x2="18" y2="21"/>
                </svg>
              </div>
              <span className="reg-logo-text">Pilcrow</span>
            </Link>
            <span className="reg-login-link">
              Already a member? <Link to="/login">Log in</Link>
            </span>
          </div>

          <div className="reg-form-body">
            <div className="reg-eyebrow">
              <span className="reg-eyebrow-dot" />
              Free forever — no credit card
            </div>
            <h1 className="reg-title">Create your<br />account</h1>
            <p className="reg-sub">Join thousands of writers sharing ideas on Pilcrow.</p>

            {error && <div className="reg-alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="reg-field">
                <label className="reg-label">Full name</label>
                <div className="reg-input-wrap">
                  <span className="reg-input-icon">
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M10 10a4 4 0 100-8 4 4 0 000 8z"/><path d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6"/>
                    </svg>
                  </span>
                  <input className="reg-input" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
                </div>
              </div>

              <div className="reg-field">
                <label className="reg-label">Email address</label>
                <div className="reg-input-wrap">
                  <span className="reg-input-icon">
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="4" width="16" height="13" rx="2"/><path d="M2 7l8 5 8-5"/>
                    </svg>
                  </span>
                  <input className="reg-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                </div>
              </div>

              <div className="reg-field">
                <label className="reg-label">Password</label>
                <div className="reg-input-wrap">
                  <span className="reg-input-icon">
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V6a3 3 0 016 0v3"/>
                    </svg>
                  </span>
                  <input className="reg-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required minLength={6} />
                </div>
              </div>

              <button type="submit" className="reg-submit" disabled={loading}>
                {loading ? 'Creating account…' : (
                  <>
                    Create Account
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 10h10M10 5l5 5-5 5"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="reg-divider">or</div>

            <button className="reg-google" onClick={handleGoogle}>
              <svg width="17" height="17" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="reg-form-footer">
            By signing up you agree to our <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>
          </p>
        </div>

        {/* ── RIGHT: Brand panel ── */}
        <div className="reg-brand-side">
          <div className="reg-brand-glow-1" />
          <div className="reg-brand-glow-2" />
          <div className="reg-brand-glow-3" />
          <div className="reg-bg-char">¶</div>

          <div className="reg-brand-top">
            <div className="reg-brand-badge">
              <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Trusted by writers worldwide
            </div>
          </div>

          <div className="reg-brand-mid">
            <h2 className="reg-brand-headline">
              Your ideas deserve<br />
              <span className="reg-brand-headline-accent">a beautiful home.</span>
            </h2>
            <p className="reg-brand-sub">
              Pilcrow gives you the tools to write clearly, publish instantly, and build an audience that cares about what you have to say.
            </p>

            <div className="reg-features">
              <div className="reg-feat-card">
                <div className="reg-feat-icon reg-feat-icon-1">
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="#14b8a6" strokeWidth="1.8">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                </div>
                <div className="reg-feat-text">
                  <div className="reg-feat-title">Effortless writing</div>
                  <div className="reg-feat-desc">Clean editor, zero distractions. Just you and your words.</div>
                </div>
              </div>
              <div className="reg-feat-card">
                <div className="reg-feat-icon reg-feat-icon-2">
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="#22d3ee" strokeWidth="1.8">
                    <path d="M13 7H7m6 4H7m6 4H7M5 3h10a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                  </svg>
                </div>
                <div className="reg-feat-text">
                  <div className="reg-feat-title">Instant publishing</div>
                  <div className="reg-feat-desc">Hit publish and your post is live globally in seconds.</div>
                </div>
              </div>
              <div className="reg-feat-card">
                <div className="reg-feat-icon reg-feat-icon-3">
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="#4ade80" strokeWidth="1.8">
                    <path d="M17 20H3a2 2 0 01-2-2V6l5-4h11a2 2 0 012 2v14a2 2 0 01-2 2z"/><path d="M3 6h5V2"/>
                  </svg>
                </div>
                <div className="reg-feat-text">
                  <div className="reg-feat-title">Free forever</div>
                  <div className="reg-feat-desc">No plans, no limits, no credit card — ever.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="reg-brand-bottom">
            <div className="reg-stat">
              <div className="reg-stat-num">12+</div>
              <div className="reg-stat-lbl">Posts live</div>
            </div>
            <div className="reg-stat-div" />
            <div className="reg-stat">
              <div className="reg-stat-num">3</div>
              <div className="reg-stat-lbl">Writers</div>
            </div>
            <div className="reg-stat-div" />
            <div className="reg-stat">
              <div className="reg-stat-num">100%</div>
              <div className="reg-stat-lbl">Free</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
