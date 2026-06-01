import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function readTime(text = '') {
  const plain = stripHtml(text);
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
  const [savingBio, setSavingBio] = useState(false);

  const isOwner = me && me.id === parseInt(id);

  useEffect(() => {
    api.get(`/api/users/${id}${me ? `?viewerId=${me.id}` : ''}`)
      .then((res) => {
        setProfile(res.data.user);
        setPosts(res.data.posts);
        setFollowing(res.data.user.isFollowing);
        setFollowers(res.data.user.followers || 0);
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

  async function saveBio() {
    setSavingBio(true);
    try {
      await api.put(`/api/users/${id}/bio`, { bio: bioText });
      setProfile(p => ({ ...p, bio: bioText }));
      setEditingBio(false);
    } catch { /* silent */ }
    finally { setSavingBio(false); }
  }

  if (loading) return <LoadingSpinner />;

  if (error) return (
    <>
      <style>{`.up-page{min-height:100vh;background:#080808;padding:100px 16px 60px;}`}</style>
      <div className="up-page"><div className="alert alert-error">{error}</div></div>
    </>
  );

  const initials = profile.name.charAt(0).toUpperCase();
  const totalWords = posts.reduce((sum, p) => sum + stripHtml(p.content || '').split(/\s+/).filter(Boolean).length, 0);

  return (
    <>
      <style>{`
        .up-page { min-height: 100vh; background: #080808; padding: 100px 16px 60px; position: relative; }
        .up-glow {
          position: absolute; width: 600px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%);
          top: 0; left: 50%; transform: translateX(-50%); pointer-events: none;
        }
        .up-inner { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
        .up-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 32px; margin-bottom: 24px;
        }
        .up-top { display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; }
        .up-avatar {
          width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #0d9488, #0f766e);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 30px; overflow: hidden;
          border: 2px solid rgba(255,255,255,0.1);
        }
        .up-info { flex: 1; min-width: 0; }
        .up-name {
          font-size: 24px; font-weight: 800; letter-spacing: -0.4px;
          background: linear-gradient(135deg, #2dd4bf, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 4px;
        }
        .up-joined { font-size: 12px; color: rgba(255,255,255,0.3); margin-bottom: 14px; }
        .up-stats { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
        .up-stat { text-align: center; }
        .up-stat-num { font-size: 18px; font-weight: 700; color: #fff; }
        .up-stat-lbl { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 1px; }
        .up-stat-div { width: 1px; height: 32px; background: rgba(255,255,255,0.08); }
        .up-bio { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.65; }
        .up-bio-empty { font-size: 13px; color: rgba(255,255,255,0.2); font-style: italic; }
        .up-bio-edit-btn {
          background: none; border: none; cursor: pointer; font-family: inherit;
          font-size: 12px; color: #14b8a6; padding: 4px 0; margin-top: 6px;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .up-bio-edit-btn:hover { color: #5eead4; }
        .up-bio-textarea {
          width: 100%; box-sizing: border-box; margin-top: 8px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(13,148,136,0.35);
          border-radius: 10px; padding: 10px 14px; font-size: 14px; font-family: inherit;
          color: #fff; resize: vertical; min-height: 80px; outline: none;
        }
        .up-bio-actions { display: flex; gap: 8px; margin-top: 8px; }
        .up-bio-save {
          background: #0d9488; color: #fff; border: none; cursor: pointer;
          font-family: inherit; font-size: 12.5px; font-weight: 600;
          padding: 6px 14px; border-radius: 8px;
        }
        .up-bio-save:disabled { opacity: 0.5; }
        .up-bio-cancel {
          background: none; border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.5); cursor: pointer; font-family: inherit;
          font-size: 12.5px; padding: 6px 14px; border-radius: 8px;
        }
        .up-follow-btn {
          padding: 9px 22px; border-radius: 100px; font-family: inherit;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; flex-shrink: 0;
        }
        .up-follow-btn.follow { background: #0d9488; color: #fff; border: none; box-shadow: 0 4px 14px rgba(13,148,136,0.4); }
        .up-follow-btn.follow:hover { opacity: 0.88; }
        .up-follow-btn.unfollow { background: transparent; color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.2); }
        .up-follow-btn.unfollow:hover { border-color: rgba(239,68,68,0.5); color: #f87171; }
        .up-follow-btn:disabled { opacity: 0.5; cursor: default; }
        .up-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .up-section-title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 0.8px; text-transform: uppercase; }
        .up-post-count { font-size: 12px; color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); padding: 2px 8px; border-radius: 100px; }
        .up-post-list { display: flex; flex-direction: column; gap: 12px; }
        .up-post-item {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 18px 20px;
          display: flex; gap: 16px; align-items: flex-start;
          transition: border-color 0.2s, background 0.2s; text-decoration: none;
        }
        .up-post-item:hover { border-color: rgba(13,148,136,0.3); background: rgba(13,148,136,0.04); }
        .up-post-thumb { width: 72px; height: 72px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: rgba(255,255,255,0.05); }
        .up-post-body { flex: 1; min-width: 0; }
        .up-post-cat { font-size: 10px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: #5eead4; margin-bottom: 5px; }
        .up-post-title { font-size: 15px; font-weight: 700; color: #fff; line-height: 1.3; letter-spacing: -0.2px; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .up-post-meta { font-size: 11.5px; color: rgba(255,255,255,0.3); display: flex; gap: 10px; flex-wrap: wrap; }
        .up-empty { text-align: center; padding: 60px 0; color: rgba(255,255,255,0.22); font-size: 14px; }
        [data-theme="light"] .up-page { background: #faf7f2; }
        [data-theme="light"] .up-card { background: #fff; border-color: rgba(0,0,0,0.08); }
        [data-theme="light"] .up-bio { color: rgba(0,0,0,0.55); }
        [data-theme="light"] .up-joined, [data-theme="light"] .up-stat-lbl { color: rgba(0,0,0,0.35); }
        [data-theme="light"] .up-stat-num { color: #0a0a0a; }
        [data-theme="light"] .up-post-item { background: #fff; border-color: rgba(0,0,0,0.08); }
        [data-theme="light"] .up-post-title { color: #0a0a0a; }
        [data-theme="light"] .up-section-title { color: rgba(0,0,0,0.4); }
        [data-theme="light"] .up-bio-textarea { background: rgba(0,0,0,0.04); color: #0a0a0a; }
        @media (max-width: 640px) {
          .up-page { padding: 90px 12px 48px; }
          .up-card { padding: 20px 16px; }
          .up-post-thumb { display: none; }
          .up-stats { gap: 16px; }
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
                <p className="up-joined">Writer since {formatDate(profile.created_at)}</p>

                <div className="up-stats">
                  <div className="up-stat">
                    <div className="up-stat-num">{posts.length}</div>
                    <div className="up-stat-lbl">Stories</div>
                  </div>
                  <div className="up-stat-div" />
                  <div className="up-stat">
                    <div className="up-stat-num">{followers}</div>
                    <div className="up-stat-lbl">Followers</div>
                  </div>
                  <div className="up-stat-div" />
                  <div className="up-stat">
                    <div className="up-stat-num">{profile.following || 0}</div>
                    <div className="up-stat-lbl">Following</div>
                  </div>
                  <div className="up-stat-div" />
                  <div className="up-stat">
                    <div className="up-stat-num">{totalWords > 999 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords}</div>
                    <div className="up-stat-lbl">Words written</div>
                  </div>
                </div>

                {isOwner ? (
                  editingBio ? (
                    <>
                      <textarea className="up-bio-textarea" value={bioText} onChange={e => setBioText(e.target.value)} placeholder="Tell readers about yourself…" maxLength={500} />
                      <div className="up-bio-actions">
                        <button className="up-bio-save" onClick={saveBio} disabled={savingBio}>{savingBio ? 'Saving…' : 'Save'}</button>
                        <button className="up-bio-cancel" onClick={() => { setEditingBio(false); setBioText(profile.bio || ''); }}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      {profile.bio ? <p className="up-bio">{profile.bio}</p> : <p className="up-bio-empty">No bio yet — tell readers about yourself.</p>}
                      <button className="up-bio-edit-btn" onClick={() => setEditingBio(true)}>
                        <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                        </svg>
                        {profile.bio ? 'Edit bio' : 'Add bio'}
                      </button>
                    </>
                  )
                ) : (
                  profile.bio && <p className="up-bio">{profile.bio}</p>
                )}
              </div>

              {me && !isOwner && (
                <button className={`up-follow-btn ${following ? 'unfollow' : 'follow'}`} onClick={handleFollow} disabled={followLoading}>
                  {following ? 'Following' : '+ Follow'}
                </button>
              )}
            </div>
          </div>

          <div className="up-section-header">
            <p className="up-section-title">Stories by {profile.name}</p>
            {posts.length > 0 && <span className="up-post-count">{posts.length}</span>}
          </div>

          {posts.length === 0 ? (
            <div className="up-empty">No stories published yet.</div>
          ) : (
            <div className="up-post-list">
              {posts.map(post => (
                <Link key={post.id} to={`/posts/${post.id}`} className="up-post-item">
                  {post.media_url && <img src={post.media_url} alt={post.title} className="up-post-thumb" />}
                  <div className="up-post-body">
                    {post.category && <div className="up-post-cat">{post.category}</div>}
                    <div className="up-post-title">{post.title}</div>
                    <div className="up-post-meta">
                      <span>{formatDate(post.created_at)}</span>
                      <span>· {readTime(post.content)} min read</span>
                      <span>· {stripHtml(post.content || '').split(/\s+/).filter(Boolean).length} words</span>
                    </div>
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
