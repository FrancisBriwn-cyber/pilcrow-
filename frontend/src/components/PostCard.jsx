import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user && user.id === post.user_id;
  const initials = post.author_name?.charAt(0).toUpperCase() || '?';

  async function handleDelete() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/api/posts/${post.id}`);
      if (onDelete) onDelete(post.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post.');
    }
  }

  return (
    <>
      <style>{`
        .pc {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 22px 24px;
          margin-bottom: 14px;
          transition: border-color 0.2s, background 0.2s;
        }
        .pc:hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
        }
        .pc-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .pc-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 600; font-size: 13px; flex-shrink: 0; overflow: hidden;
          border: 1.5px solid rgba(255,255,255,0.1);
        }
        .pc-author {
          font-weight: 600; font-size: 13.5px; color: rgba(255,255,255,0.85);
          transition: color 0.15s;
        }
        .pc-author:hover { color: #818cf8; }
        .pc-date { font-size: 11.5px; color: rgba(255,255,255,0.28); margin-top: 1px; }
        .pc-title {
          font-size: 17px; font-weight: 700; color: #fff;
          letter-spacing: -0.2px; margin-bottom: 8px; line-height: 1.35;
          transition: color 0.15s;
        }
        .pc-title:hover { color: #a5b4fc; }
        .pc-excerpt {
          font-size: 13.5px; color: rgba(255,255,255,0.42);
          line-height: 1.65; margin-bottom: 14px;
        }
        .pc-media {
          width: 100%; max-height: 260px; object-fit: cover;
          border-radius: 9px; margin-bottom: 14px;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .pc-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 2px;
        }
        .pc-read {
          font-size: 12.5px; color: rgba(255,255,255,0.3);
          display: inline-flex; align-items: center; gap: 5px;
          transition: color 0.15s;
        }
        .pc-read:hover { color: #818cf8; }
        .pc-actions { display: flex; gap: 6px; }
      `}</style>

      <article className="pc">
        <div className="pc-header">
          <Link to={`/users/${post.user_id}`} style={{ textDecoration: 'none' }}>
            <div className="pc-avatar">
              {post.author_avatar
                ? <img src={post.author_avatar} alt={post.author_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>
          </Link>
          <div>
            <Link to={`/users/${post.user_id}`} className="pc-author">{post.author_name}</Link>
            <div className="pc-date">{formatDate(post.created_at)}</div>
          </div>
        </div>

        <Link to={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
          <h2 className="pc-title">{post.title}</h2>
        </Link>

        <p className="pc-excerpt">
          {post.content.length > 280 ? post.content.slice(0, 280) + '…' : post.content}
        </p>

        {post.media_url && (
          <img src={post.media_url} alt="Post media" className="pc-media" loading="lazy" />
        )}

        <div className="pc-footer">
          <Link to={`/posts/${post.id}`} className="pc-read">
            Read more
            <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 10h10M10 5l5 5-5 5"/>
            </svg>
          </Link>
          {isOwner && (
            <div className="pc-actions">
              <button
                className="btn btn-outline"
                style={{ fontSize: '12px', padding: '5px 10px' }}
                onClick={() => navigate(`/posts/${post.id}/edit`)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                style={{ fontSize: '12px', padding: '5px 10px' }}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
