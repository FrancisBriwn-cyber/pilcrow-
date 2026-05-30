import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setSearchOpen(false);
    }
  }

  return (
    <>
      <style>{`
        .nav {
          position: fixed;
          top: 16px;
          left: 50%; transform: translateX(-50%);
          width: calc(100% - 48px);
          max-width: 1100px;
          z-index: 200;
          height: 58px;
          display: flex; align-items: center;
          padding: 0 20px;
          background: #0d9488;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 12px rgba(13,148,136,0.45);
        }
        .nav-inner {
          display: flex; align-items: center;
          width: 100%;
        }

        /* Logo — left third */
        .nav-logo {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; flex-shrink: 0;
          flex: 1;
        }
        .nav-logo-mark {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.15s;
        }
        .nav-logo:hover .nav-logo-mark { background: rgba(0,0,0,0.3); }
        .nav-logo-word {
          font-size: 15px; font-weight: 700; color: #fff;
          letter-spacing: -0.2px; transition: opacity 0.15s;
        }
        .nav-logo:hover .nav-logo-word { opacity: 0.8; }

        /* Nav links — center */
        .nav-links {
          display: flex; align-items: center; gap: 2px;
          position: absolute; left: 50%; transform: translateX(-50%);
        }
        .nav-link {
          text-decoration: none;
          font-size: 14px; font-weight: 400;
          padding: 6px 14px; border-radius: 8px;
          color: rgba(255,255,255,0.7);
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.1); }
        .nav-link.active {
          color: #fff; font-weight: 600;
          background: rgba(0,0,0,0.18);
        }

        /* Right actions */
        .nav-actions {
          display: flex; align-items: center; gap: 6px;
          flex: 1; justify-content: flex-end;
        }

        /* Circle icon button */
        .nav-icon-btn {
          width: 34px; height: 34px; border-radius: 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.75);
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          text-decoration: none; flex-shrink: 0;
        }
        .nav-icon-btn:hover {
          border-color: rgba(255,255,255,0.5);
          color: #fff;
          background: rgba(255,255,255,0.12);
        }

        /* Avatar circle */
        .nav-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(0,0,0,0.25);
          border: 2px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; overflow: hidden; flex-shrink: 0;
          color: #fff; font-size: 12px; font-weight: 700;
          transition: border-color 0.15s;
        }
        .nav-avatar:hover { border-color: #fff; }

        .nav-sep { width: 1px; height: 18px; background: rgba(255,255,255,0.2); margin: 0 2px; }

        /* Text actions */
        .nav-text-btn {
          background: none; border: none; cursor: pointer;
          font-size: 13.5px; font-weight: 400; font-family: inherit;
          padding: 6px 10px; border-radius: 6px;
          text-decoration: none; color: rgba(255,255,255,0.7);
          transition: color 0.15s; white-space: nowrap;
        }
        .nav-text-btn:hover { color: #fff; }

        .nav-signup {
          background: #fff; color: #0d9488;
          border: none; cursor: pointer;
          font-size: 13px; font-weight: 700; font-family: inherit;
          padding: 7px 16px; border-radius: 9px;
          text-decoration: none; white-space: nowrap;
          transition: opacity 0.15s, transform 0.1s;
        }
        .nav-signup:hover { opacity: 0.9; transform: translateY(-1px); }

        /* Compact inline search — expands from the right */
        .nav-search-wrap {
          display: flex; align-items: center; gap: 6px;
          overflow: hidden;
        }
        .nav-search-form {
          display: flex; align-items: center;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 10px;
          overflow: hidden;
          width: 0; opacity: 0;
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s;
        }
        .nav-search-form.open {
          width: 260px; opacity: 1;
        }
        .nav-search-input {
          flex: 1; min-width: 0;
          background: transparent; border: none; outline: none;
          font-size: 13.5px; font-family: inherit;
          color: #fff; padding: 7px 12px;
        }
        .nav-search-input::placeholder { color: rgba(255,255,255,0.45); }
        .nav-search-submit {
          background: rgba(255,255,255,0.15);
          border: none; border-left: 1px solid rgba(255,255,255,0.15);
          cursor: pointer; color: #fff;
          padding: 7px 11px; flex-shrink: 0;
          display: flex; align-items: center;
          transition: background 0.15s;
        }
        .nav-search-submit:hover { background: rgba(255,255,255,0.25); }
        .nav-search-close {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.6); padding: 0;
          display: flex; align-items: center;
          transition: color 0.15s; flex-shrink: 0;
        }
        .nav-search-close:hover { color: #fff; }

        /* Hamburger — mobile only */
        .nav-hamburger {
          display: none;
          background: none; border: none; cursor: pointer;
          color: #fff; padding: 4px; flex-shrink: 0;
          align-items: center; justify-content: center;
        }

        /* Mobile dropdown menu */
        .nav-mobile-menu {
          position: fixed;
          top: 82px; left: 12px; right: 12px;
          background: #0d9488;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 16px;
          padding: 12px;
          display: flex; flex-direction: column; gap: 4px;
          z-index: 199;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .nav-mobile-link {
          text-decoration: none;
          font-size: 15px; font-weight: 500;
          color: rgba(255,255,255,0.85);
          padding: 12px 16px; border-radius: 10px;
          transition: background 0.15s, color 0.15s;
          display: block;
        }
        .nav-mobile-link:hover, .nav-mobile-link.active {
          background: rgba(0,0,0,0.15); color: #fff;
        }
        .nav-mobile-sep {
          height: 1px; background: rgba(255,255,255,0.12);
          margin: 4px 0;
        }
        .nav-mobile-btn {
          background: none; border: none; cursor: pointer;
          font-family: inherit; font-size: 15px; font-weight: 500;
          color: rgba(255,255,255,0.85); padding: 12px 16px;
          border-radius: 10px; text-align: left; width: 100%;
          transition: background 0.15s, color 0.15s;
        }
        .nav-mobile-btn:hover { background: rgba(0,0,0,0.15); color: #fff; }

        @media (max-width: 640px) {
          .nav { width: calc(100% - 24px); padding: 0 14px; }
          .nav-links { display: none; }
          .nav-hamburger { display: flex; }
          .nav-text-btn { display: none; }
          .nav-sep { display: none; }
          .nav-search-form.open { width: 150px; }
        }
      `}</style>

      <nav className="nav">
        <div className="nav-inner">

          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-mark">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <path d="M15 3H9a5 5 0 000 10h3v8"/>
                <path d="M15 3a5 5 0 010 10"/>
                <line x1="18" y1="3" x2="18" y2="21"/>
              </svg>
            </div>
            <span className="nav-logo-word">Pilcrow</span>
          </Link>

          {/* Centered links */}
          <div className="nav-links">
            <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>
            <Link to="/#feed" className="nav-link">Posts</Link>
            {user && (
              <Link to="/posts/new" className={`nav-link${location.pathname === '/posts/new' ? ' active' : ''}`}>Write</Link>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button className="nav-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            )}
          </button>

          {/* Right actions */}
          <div className="nav-actions">
            {/* Compact expanding search */}
            <div className="nav-search-wrap">
              <form className={`nav-search-form${searchOpen ? ' open' : ''}`} onSubmit={handleSearch}>
                <input
                  autoFocus={searchOpen}
                  className="nav-search-input"
                  placeholder="Search posts…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="nav-search-submit">
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/>
                  </svg>
                </button>
              </form>
              {searchOpen ? (
                <button className="nav-search-close" onClick={() => { setSearchOpen(false); setQuery(''); }}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 5L5 15M5 5l10 10"/>
                  </svg>
                </button>
              ) : (
                <button className="nav-icon-btn" onClick={() => setSearchOpen(true)} title="Search">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/>
                  </svg>
                </button>
              )}
            </div>

            <button className="nav-icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              )}
            </button>

            <div className="nav-sep" />

            {user ? (
              <>
                <Link to={`/users/${user.id}`} className="nav-avatar" title={user.name}>
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : user.name.charAt(0).toUpperCase()
                  }
                </Link>
                <button onClick={logout} className="nav-text-btn">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-icon-btn" title="Log in">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                  </svg>
                </Link>
                <Link to="/register" className="nav-icon-btn" title="Create account">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z"/>
                  </svg>
                </Link>
              </>
            )}
          </div>


        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="nav-mobile-menu" onClick={() => setMobileOpen(false)}>
          <Link to="/" className={`nav-mobile-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>
          <Link to="/#feed" className="nav-mobile-link">Posts</Link>
          {user && <Link to="/posts/new" className={`nav-mobile-link${location.pathname === '/posts/new' ? ' active' : ''}`}>Write</Link>}
          <div className="nav-mobile-sep" />
          {user ? (
            <>
              <Link to={`/users/${user.id}`} className="nav-mobile-link">Profile</Link>
              <button className="nav-mobile-btn" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-mobile-link">Log in</Link>
              <Link to="/register" className="nav-mobile-link">Create account</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
