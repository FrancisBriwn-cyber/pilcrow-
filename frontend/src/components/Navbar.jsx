import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: '#fff', borderBottom: '1px solid var(--border)',
    height: '64px', display: 'flex', alignItems: 'center'
  },
  inner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', maxWidth: '960px', margin: '0 auto', padding: '0 16px'
  },
  logo: { fontWeight: 700, fontSize: '20px', color: 'var(--primary)' },
  searchForm: { display: 'flex', gap: '8px', flex: 1, maxWidth: '360px', margin: '0 24px' },
  searchInput: {
    flex: 1, padding: '8px 12px', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none'
  },
  actions: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'var(--primary)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, fontSize: '14px', cursor: 'pointer', overflow: 'hidden'
  }
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>Pilcrow</Link>

        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            style={styles.searchInput}
            placeholder="Search posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>
            Search
          </button>
        </form>

        <div style={styles.actions}>
          {user ? (
            <>
              <Link to="/posts/new" className="btn btn-primary">New Post</Link>
              <Link to={`/users/${user.id}`} style={styles.avatar}>
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : user.name.charAt(0).toUpperCase()
                }
              </Link>
              <button onClick={logout} className="btn btn-outline" style={{ fontSize: '13px', padding: '6px 12px' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Log In</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
