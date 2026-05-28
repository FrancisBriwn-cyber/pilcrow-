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
        .split-page {
          min-height: 100vh;
          display: flex;
        }

        /* ── Left: form panel ── */
        .split-form-side {
          flex: 1;
          min-width: 0;
          background: #080808;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 40px 48px;
          position: relative;
          overflow: hidden;
        }
        .split-form-glow {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%);
          top: -120px; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .split-form-inner {
          position: relative; z-index: 1;
          width: 100%; max-width: 400px;
        }
        .split-logo {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; margin-bottom: 36px;
        }
        .split-logo-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 800; color: #fff;
        }
        .split-logo-text { font-size: 17px; font-weight: 700; color: #fff; }
        .split-title {
          font-size: 26px; font-weight: 800; color: #fff;
          letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .split-sub {
          font-size: 14px; color: rgba(255,255,255,0.38); margin-bottom: 32px;
        }
        .split-footer {
          text-align: center; font-size: 13.5px;
          color: rgba(255,255,255,0.3); margin-top: 22px;
        }
        .split-footer a { color: #818cf8; }
        .split-footer a:hover { color: #a5b4fc; }

        /* ── Right: image panel ── */
        .split-image-side {
          width: 48%;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .split-image-side img {
          width: 100%; height: 100%; object-fit: cover;
          display: block;
        }
        .split-image-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            160deg,
            rgba(8,8,8,0.25) 0%,
            rgba(8,8,8,0.1) 40%,
            rgba(8,8,8,0.55) 100%
          );
        }
        .split-image-brand {
          position: absolute; bottom: 48px; left: 44px; right: 44px;
        }
        .split-quote {
          font-size: 22px; font-weight: 700; color: #fff;
          letter-spacing: -0.4px; line-height: 1.35; margin-bottom: 12px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }
        .split-quote-sub {
          font-size: 13px; color: rgba(255,255,255,0.55);
          display: flex; align-items: center; gap: 8px;
        }
        .split-quote-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #818cf8;
        }

        @media (max-width: 760px) {
          .split-image-side { display: none; }
        }
      `}</style>

      <div className="split-page">

        {/* Form side */}
        <div className="split-form-side">
          <div className="split-form-glow" />
          <div className="split-form-inner">

            <Link to="/" className="split-logo">
              <div className="split-logo-icon">¶</div>
              <span className="split-logo-text">Pilcrow</span>
            </Link>

            <h1 className="split-title">Create account</h1>
            <p className="split-sub">Join Pilcrow and start sharing your ideas</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required minLength={6} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }} disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <div className="divider">or</div>

            <button className="btn btn-google" onClick={handleGoogle}>
              <svg width="17" height="17" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            <p className="split-footer">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>

        {/* Image side */}
        <div className="split-image-side">
          <img
            src="https://picsum.photos/seed/pilcrow-register/960/1200"
            alt="Pilcrow — write beautifully"
          />
          <div className="split-image-overlay" />
          <div className="split-image-brand">
            <p className="split-quote">
              "Write once,<br />share with the world."
            </p>
            <div className="split-quote-sub">
              <span className="split-quote-dot" />
              Pilcrow — a space for ideas that matter
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
