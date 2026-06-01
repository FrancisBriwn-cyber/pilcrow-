import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

function readTime(text = '') {
  const plain = text.replace(/<[^>]+>/g, '');
  return Math.max(1, Math.ceil(plain.split(/\s+/).length / 200));
}

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
          background: radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%);
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
          background: linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%);
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
        .feed-title {
          font-size: 20px; font-weight: 700; letter-spacing: -0.4px;
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .feed-count {
          font-size: 12px; color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.08);
          padding: 3px 10px; border-radius: 100px;
        }
        /* Logged-in magazine mosaic */
        .mag-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 160px;
          gap: 18px;
        }
        @media (max-width: 900px) { .mag-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 140px; } }
        @media (max-width: 640px) { .mag-grid { grid-template-columns: 1fr; grid-auto-rows: auto; } }

        .mag-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 20px;
          display: flex; flex-direction: column; justify-content: space-between;
          overflow: hidden; position: relative;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .mag-card:hover { border-color: rgba(13,148,136,0.35); background: rgba(13,148,136,0.04); transform: translateY(-2px); }
        .mag-card-featured { grid-column: 1 / 3; }
        @media (max-width: 900px) { .mag-card-featured { grid-column: 1 / 3; } }
        @media (max-width: 640px) { .mag-card-featured { grid-column: 1; min-height: 140px; } .mag-card { min-height: 110px; } }

        .mag-tag {
          font-size: 10px; font-weight: 600; letter-spacing: 1px;
          text-transform: uppercase; color: #5eead4; margin-bottom: 8px;
        }
        .mag-title {
          font-size: 15px; font-weight: 700; color: #fff;
          line-height: 1.35; letter-spacing: -0.2px;
          display: -webkit-box; -webkit-line-clamp: 3;
          -webkit-box-orient: vertical; overflow: hidden; flex: 1;
        }
        .mag-title-lg {
          font-size: 20px; font-weight: 800; color: #fff;
          line-height: 1.25; letter-spacing: -0.4px;
          display: -webkit-box; -webkit-line-clamp: 3;
          -webkit-box-orient: vertical; overflow: hidden; flex: 1;
        }
        .mag-author {
          font-size: 11px; color: rgba(255,255,255,0.3);
          margin-top: 12px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .mag-deco {
          position: absolute; bottom: -20px; right: -20px;
          width: 80px; height: 80px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        [data-theme="light"] .mag-card { background: #fdf8f2; border-color: rgba(0,0,0,0.08); }
        [data-theme="light"] .mag-title, [data-theme="light"] .mag-title-lg { color: #0a0a0a; }
        [data-theme="light"] .mag-author { color: rgba(0,0,0,0.35); }

        /* Guest gate — title mosaic */
        .gate-wrap {
          max-width: 1200px; margin: 0 auto;
          position: relative;
        }
        .mosaic-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 140px;
          gap: 18px;
        }
        @media (max-width: 900px) { .mosaic-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .mosaic-grid { grid-template-columns: 1fr; } }

        .mosaic-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 20px;
          display: flex; flex-direction: column; justify-content: space-between;
          overflow: hidden; position: relative;
          transition: border-color 0.2s;
        }
        .mosaic-card:hover { border-color: rgba(13,148,136,0.3); }

        .mosaic-tag {
          font-size: 10px; font-weight: 600; letter-spacing: 1px;
          text-transform: uppercase; color: #5eead4;
          margin-bottom: 8px;
        }
        .mosaic-title {
          font-size: 15px; font-weight: 700; color: #fff;
          line-height: 1.35; letter-spacing: -0.2px;
          display: -webkit-box; -webkit-line-clamp: 3;
          -webkit-box-orient: vertical; overflow: hidden;
          flex: 1;
        }
        .mosaic-author {
          font-size: 11px; color: rgba(255,255,255,0.3);
          margin-top: 12px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .mosaic-deco {
          position: absolute; bottom: -20px; right: -20px;
          width: 80px; height: 80px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Center gate card */
        .gate-card {
          background: rgba(8,8,8,0.85);
          border: 1px solid rgba(13,148,136,0.4);
          border-radius: 20px; padding: 40px 44px;
          text-align: center; width: 100%;
          backdrop-filter: blur(24px);
          box-shadow: 0 0 60px rgba(13,148,136,0.12);
        }
        .gate-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
          box-shadow: 0 4px 20px rgba(13,148,136,0.45);
        }
        .gate-title {
          font-size: 20px; font-weight: 800; color: #fff;
          letter-spacing: -0.4px; margin-bottom: 8px;
        }
        .gate-sub {
          font-size: 13px; color: rgba(255,255,255,0.45);
          line-height: 1.6; margin-bottom: 24px;
        }
        .gate-btns { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
        .gate-btn-primary {
          background: #0d9488; color: #fff; border: none;
          cursor: pointer; font-family: inherit;
          font-size: 13.5px; font-weight: 700;
          padding: 11px 24px; border-radius: 10px;
          text-decoration: none;
          transition: opacity 0.15s, transform 0.1s;
          box-shadow: 0 4px 14px rgba(13,148,136,0.4);
        }
        .gate-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        /* Dark mode — ghost glow button */
        .gate-btn-secondary {
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.35);
          color: #fff; cursor: pointer; font-family: inherit;
          font-size: 13.5px; font-weight: 600;
          padding: 11px 24px; border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 0 12px rgba(255,255,255,0.06), inset 0 0 12px rgba(255,255,255,0.04);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .gate-btn-secondary:hover {
          border-color: rgba(255,255,255,0.7);
          box-shadow: 0 0 18px rgba(255,255,255,0.12), inset 0 0 18px rgba(255,255,255,0.06);
        }

        /* Mobile */
        @media (max-width: 640px) {
          .hero { padding: 100px 20px 60px; }
          .hero-node { display: none; }
          .hero-headline { font-size: clamp(36px, 10vw, 60px); letter-spacing: -1px; }
          .hero-sub { font-size: 15px; }
          .hero-ctas { gap: 10px; }
          .hero-btn-primary, .hero-btn-secondary { padding: 12px 22px; font-size: 13.5px; }
          .hero-stats { gap: 24px; margin-top: 48px; }

          .feed-section { padding: 48px 16px 72px; }
          .feed-header { margin-bottom: 20px; }

          /* Mosaic: hide decorative cards, show only gate */
          .mosaic-grid { display: flex !important; flex-direction: column; }
          .mosaic-card { display: none; }
          .gate-cell { padding: 0 !important; }
          .gate-card { padding: 32px 24px; }
          .gate-title { font-size: 18px; }
        }

        /* Light mode overrides */
        [data-theme="light"] .mosaic-card {
          background: #fdf8f2; border-color: rgba(0,0,0,0.08);
        }
        [data-theme="light"] .mosaic-title { color: #0a0a0a; }
        [data-theme="light"] .mosaic-author { color: rgba(0,0,0,0.35); }
        [data-theme="light"] .gate-card {
          background: rgba(245,237,224,0.95);
          border-color: rgba(13,148,136,0.35);
        }
        [data-theme="light"] .gate-title { color: #0a0a0a; }
        [data-theme="light"] .gate-sub { color: rgba(0,0,0,0.5); }
        /* Light mode — solid black button */
        [data-theme="light"] .gate-btn-secondary {
          background: #0a0a0a; border-color: #0a0a0a;
          color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }
        [data-theme="light"] .gate-btn-secondary:hover {
          background: #222; border-color: #222;
          box-shadow: 0 6px 20px rgba(0,0,0,0.28);
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
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Start Writing
              </Link>
              <a href="#feed" className="hero-btn-secondary">
                Browse Posts
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 10h10M10 5l5 5-5 5" />
                </svg>
              </a>
            </>
          ) : (
            <>
              <Link to="/register" className="hero-btn-primary">
                Get started — it's free
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 10h10M10 5l5 5-5 5" />
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

      </section>

      {/* FEED — visible to everyone */}
      <section className="feed-section" id="feed">
        <div className="feed-header">
          <h2 className="feed-title">Latest Posts</h2>
          {!loading && posts.length > 0 && <span className="feed-count">{posts.length} posts</span>}
        </div>

        {loading && <div style={{ maxWidth: '1200px', margin: '0 auto' }}><LoadingSpinner /></div>}
        {error && <div style={{ maxWidth: '1200px', margin: '0 auto' }}><div className="alert alert-error">{error}</div></div>}

        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.22)' }}>
            <p style={{ fontSize: '15px' }}>No posts yet. Be the first to write one!</p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          user ? (
            /* Logged-in: magazine mosaic, all posts */
            <div className="mag-grid">
              {posts[0] && (
                <Link to={`/posts/${posts[0].id}`} className="mag-card mag-card-featured">
                  <div>
                    <div className="mag-tag">{posts[0].category || 'Featured'}</div>
                    <div className="mag-title-lg">{posts[0].title}</div>
                  </div>
                  <div className="mag-author">{posts[0].author_name} · {readTime(posts[0].content)} min</div>
                  <div className="mag-deco" />
                </Link>
              )}
              {posts.slice(1).map(post => (
                <Link key={post.id} to={`/posts/${post.id}`} className="mag-card">
                  <div>
                    {post.category && post.category !== 'General' && <div className="mag-tag" style={{ marginBottom: '6px' }}>{post.category}</div>}
                    <div className="mag-title">{post.title}</div>
                  </div>
                  <div className="mag-author">{post.author_name} · {readTime(post.content)} min</div>
                </Link>
              ))}
            </div>
          ) : (
            /* Guest: mosaic with gate card in center */
            <div className="gate-wrap">
              <div className="mosaic-grid">
                {posts[0] && (
                  <Link to={`/posts/${posts[0].id}`} className="mosaic-card" style={{ gridColumn: '1 / 3', gridRow: '1' }}>
                    <div>
                      <div className="mosaic-tag">Featured</div>
                      <div className="mosaic-title" style={{ fontSize: '20px' }}>{posts[0].title}</div>
                    </div>
                    <div className="mosaic-author">{posts[0].author_name}</div>
                    <div className="mosaic-deco" />
                  </Link>
                )}
                {posts[1] && (
                  <Link to={`/posts/${posts[1].id}`} className="mosaic-card" style={{ gridColumn: '3', gridRow: '1' }}>
                    <div><div className="mosaic-title">{posts[1].title}</div></div>
                    <div className="mosaic-author">{posts[1].author_name}</div>
                  </Link>
                )}
                {posts[2] && (
                  <Link to={`/posts/${posts[2].id}`} className="mosaic-card" style={{ gridColumn: '4', gridRow: '1' }}>
                    <div><div className="mosaic-title">{posts[2].title}</div></div>
                    <div className="mosaic-author">{posts[2].author_name}</div>
                  </Link>
                )}
                {posts[3] && (
                  <Link to={`/posts/${posts[3].id}`} className="mosaic-card" style={{ gridColumn: '1', gridRow: '2' }}>
                    <div><div className="mosaic-title">{posts[3].title}</div></div>
                    <div className="mosaic-author">{posts[3].author_name}</div>
                  </Link>
                )}
                {/* Gate card — center */}
                <div className="gate-cell" style={{ gridColumn: '2 / 4', gridRow: '2 / 4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                  <div className="gate-card">
                    <div className="gate-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M15 3H9a5 5 0 000 10h3v8"/>
                        <path d="M15 3a5 5 0 010 10"/>
                        <line x1="18" y1="3" x2="18" y2="21"/>
                      </svg>
                    </div>
                    <h2 className="gate-title">One account.<br/>All the stories.</h2>
                    <p className="gate-sub">Join free to read every post, like, comment, and share your own writing.</p>
                    <div className="gate-btns">
                      <Link to="/register" className="gate-btn-primary">Join for free</Link>
                      <Link to="/login" className="gate-btn-secondary">Log in</Link>
                    </div>
                  </div>
                </div>
                {posts[4] && (
                  <Link to={`/posts/${posts[4].id}`} className="mosaic-card" style={{ gridColumn: '4', gridRow: '2' }}>
                    <div><div className="mosaic-title">{posts[4].title}</div></div>
                    <div className="mosaic-author">{posts[4].author_name}</div>
                  </Link>
                )}
                {posts[5] && (
                  <Link to={`/posts/${posts[5].id}`} className="mosaic-card" style={{ gridColumn: '1', gridRow: '3' }}>
                    <div><div className="mosaic-title">{posts[5].title}</div></div>
                    <div className="mosaic-author">{posts[5].author_name}</div>
                  </Link>
                )}
                {posts[6] && (
                  <Link to={`/posts/${posts[6].id}`} className="mosaic-card" style={{ gridColumn: '4', gridRow: '3' }}>
                    <div><div className="mosaic-title">{posts[6].title}</div></div>
                    <div className="mosaic-author">{posts[6].author_name}</div>
                  </Link>
                )}
              </div>
            </div>
          )
        )}
      </section>
    </>
  );
}
