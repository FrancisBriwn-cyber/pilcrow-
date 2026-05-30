import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

function readTime(text = '') {
  const plain = text.replace(/<[^>]+>/g, '');
  return Math.max(1, Math.ceil(plain.split(/\s+/).length / 200));
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function UserProfile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [bioSaving, setBioSaving] = useState(false);

  const isOwn = me && me.id === parseInt(id);

  useEffect(() => {
    const viewerId = me ? me.id : null;
    api.get(`/api/users/${id}${viewerId ? `?viewerId=${viewerId}` : ''}`)
      .then((res) => {
        setProfile(res.data.user);
        setPosts(res.data.posts);
        setFollowing(res.data.user.isFollowing);
        setFollowers(res.data.user.followers);
        setBioText(res.data.user.bio || '');
      })
      .catch((err) => {
        if (err.response?.status === 404) setError('Writer not found.');
        else setError('Failed to load profile.');
      })
      .finally(() => setLoading(false));
  }, [id, me]);

  async function handleFollow() {
    if (!me) return;
    setFollowLoading(true);
    try {
      const res = await api.post(`/api/users/${id}/follow`);
      setFollowing(res.data.following);
      setFollowers(res.data.followers);
    } catch { /* silent */ }
    finally { setFollowLoading(false); }
  }

  async function handleSaveBio() {
    setBioSaving(true);
    try {
      await api.put(`/api/users/${id}/bio`, { bio: bioText });
      setProfile(prev => ({ ...prev, bio: bioText }));
      setEditingBio(false);
    } catch { /* silent */ }
    finally { setBioSaving(false); }
  }

  if (loading) return <LoadingSpinner />;

  if (error) return (
    <>
      <style>{`.up-page{min-height:100vh;background:#080808;padding:100px 16px 60px;}`}</style>
      <div className="up-page"><div style={{ maxWidth: '760px', margin: '0 auto' }}><div className="alert alert-error">{error}</div></div></div>
    </>
  );

  const initials = profile.name.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        .up-page { min-height: 100vh; background: #080808; padding: 100px 16px 60px; position: relative; }
        .up-glow {
          position: absolute; width: 600px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%);
          top: 0; left: 50%; transform: translateX(-50%); pointer-events: none;
        }
        .up-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }

        /* Profile card */
        .up-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 36px; margin-bottom: 32px;
        }
        .up-top { display: flex; align-items: flex-start; gap: 24px; flex-wrap: wrap; }
        .up-avatar {
          width: 88px; height: 88px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #0d9488, #0f766e);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 32px; overflow: hidden;
          border: 3px solid rgba(255,255,255,0.1);
        }
        .up-info { flex: 1; min-width: 0; }
        .up-name {
          font-size: 24px; font-weight: 800; color: #fff;
          letter-spacing: -0.4px; margin-bottom: 6px;
        }
        .up-meta { font-size: 13px; color: rgba(255,255,255,0.35); margin-bottom: 14px; }

        /* Stats row */
        .up-stats { display: flex; gap: 24px; margin-bottom: 16px; flex-wrap: wrap; }
        .up-stat { display: flex; flex-direction: column; }
        .up-stat-num { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
        .up-stat-lbl { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; }

        /* Bio */
        .up-bio { font-size: 14.5px; color: rgba(255,255,255,0.6); line-height: 1.65; margin-bottom: 16px; font-family: Georgia, serif; }
        .up-bio-placeholder { font-size: 14px; color: rgba(255,255,255,0.2); margin-bottom: 16px; font-style: italic; }
        .up-bio-textarea {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 12px 14px;
          font-size: 14px; font-family: Georgia, serif; color: #fff;
          resize: vertical; min-height: 80px; outline: none;
          transition: border-color 0.15s; margin-bottom: 10px;
        }
        .up-bio-textarea:focus { border-color: rgba(13,148,136,0.4); }
        .up-bio-actions { display: flex; gap: 8px; }

        /* Follow button */
        .up-follow-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 22px; border-radius: 100px;
          font-size: 13.5px; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: all 0.15s;
          border: 1.5px solid #0d9488; background: #0d9488; color: #fff;
          box-shadow: 0 4px 14px rgba(13,148,136,0.35);
        }
        .up-follow-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        .up-follow-btn.following {
          background: transparent; border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.65); box-shadow: none;
        }
        .up-follow-btn.following:hover:not(:disabled) {
          border-color: rgba(239,68,68,0.4); color: #f87171;
          background: rgba(239,68,68,0.07);
        }
        .up-follow-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .up-edit-bio-btn {
          background: none; border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px; color: rgba(255,255,255,0.45);
          font-size: 12px; font-family: inherit; padding: 5px 12px; cursor: pointer;
          transition: all 0.15s;
        }
        .up-edit-bio-btn:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.7); }

        /* Posts list */
        .up-posts-title {
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.4);
          letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px;
        }
        .up-post-list { display: flex; flex-direction: column; gap: 12px; }
        .up-post-item {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 20px 22px;
          text-decoration: none; display: block;
          transition: border-color 0.2s, background 0.2s;
        }
        .up-post-item:hover { border-color: rgba(13,148,136,0.3); background: rgba(13,148,136,0.04); }
        .up-post-cat {
          font-size: 10px; font-weight: 600; letter-spacing: 0.8px;
          text-transform: uppercase; color: #5eead4; margin-bottom: 6px;
        }
        .up-post-title { font-size: 16px; font-weight: 700; color: #fff; line-height: 1.35; margin-bottom: 8px; letter-spacing: -0.2px; }
        .up-post-meta { font-size: 11.5px; color: rgba(255,255,255,0.28); }
        .up-empty { text-align: center; padding: 60px 0; color: rgba(255,255,255,0.22); font-size: 14px; }

        /* Light mode */
        [data-theme="light"] .up-page { background: #faf7f2; }
        [data-theme="light"] .up-card { background: #fff; border-color: rgba(0,0,0,0.08); }
        [data-theme="light"] .up-name { color: #0a0a0a; }
        [data-theme="light"] .up-stat-num { color: #0a0a0a; }
        [data-theme="light"] .up-bio { color: rgba(0,0,0,0.65); }
        [data-theme="light"] .up-post-item { background: #fff; border-color: rgba(0,0,0,0.08); }
        [data-theme="light"] .up-post-title { color: #0a0a0a; }

        @media (max-width: 640px) {
          .up-page { padding: 90px 12px 48px; }
          .up-card { padding: 20px 16px; }
          .up-avatar { width: 68px; height: 68px; font-size: 24px; }
          .up-name { font-size: 20px; }
        }
      `}</style>

      <div className="up-page">
        <div className="up-glow" />
        <div className="up-inner">

          <div className="up-card">
            <div className="up-top">
              <div className="up-avatar">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </div>
              <div className="up-info">
                <h1 className="up-name">{profile.name}</h1>
                <p className="up-meta">Writer since {formatDate(profile.created_at)}</p>

                <div className="up-stats">
                  <div className="up-stat">
                    <span className="up-stat-num">{posts.length}</span>
                    <span className="up-stat-lbl">{posts.length === 1 ? 'Story' : 'Stories'}</span>
                  </div>
                  <div className="up-stat">
                    <span className="up-stat-num">{followers}</span>
                    <span className="up-stat-lbl">Followers</span>
                  </div>
                  <div className="up-stat">
                    <span className="up-stat-num">{profile.following}</span>
                    <span className="up-stat-lbl">Following</span>
                  </div>
                </div>

                {/* Bio */}
                {isOwn && editingBio ? (
                  <>
                    <textarea
                      className="up-bio-textarea"
                      value={bioText}
                      onChange={e => setBioText(e.target.value)}
                      placeholder="Tell readers a little about yourself…"
                      maxLength={300}
                    />
                    <div className="up-bio-actions">
                      <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={handleSaveBio} disabled={bioSaving}>
                        {bioSaving ? 'Saving…' : 'Save bio'}
                      </button>
                      <button className="btn btn-outline" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => setEditingBio(false)}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {profile.bio
                      ? <p className="up-bio">{profile.bio}</p>
                      : isOwn && <p className="up-bio-placeholder">Add a bio to tell readers about yourself…</p>
                    }
                    {isOwn && (
                      <button className="up-edit-bio-btn" onClick={() => setEditingBio(true)}>
                        {profile.bio ? 'Edit bio' : '+ Add bio'}
                      </button>
                    )}
                  </>
                )}

                {/* Follow button — only for other users */}
                {!isOwn && me && (
                  <button
                    className={`up-follow-btn${following ? ' following' : ''}`}
                    onClick={handleFollow}
                    disabled={followLoading}
                    style={{ marginTop: '14px' }}
                  >
                    {following ? 'Following' : 'Follow'}
                  </button>
                )}
                {!isOwn && !me && (
                  <Link to="/login" className="up-follow-btn" style={{ marginTop: '14px', textDecoration: 'none' }}>
                    Follow
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Posts */}
          <p className="up-posts-title">Stories by {profile.name.split(' ')[0]}</p>

          {posts.length === 0 ? (
            <div className="up-empty">No stories published yet.</div>
          ) : (
            <div className="up-post-list">
              {posts.map(post => (
                <Link key={post.id} to={`/posts/${post.id}`} className="up-post-item">
                  {post.category && post.category !== 'General' && (
                    <div className="up-post-cat">{post.category}</div>
                  )}
                  <div className="up-post-title">{post.title}</div>
                  <div className="up-post-meta">
                    {formatDate(post.created_at)} · {readTime(post.content)} min read
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
