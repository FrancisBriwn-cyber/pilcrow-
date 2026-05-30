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

  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [ratingAvg, setRatingAvg] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    api.get(`/api/posts/${id}`)
      .then((res) => setPost(res.data))
      .catch((err) => {
        if (err.response?.status === 404) setError('Post not found.');
        else setError('Failed to load post.');
      })
      .finally(() => setLoading(false));

    api.get(`/api/posts/${id}/likes${user ? `?userId=${user.id}` : ''}`)
      .then((res) => { setLikeCount(res.data.count); setLiked(res.data.liked); })
      .catch(() => {});

    api.get(`/api/posts/${id}/rating${user ? `?userId=${user.id}` : ''}`)
      .then((res) => { setRatingAvg(res.data.average); setRatingCount(res.data.count); setUserRating(res.data.userScore); })
      .catch(() => {});

    api.get(`/api/posts/${id}/comments`)
      .then((res) => setComments(res.data))
      .catch(() => {});
  }, [id, user]);

  async function handleDelete() {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/api/posts/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post.');
    }
  }

  async function handleLike() {
    if (!user) { navigate('/login'); return; }
    setLikeLoading(true);
    try {
      const res = await api.post(`/api/posts/${id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.count);
    } catch {
      // silent
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleRate(score) {
    if (!user) { navigate('/login'); return; }
    setRatingLoading(true);
    try {
      const res = await api.post(`/api/posts/${id}/rating`, { score });
      setRatingAvg(res.data.average);
      setRatingCount(res.data.count);
      setUserRating(res.data.userScore);
    } catch {
      // silent
    } finally {
      setRatingLoading(false);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/api/posts/${id}/comments`, { content: commentText });
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post comment.');
    } finally {
      setCommentLoading(false);
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await api.delete(`/api/posts/${id}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete comment.');
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
          background: radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%);
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
          display: flex; align-items: center;
          justify-content: space-between;
          gap: 12px; margin-bottom: 28px;
        }
        .sp-author-left { display: flex; align-items: center; gap: 12px; }
        .sp-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #0d9488, #0f766e);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 16px; overflow: hidden; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.1);
        }
        .sp-author-name { font-weight: 600; font-size: 14px; color: #fff; }
        .sp-author-name:hover { color: #14b8a6; }
        .sp-date { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }

        .sp-owner-btns {
          display: flex; align-items: center; gap: 8px; flex-shrink: 0;
        }
        .sp-btn-edit {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 500; font-family: inherit;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7); cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .sp-btn-edit:hover {
          background: rgba(13,148,136,0.15);
          border-color: rgba(13,148,136,0.35);
          color: #5eead4;
        }
        .sp-btn-delete {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 500; font-family: inherit;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.18);
          color: rgba(248,113,113,0.8); cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .sp-btn-delete:hover {
          background: rgba(239,68,68,0.18);
          border-color: rgba(239,68,68,0.35);
          color: #f87171;
        }

        .sp-title {
          font-size: clamp(26px, 4vw, 38px); font-weight: 800;
          background: linear-gradient(135deg, #0d9488, #14b8a6, #2dd4bf);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.8px; line-height: 1.2; margin-bottom: 24px;
        }
        .sp-content {
          font-size: 17px; line-height: 1.85; color: rgba(255,255,255,0.92);
          white-space: pre-wrap; margin-bottom: 28px;
          font-weight: 400; letter-spacing: 0.1px;
        }
        .sp-media {
          width: 100%; max-height: 500px; object-fit: cover;
          border-radius: 10px; margin-bottom: 28px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        /* Like bar */
        .sp-like-bar {
          display: flex; align-items: center; gap: 10px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .sp-like-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 18px; border-radius: 100px;
          font-size: 13px; font-weight: 500; font-family: inherit;
          cursor: pointer; transition: all 0.15s;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.55);
        }
        .sp-like-btn:hover {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.25);
          color: #f87171;
        }
        .sp-like-btn.liked {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.3);
          color: #f87171;
        }
        .sp-like-btn:disabled { opacity: 0.6; cursor: default; }
        .sp-like-count { font-size: 13px; color: rgba(255,255,255,0.35); }

        /* Rating */
        .sp-rating-bar {
          display: flex; align-items: center; gap: 12px;
          padding-top: 14px; flex-wrap: wrap;
        }
        .sp-stars {
          display: flex; align-items: center; gap: 3px;
        }
        .sp-star {
          background: none; border: none; padding: 2px; cursor: pointer;
          color: rgba(255,255,255,0.2); transition: color 0.1s, transform 0.1s;
          line-height: 0;
        }
        .sp-star:hover, .sp-star.active { color: #fbbf24; }
        .sp-star:hover { transform: scale(1.15); }
        .sp-star:disabled { cursor: default; opacity: 0.6; }
        .sp-rating-label {
          font-size: 12px; color: rgba(255,255,255,0.3);
        }
        .sp-rating-avg {
          font-size: 13px; font-weight: 600; color: #fbbf24;
        }
        .sp-rating-your {
          font-size: 12px; color: rgba(255,255,255,0.3);
          background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.18);
          padding: 2px 8px; border-radius: 100px;
        }

        /* Comments */
        .sp-comments {
          margin-top: 28px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 28px;
        }
        .sp-comments-title {
          font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.7);
          margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
        }
        .sp-comments-count {
          font-size: 12px; font-weight: 500;
          background: rgba(13,148,136,0.12); border: 1px solid rgba(13,148,136,0.2);
          color: #5eead4; padding: 2px 8px; border-radius: 100px;
        }
        .sp-comment-form { margin-bottom: 24px; }
        .sp-comment-textarea {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px; padding: 12px 14px;
          font-size: 14px; font-family: inherit;
          color: #fff; resize: vertical; min-height: 80px;
          transition: border-color 0.15s;
          outline: none;
        }
        .sp-comment-textarea::placeholder { color: rgba(255,255,255,0.25); }
        .sp-comment-textarea:focus { border-color: rgba(13,148,136,0.4); }
        .sp-comment-submit {
          margin-top: 8px;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 10px;
          font-size: 13px; font-weight: 500; font-family: inherit;
          background: rgba(13,148,136,0.15);
          border: 1px solid rgba(13,148,136,0.25);
          color: #5eead4; cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .sp-comment-submit:hover:not(:disabled) {
          background: rgba(13,148,136,0.25);
          border-color: rgba(13,148,136,0.4);
        }
        .sp-comment-submit:disabled { opacity: 0.5; cursor: default; }
        .sp-comment-login {
          font-size: 13px; color: rgba(255,255,255,0.3); margin-bottom: 20px;
        }
        .sp-comment-login a { color: #14b8a6; }
        .sp-comment-login a:hover { color: #5eead4; }

        .sp-comment-list { display: flex; flex-direction: column; gap: 16px; }
        .sp-comment {
          display: flex; gap: 12px;
        }
        .sp-comment-avatar {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #0d9488, #0f766e);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px; overflow: hidden;
          border: 1.5px solid rgba(255,255,255,0.08);
        }
        .sp-comment-body { flex: 1; }
        .sp-comment-meta {
          display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
        }
        .sp-comment-author {
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8);
        }
        .sp-comment-date { font-size: 11px; color: rgba(255,255,255,0.28); }
        .sp-comment-text { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6; }
        .sp-comment-del {
          margin-left: auto; background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.2); padding: 2px 4px; border-radius: 6px;
          transition: color 0.15s, background 0.15s; flex-shrink: 0; align-self: flex-start;
        }
        .sp-comment-del:hover { color: #f87171; background: rgba(239,68,68,0.08); }

        .sp-empty-comments {
          text-align: center; padding: 32px 0;
          color: rgba(255,255,255,0.22); font-size: 14px;
        }

        @media (max-width: 640px) {
          .sp-page { padding: 90px 12px 48px; }
          .sp-article { padding: 20px 16px; }
          .sp-author-row { flex-wrap: wrap; gap: 10px; }
          .sp-title { font-size: clamp(22px, 6vw, 32px); }
          .sp-content { font-size: 15px; }
          .sp-comments { padding: 20px 16px; }
          .sp-owner-btns { flex-wrap: wrap; }
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
              <div className="sp-author-left">
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

              {isOwner && (
                <div className="sp-owner-btns">
                  <button className="sp-btn-edit" onClick={() => navigate(`/posts/${id}/edit`)}>
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                    Edit
                  </button>
                  <button className="sp-btn-delete" onClick={handleDelete}>
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h14M8 6V4h4v2M19 6l-1 12a2 2 0 01-2 2H4a2 2 0 01-2-2L1 6"/>
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h1 className="sp-title">{post.title}</h1>

            {post.media_url && (
              <img src={post.media_url} alt="Post media" className="sp-media" />
            )}

            <p className="sp-content">{post.content}</p>

            {/* Like + Rating bar */}
            <div className="sp-like-bar">
              <button
                className={`sp-like-btn${liked ? ' liked' : ''}`}
                onClick={handleLike}
                disabled={likeLoading}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {liked ? 'Liked' : 'Like'}
              </button>
              {likeCount > 0 && (
                <span className="sp-like-count">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
              )}
            </div>

            {/* Star rating */}
            <div className="sp-rating-bar">
              <div className="sp-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`sp-star${(hoverRating || userRating || 0) >= star ? ' active' : ''}`}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={ratingLoading}
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={(hoverRating || userRating || 0) >= star ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                ))}
              </div>
              {ratingAvg && (
                <span className="sp-rating-avg">{ratingAvg} / 5</span>
              )}
              {ratingCount > 0 && (
                <span className="sp-rating-label">({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})</span>
              )}
              {userRating && (
                <span className="sp-rating-your">Your rating: {userRating}</span>
              )}
            </div>
          </article>

          {/* Comments section */}
          <div className="sp-comments">
            <div className="sp-comments-title">
              Comments
              <span className="sp-comments-count">{comments.length}</span>
            </div>

            {user ? (
              <form className="sp-comment-form" onSubmit={handleAddComment}>
                <textarea
                  className="sp-comment-textarea"
                  placeholder="Write a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  className="sp-comment-submit"
                  disabled={commentLoading || !commentText.trim()}
                >
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10.5l16-8-6 8 6 8-16-8z"/>
                  </svg>
                  {commentLoading ? 'Posting…' : 'Post comment'}
                </button>
              </form>
            ) : (
              <p className="sp-comment-login">
                <Link to="/login">Sign in</Link> to leave a comment.
              </p>
            )}

            {comments.length === 0 ? (
              <div className="sp-empty-comments">No comments yet. Be the first!</div>
            ) : (
              <div className="sp-comment-list">
                {comments.map((c) => (
                  <div key={c.id} className="sp-comment">
                    <div className="sp-comment-avatar">
                      {c.author_avatar
                        ? <img src={c.author_avatar} alt={c.author_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : c.author_name?.charAt(0).toUpperCase()
                      }
                    </div>
                    <div className="sp-comment-body">
                      <div className="sp-comment-meta">
                        <span className="sp-comment-author">{c.author_name}</span>
                        <span className="sp-comment-date">{formatDate(c.created_at)}</span>
                        {user && user.id === c.user_id && (
                          <button className="sp-comment-del" onClick={() => handleDeleteComment(c.id)} title="Delete comment">
                            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h14M8 6V4h4v2M19 6l-1 12a2 2 0 01-2 2H4a2 2 0 01-2-2L1 6"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className="sp-comment-text">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
