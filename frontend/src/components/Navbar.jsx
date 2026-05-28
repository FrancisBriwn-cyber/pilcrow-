import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const onHome = location.pathname === '/';

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  }

  return (
    <>
      <style>{`
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 60px;
          display: flex; align-items: center;
          padding: 0 40px;
          transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
          background: ${onHome ? 'rgba(8,8,8,0.6)' : 'rgba(255,255,255,0.92)'};
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid ${onHome ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'};
        }
        .nav-inner {
          display: flex; align-items: center;
          justify-content: space-between;
          width: 100%; max-width: 1100px;
          margin: 0 auto; gap: 20px;
        }

        /* Logo */
        .nav-logo {
          display: flex; align-items: center; gap: 7px;
          text-decoration: none; flex-shrink: 0;
          font-size: 16px; font-weight: 700;
          letter-spacing: -0.4px;
          color: ${onHome ? '#fff' : '#0f0f0f'};
          transition: opacity 0.15s;
        }
        .nav-logo:hover { opacity: 0.75; }
        .nav-logo-icon {
          width: 26px; height: 26px; border-radius: 7px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: #fff;
          flex-shrink: 0;
        }

        /* Center links */
        .nav-links {
          display: flex; align-items: center; gap: 2px;
          flex: 1; justify-content: center;
        }
        .nav-link {
          text-decoration: none;
          font-size: 13.5px; font-weight: 500;
          padding: 7px 14px; border-radius: 10px;
          transition: background 0.15s, color 0.15s;
          color: ${onHome ? 'rgba(255,255,255,0.55)' : '#6b7280'};
          white-space: nowrap;
        }
        .nav-link:hover {
          background: ${onHome ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
          color: ${onHome ? '#fff' : '#111'};
        }
        .nav-link.active {
          color: ${onHome ? '#fff' : '#111'};
          background: ${onHome ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'};
        }

        /* Search */
        .nav-search-form {
          display: flex; align-items: center; gap: 0;
          background: ${onHome ? 'rgba(255,255,255,0.08)' : '#f3f4f6'};
          border: 1px solid ${onHome ? 'rgba(255,255,255,0.1)' : 'transparent'};
          border-radius: 10px; overflow: hidden;
          transition: border-color 0.2s, background 0.2s;
          max-width: 220px;
        }
        .nav-search-form:focus-within {
          border-color: ${onHome ? 'rgba(255,255,255,0.25)' : '#6366f1'};
          background: ${onHome ? 'rgba(255,255,255,0.12)' : '#fff'};
        }
        .nav-search-input {
          background: transparent; border: none; outline: none;
          font-size: 13px; font-family: inherit;
          padding: 8px 12px; width: 150px;
          color: ${onHome ? '#fff' : '#111'};
        }
        .nav-search-input::placeholder {
          color: ${onHome ? 'rgba(255,255,255,0.3)' : '#9ca3af'};
        }
        .nav-search-btn {
          background: none; border: none; cursor: pointer;
          padding: 8px 10px; display: flex; align-items: center;
          color: ${onHome ? 'rgba(255,255,255,0.4)' : '#9ca3af'};
          transition: color 0.15s;
        }
        .nav-search-btn:hover { color: ${onHome ? '#fff' : '#6366f1'}; }

        /* Right actions */
        .nav-actions {
          display: flex; align-items: center; gap: 8px; flex-shrink: 0;
        }
        .nav-ghost {
          background: none; border: none; cursor: pointer;
          font-size: 13.5px; font-weight: 500; font-family: inherit;
          padding: 7px 14px; border-radius: 10px;
          text-decoration: none;
          color: ${onHome ? 'rgba(255,255,255,0.6)' : '#6b7280'};
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .nav-ghost:hover {
          background: ${onHome ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
          color: ${onHome ? '#fff' : '#111'};
        }
        .nav-solid {
          background: ${onHome ? '#fff' : '#0f0f0f'};
          color: ${onHome ? '#0f0f0f' : '#fff'};
          border: none; cursor: pointer;
          font-size: 13.5px; font-weight: 600; font-family: inherit;
          padding: 7px 18px; border-radius: 10px;
          text-decoration: none; white-space: nowrap;
          display: inline-flex; align-items: center; gap: 7px;
          transition: opacity 0.15s, transform 0.1s;
        }
        .nav-solid:hover  { opacity: 0.85; }
        .nav-solid:active { transform: scale(0.97); }

        /* Avatar */
        .nav-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; overflow: hidden; flex-shrink: 0;
          border: 2px solid ${onHome ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
          transition: border-color 0.15s, transform 0.15s;
        }
        .nav-avatar:hover { border-color: #6366f1; transform: scale(1.05); }

        .nav-sep {
          width: 1px; height: 20px;
          background: ${onHome ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          margin: 0 2px;
        }
      `}</style>

      <nav className="nav">
        <div className="nav-inner">

          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">¶</div>
            Pilcrow
          </Link>

          {/* Center nav links */}
          <div className="nav-links">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/#feed" className="nav-link">Posts</Link>
            {user && (
              <Link to="/posts/new" className={`nav-link ${location.pathname === '/posts/new' ? 'active' : ''}`}>Write</Link>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="nav-search-form">
            <input
              className="nav-search-input"
              placeholder="Search posts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="nav-search-btn">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/>
              </svg>
            </button>
          </form>

          {/* Right actions */}
          <div className="nav-actions">
            {user ? (
              <>
                <Link to={`/users/${user.id}`} className="nav-avatar" title={user.name}>
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : user.name.charAt(0).toUpperCase()
                  }
                </Link>
                <div className="nav-sep" />
                <button onClick={logout} className="nav-ghost">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-ghost">Log in</Link>
                <Link to="/register" className="nav-solid">
                  Create Account
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 10h10M10 5l5 5-5 5"/>
                  </svg>
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>
    </>
  );
}
