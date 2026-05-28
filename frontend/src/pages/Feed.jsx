import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/posts')
      .then((res) => setPosts(res.data))
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      <style>{`
        .hero {
          min-height: 100vh;
          background: #080808;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 80px 24px 60px;
        }
        .hero-glow-1 {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%);
          top: -100px; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .hero-glow-2 {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
          bottom: 60px; right: 10%; pointer-events: none;
        }
        .hero-glow-3 {
          position: absolute; width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%);
          bottom: 100px; left: 5%; pointer-events: none;
        }
        .hero-node {
          position: absolute; display: flex; flex-direction: column;
          align-items: center; gap: 4px; pointer-events: none;
        }
        .hero-node-dot {
          width: 8px; height: 8px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.07);
        }
        .hero-node-label { font-size: 10px; color: rgba(255,255,255,0.3); font-weight: 500; white-space: nowrap; }
        .hero-node-sub   { font-size: 9px; color: rgba(255,255,255,0.18); }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; padding: 6px 14px;
          margin-bottom: 32px; font-size: 12.5px;
          color: rgba(255,255,255,0.6); letter-spacing: 0.2px;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80; box-shadow: 0 0 8px rgba(74,222,128,0.6);
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .hero-headline {
          font-size: clamp(44px, 7vw, 80px); font-weight: 800;
          color: #fff; text-align: center; line-height: 1.05;
          letter-spacing: -2px; margin: 0 0 20px; max-width: 820px;
          position: relative;
        }
        .hero-headline-accent {
          background: linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #67e8f9 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 17px; color: rgba(255,255,255,0.45);
          text-align: center; max-width: 480px; line-height: 1.6;
          margin: 0 0 44px; position: relative;
        }
        .hero-ctas {
          display: flex; gap: 12px; align-items: center;
          position: relative; flex-wrap: wrap; justify-content: center;
        }
        .hero-btn-primary {
          background: #fff; color: #0a0a0a; border: none; cursor: pointer;
          font-size: 14px; font-weight: 600; padding: 13px 28px; border-radius: 12px;
          text-decoration: none; transition: opacity 0.15s, transform 0.1s;
          display: inline-flex; align-items: center; gap: 8px; font-family: inherit;
        }
        .hero-btn-primary:hover  { opacity: 0.88; transform: translateY(-1px); }
        .hero-btn-primary:active { transform: scale(0.97); }
        .hero-btn-secondary {
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.75);
          border: 1px solid rgba(255,255,255,0.12); cursor: pointer;
          font-size: 14px; font-weight: 500; padding: 13px 28px; border-radius: 12px;
          text-decoration: none; transition: background 0.15s, color 0.15s;
          display: inline-flex; align-items: center; gap: 8px; font-family: inherit;
        }
        .hero-btn-secondary:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .hero-stats {
          display: flex; gap: 40px; align-items: center;
          margin-top: 64px; position: relative;
          flex-wrap: wrap; justify-content: center;
        }
        .hero-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .hero-stat-num   { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
        .hero-stat-label { font-size: 12px; color: rgba(255,255,255,0.35); }
        .hero-stat-div   { width: 1px; height: 32px; background: rgba(255,255,255,0.1); }

        .hero-scroll {
          position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.25); font-size: 11px;
          letter-spacing: 1px; text-transform: uppercase;
          animation: bounce-scroll 2.5s infinite;
        }
        @keyframes bounce-scroll {
          0%,100%{transform:translateX(-50%) translateY(0)}
          50%{transform:translateX(-50%) translateY(6px)}
        }

        .feed-section { background: #080808; min-height: 60vh; padding: 64px 24px 96px; border-top: 1px solid rgba(255,255,255,0.06); }
        .feed-header {
          max-width: 1200px; margin: 0 auto 32px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .feed-title { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.4px; }
        .feed-count {
          font-size: 12px; color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.08);
          padding: 3px 10px; border-radius: 100px;
        }
        .feed-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 900px) {
          .feed-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .feed-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="hero-glow-3" />

        <div className="hero-node" style={{ top: '22%', left: '8%' }}>
          <div className="hero-node-dot" />
          <span className="hero-node-label">React</span>
          <span className="hero-node-sub">12 posts</span>
        </div>
        <div className="hero-node" style={{ top: '30%', right: '10%' }}>
          <div className="hero-node-dot" />
          <span className="hero-node-label">TypeScript</span>
          <span className="hero-node-sub">8 posts</span>
        </div>
        <div className="hero-node" style={{ bottom: '28%', left: '12%' }}>
          <div className="hero-node-dot" />
          <span className="hero-node-label">Design</span>
          <span className="hero-node-sub">5 posts</span>
        </div>
        <div className="hero-node" style={{ bottom: '32%', right: '8%' }}>
          <div className="hero-node-dot" />
          <span className="hero-node-label">PostgreSQL</span>
          <span className="hero-node-sub">6 posts</span>
        </div>

        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Now live — write and share your ideas
        </div>

        <h1 className="hero-headline">
          Your thoughts,<br />
          <span className="hero-headline-accent">beautifully shared.</span>
        </h1>

        <p className="hero-sub">
          Pilcrow is a minimal blogging platform for writers who care about clarity.
          Write threads, share ideas, and connect with curious readers.
        </p>

        <div className="hero-ctas">
          {user ? (
            <>
              <Link to="/posts/new" className="hero-btn-primary">
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
                Start Writing
              </Link>
              <a href="#feed" className="hero-btn-secondary">
                Browse Posts
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 10h10M10 5l5 5-5 5"/>
                </svg>
              </a>
            </>
          ) : (
            <>
              <Link to="/register" className="hero-btn-primary">
                Get started — it's free
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 10h10M10 5l5 5-5 5"/>
                </svg>
              </Link>
              <a href="#feed" className="hero-btn-secondary">Explore posts</a>
            </>
          )}
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">{posts.length || '12'}+</span>
            <span className="hero-stat-label">Posts published</span>
          </div>
          <div className="hero-stat-div" />
          <div className="hero-stat">
            <span className="hero-stat-num">3</span>
            <span className="hero-stat-label">Active writers</span>
          </div>
          <div className="hero-stat-div" />
          <div className="hero-stat">
            <span className="hero-stat-num">Free</span>
            <span className="hero-stat-label">Always</span>
          </div>
        </div>

        <div className="hero-scroll">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
          Scroll
        </div>
      </section>

      {/* FEED */}
      <section className="feed-section" id="feed">
        <div className="feed-header">
          <h2 className="feed-title">Latest Posts</h2>
          {!loading && <span className="feed-count">{posts.length} posts</span>}
        </div>

        {loading && <div style={{ maxWidth: '1200px', margin: '0 auto' }}><LoadingSpinner /></div>}
        {error && <div style={{ maxWidth: '1200px', margin: '0 auto' }}><div className="alert alert-error">{error}</div></div>}

        {!loading && !error && posts.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '60px 0' }}>
            No posts yet. Be the first!
          </p>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="feed-grid">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} onDelete={handleDelete} featured={i === 0} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
