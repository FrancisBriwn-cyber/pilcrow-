import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function SinglePost() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/posts/${id}`)
      .then((res) => setPost(res.data))
      .catch((err) => {
        if (err.response?.status === 404) setError('Post not found.');
        else setError('Failed to load post.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/api/posts/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post.');
    }
  }

  if (loading) return <LoadingSpinner />;

  if (error) return (
    <>
      <style>{`.sp-page{min-height:100vh;background:#080808;padding:100px 16px 60px;}`}</style>
      <div className="sp-page">
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="alert alert-error">{error}</div>
          <Link to="/" className="btn btn-outline">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 10H5M10 5l-5 5 5 5"/>
            </svg>
            Back to feed
          </Link>
        </div>
      </div>
    </>
  );

  const isOwner = user && user.id === post.user_id;

  return (
    <>
      <style>{`
        .sp-page {
          min-height: 100vh;
          background: #080808;
          padding: 100px 16px 60px;
          position: relative;
        }
        .sp-glow {
          position: absolute; width: 700px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
          top: 0; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .sp-inner { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; }
        .sp-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; color: rgba(255,255,255,0.35);
          margin-bottom: 28px; transition: color 0.15s;
        }
        .sp-back:hover { color: rgba(255,255,255,0.7); }
        .sp-article {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 40px;
        }
        .sp-author-row {
          display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
        }
        .sp-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 16px; overflow: hidden; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.1);
        }
        .sp-author-name {
          font-weight: 600; font-size: 14px; color: #fff;
        }
        .sp-author-name:hover { color: #818cf8; }
        .sp-date { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .sp-title {
          font-size: clamp(22px, 4vw, 32px); font-weight: 700; color: #fff;
          letter-spacing: -0.5px; line-height: 1.25; margin-bottom: 20px;
        }
        .sp-content {
          font-size: 16px; line-height: 1.75; color: rgba(255,255,255,0.72);
          white-space: pre-wrap; margin-bottom: 28px;
        }
        .sp-media {
          width: 100%; max-height: 500px; object-fit: cover;
          border-radius: 10px; margin-bottom: 28px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .sp-owner-actions {
          display: flex; gap: 10px;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 20px; margin-top: 4px;
        }
      `}</style>

      <div className="sp-page">
        <div className="sp-glow" />
        <div className="sp-inner">
          <Link to="/" className="sp-back">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 10H5M10 5l-5 5 5 5"/>
            </svg>
            Back to feed
          </Link>

          <article className="sp-article">
            <div className="sp-author-row">
              <Link to={`/users/${post.user_id}`} style={{ textDecoration: 'none' }}>
                <div className="sp-avatar">
                  {post.author_avatar
                    ? <img src={post.author_avatar} alt={post.author_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : post.author_name?.charAt(0).toUpperCase()
                  }
                </div>
              </Link>
              <div>
                <Link to={`/users/${post.user_id}`} className="sp-author-name">{post.author_name}</Link>
                <div className="sp-date">{formatDate(post.created_at)}</div>
              </div>
            </div>

            <h1 className="sp-title">{post.title}</h1>

            <p className="sp-content">{post.content}</p>

            {post.media_url && (
              <img src={post.media_url} alt="Post media" className="sp-media" />
            )}

            {isOwner && (
              <div className="sp-owner-actions">
                <button className="btn btn-outline" onClick={() => navigate(`/posts/${id}/edit`)}>Edit Post</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete Post</button>
              </div>
            )}
          </article>
        </div>
      </div>
    </>
  );
}
