import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function readTime(text = '') {
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function coverImg(post, w, h) {
  return post.media_url || `https://picsum.photos/seed/${post.id}/${w}/${h}`;
}

export default function PostCard({ post, onDelete, featured = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user && user.id === post.user_id;
  const initials = post.author_name?.charAt(0).toUpperCase() || '?';
  const mins = readTime(post.content);

  async function handleDelete() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/api/posts/${post.id}`);
      if (onDelete) onDelete(post.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post.');
    }
  }

  if (featured) {
    return (
      <>
        <style>{`
          .pc-feat {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 18px; overflow: hidden;
            display: grid; grid-template-columns: 1fr 420px;
            min-height: 300px;
            transition: border-color 0.2s, transform 0.2s;
            grid-column: 1 / -1;
          }
          .pc-feat:hover { border-color: rgba(13,148,136,0.4); transform: translateY(-2px); }
          .pc-feat-body {
            padding: 40px 44px;
            display: flex; flex-direction: column; justify-content: space-between;
          }
          .pc-feat-tag {
            display: inline-flex; align-items: center; gap: 5px;
            background: rgba(13,148,136,0.12); border: 1px solid rgba(13,148,136,0.25);
            border-radius: 100px; padding: 4px 12px;
            font-size: 11px; font-weight: 600; color: #5eead4;
            letter-spacing: 0.5px; text-transform: uppercase;
            margin-bottom: 18px; width: fit-content;
          }
          .pc-feat-title {
            font-size: clamp(20px, 2.5vw, 28px); font-weight: 800;
            background: linear-gradient(135deg, #0d9488, #14b8a6, #2dd4bf);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px; line-height: 1.25; margin-bottom: 14px;
          }
          .pc-feat-excerpt {
            font-size: 14.5px; color: rgba(255,255,255,0.45);
            line-height: 1.7; margin-bottom: 28px;
            display: -webkit-box; -webkit-line-clamp: 3;
            -webkit-box-orient: vertical; overflow: hidden;
          }
          .pc-feat-footer {
            display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          }
          .pc-feat-author-row { display: flex; align-items: center; gap: 10px; }
          .pc-feat-avatar {
            width: 36px; height: 36px; border-radius: 50%;
            background: linear-gradient(135deg, #0d9488, #0f766e);
            color: #fff; display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 13px; overflow: hidden; flex-shrink: 0;
            border: 2px solid rgba(255,255,255,0.1);
          }
          .pc-feat-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75); }
          .pc-feat-meta { font-size: 11.5px; color: rgba(255,255,255,0.28); margin-top: 1px; }
          .pc-feat-right { display: flex; align-items: center; gap: 8px; }
          .pc-feat-read {
            display: inline-flex; align-items: center; gap: 6px;
            background: #fff; color: #0a0a0a; border: none; cursor: pointer;
            font-size: 13px; font-weight: 600; font-family: inherit;
            padding: 9px 20px; border-radius: 10px; text-decoration: none;
            transition: opacity 0.15s, transform 0.1s;
          }
          .pc-feat-read:hover { opacity: 0.85; transform: translateY(-1px); }
          .pc-feat-image {
            position: relative; overflow: hidden;
          }
          .pc-feat-image img {
            width: 100%; height: 100%; object-fit: cover;
            transition: transform 0.4s ease;
          }
          .pc-feat:hover .pc-feat-image img { transform: scale(1.04); }
          .pc-feat-image::after {
            content: '';
            position: absolute; inset: 0;
            background: linear-gradient(to right, rgba(8,8,8,0.45) 0%, transparent 35%);
            pointer-events: none;
          }
          @media (max-width: 780px) {
            .pc-feat { grid-template-columns: 1fr; }
            .pc-feat-image { height: 200px; }
            .pc-feat-image::after { background: linear-gradient(to bottom, transparent 40%, rgba(8,8,8,0.6)); }
          }
        `}</style>

        <article className="pc-feat">
          <div className="pc-feat-body">
            <div>
              <div className="pc-feat-tag">
                <svg width="7" height="7" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
                Featured
              </div>
              <Link to={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
                <h2 className="pc-feat-title">{post.title}</h2>
              </Link>
              <p className="pc-feat-excerpt">
                {post.content.length > 240 ? post.content.slice(0, 240) + '…' : post.content}
              </p>
            </div>
            <div className="pc-feat-footer">
              <div className="pc-feat-author-row">
                <Link to={`/users/${post.user_id}`} style={{ textDecoration: 'none' }}>
                  <div className="pc-feat-avatar">
                    {post.author_avatar
                      ? <img src={post.author_avatar} alt={post.author_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : initials}
                  </div>
                </Link>
                <div>
                  <Link to={`/users/${post.user_id}`} className="pc-feat-name" style={{ textDecoration: 'none' }}>{post.author_name}</Link>
                  <div className="pc-feat-meta">{formatDate(post.created_at)} · {mins} min read</div>
                </div>
              </div>
              <div className="pc-feat-right">
                {isOwner && (
                  <>
                    <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => navigate(`/posts/${post.id}/edit`)}>Edit</button>
                    <button className="btn btn-danger" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={handleDelete}>Delete</button>
                  </>
                )}
                <Link to={`/posts/${post.id}`} className="pc-feat-read">
                  Read article
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 10h10M10 5l5 5-5 5"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="pc-feat-image">
            <img src={coverImg(post, 840, 520)} alt={post.title} />
          </div>
        </article>
      </>
    );
  }

  return (
    <>
      <style>{`
        .pc {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; overflow: hidden;
          display: flex; flex-direction: column;
          transition: border-color 0.2s, transform 0.2s, background 0.2s;
          height: 100%;
        }
        .pc:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-4px); background: rgba(255,255,255,0.045); }
        .pc-cover {
          width: 100%; height: 176px; overflow: hidden; flex-shrink: 0; position: relative;
        }
        .pc-cover img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s ease;
        }
        .pc:hover .pc-cover img { transform: scale(1.06); }
        .pc-cover::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(8,8,8,0.55));
          pointer-events: none;
        }
        .pc-body {
          padding: 20px 22px 0; flex: 1; display: flex; flex-direction: column;
        }
        .pc-title-link { text-decoration: none; }
        .pc-title {
          font-size: 16px; font-weight: 700;
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.2px; line-height: 1.4; margin-bottom: 10px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .pc-excerpt {
          font-size: 13px; color: rgba(255,255,255,0.38);
          line-height: 1.65; flex: 1;
          display: -webkit-box; -webkit-line-clamp: 3;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .pc-footer {
          padding: 14px 22px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin-top: 16px;
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .pc-author-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .pc-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #0d9488, #0f766e);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 600; font-size: 11px; flex-shrink: 0; overflow: hidden;
          border: 1.5px solid rgba(255,255,255,0.1);
        }
        .pc-author-info { min-width: 0; }
        .pc-author {
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: color 0.15s; display: block;
        }
        .pc-author:hover { color: #14b8a6; }
        .pc-meta { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 1px; white-space: nowrap; }
        .pc-read-btn {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 12px; color: rgba(255,255,255,0.3);
          white-space: nowrap; flex-shrink: 0;
          transition: color 0.15s; text-decoration: none;
        }
        .pc-read-btn:hover { color: #14b8a6; }
        .pc-owner-actions { display: flex; gap: 5px; }
      `}</style>

      <article className="pc">
        <div className="pc-cover">
          <img src={coverImg(post, 600, 352)} alt={post.title} loading="lazy" />
        </div>

        <div className="pc-body">
          <Link to={`/posts/${post.id}`} className="pc-title-link">
            <h2 className="pc-title">{post.title}</h2>
          </Link>
          <p className="pc-excerpt">
            {post.content.length > 200 ? post.content.slice(0, 200) + '…' : post.content}
          </p>
        </div>

        <div className="pc-footer">
          <div className="pc-author-row">
            <Link to={`/users/${post.user_id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div className="pc-avatar">
                {post.author_avatar
                  ? <img src={post.author_avatar} alt={post.author_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </div>
            </Link>
            <div className="pc-author-info">
              <Link to={`/users/${post.user_id}`} className="pc-author">{post.author_name}</Link>
              <div className="pc-meta">{formatDate(post.created_at)} · {mins} min</div>
            </div>
          </div>

          {isOwner ? (
            <div className="pc-owner-actions">
              <button className="btn btn-outline" style={{ fontSize: '11px', padding: '4px 9px' }} onClick={() => navigate(`/posts/${post.id}/edit`)}>Edit</button>
              <button className="btn btn-danger" style={{ fontSize: '11px', padding: '4px 9px' }} onClick={handleDelete}>Delete</button>
            </div>
          ) : (
            <Link to={`/posts/${post.id}`} className="pc-read-btn">
              Read
              <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 10h10M10 5l5 5-5 5"/>
              </svg>
            </Link>
          )}
        </div>
      </article>
    </>
  );
}
