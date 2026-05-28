import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    api.get(`/api/posts/search?q=${encodeURIComponent(query)}`)
      .then((res) => setPosts(res.data))
      .catch(() => setError('Search failed. Please try again.'))
      .finally(() => setLoading(false));
  }, [query]);

  function handleDelete(deletedId) {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  }

  return (
    <>
      <style>{`
        .sr-page {
          min-height: 100vh;
          background: #080808;
          padding: 100px 16px 60px;
          position: relative;
        }
        .sr-glow {
          position: absolute; width: 600px; height: 250px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%);
          top: 0; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .sr-inner { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; }
        .sr-eyebrow {
          font-size: 12px; font-weight: 500; letter-spacing: 1px;
          text-transform: uppercase; color: rgba(255,255,255,0.3);
          margin-bottom: 10px;
        }
        .sr-title {
          font-size: 26px; font-weight: 700; color: #fff;
          letter-spacing: -0.4px; margin-bottom: 6px;
        }
        .sr-query-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25);
          border-radius: 100px; padding: 4px 12px;
          font-size: 13px; color: #a5b4fc; margin-bottom: 28px;
        }
        .sr-empty {
          text-align: center; padding: 80px 0;
          color: rgba(255,255,255,0.25); font-size: 15px;
        }
        .sr-empty-icon {
          font-size: 40px; margin-bottom: 14px; opacity: 0.3;
        }
      `}</style>

      <div className="sr-page">
        <div className="sr-glow" />
        <div className="sr-inner">
          <p className="sr-eyebrow">Search</p>
          <h1 className="sr-title">Results</h1>

          {query && (
            <div className="sr-query-badge">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/>
              </svg>
              {query}
            </div>
          )}

          {loading && <LoadingSpinner message="Searching…" />}
          {error && <div className="alert alert-error">{error}</div>}

          {!loading && !error && posts.length === 0 && query && (
            <div className="sr-empty">
              <div className="sr-empty-icon">¶</div>
              <p>No posts found for "{query}"</p>
              <p style={{ fontSize: '13px', marginTop: '6px', color: 'rgba(255,255,255,0.18)' }}>Try a different keyword</p>
            </div>
          )}

          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </>
  );
}
