import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/users/${id}`)
      .then((res) => { setProfile(res.data.user); setPosts(res.data.posts); })
      .catch((err) => {
        if (err.response?.status === 404) setError('User not found.');
        else setError('Failed to load profile.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleDelete(deletedId) {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  }

  if (loading) return <LoadingSpinner />;

  if (error) return (
    <>
      <style>{`.up-page{min-height:100vh;background:#080808;padding:100px 16px 60px;}`}</style>
      <div className="up-page">
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    </>
  );

  const initials = profile.name.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        .up-page {
          min-height: 100vh;
          background: #080808;
          padding: 100px 16px 60px;
          position: relative;
        }
        .up-glow {
          position: absolute; width: 600px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%);
          top: 0; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .up-inner { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; }
        .up-profile-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 32px;
          display: flex; align-items: center; gap: 22px;
          margin-bottom: 32px;
        }
        .up-avatar {
          width: 76px; height: 76px; border-radius: 50%;
          background: linear-gradient(135deg, #0d9488, #0f766e);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 28px; overflow: hidden; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.1);
        }
        .up-name {
          font-size: 22px; font-weight: 700;
          background: linear-gradient(135deg, #2dd4bf, #06b6d4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.3px; margin-bottom: 4px;
        }
        .up-email { font-size: 13px; color: rgba(255,255,255,0.35); margin-bottom: 8px; }
        .up-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(13,148,136,0.1); border: 1px solid rgba(13,148,136,0.2);
          border-radius: 100px; padding: 3px 10px;
          font-size: 12px; color: #5eead4; font-weight: 500;
        }
        .up-section-title {
          font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.5);
          letter-spacing: 0.5px; text-transform: uppercase; font-size: 12px;
          margin-bottom: 16px;
        }
        .up-empty {
          text-align: center; padding: 60px 0;
          color: rgba(255,255,255,0.22); font-size: 14px;
        }
        .up-empty-icon {
          width: 52px; height: 52px; margin: 0 auto 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }
      `}</style>

      <div className="up-page">
        <div className="up-glow" />
        <div className="up-inner">
          <div className="up-profile-card">
            <div className="up-avatar">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>
            <div>
              <h1 className="up-name">{profile.name}</h1>
              <p className="up-email">{profile.email}</p>
              <span className="up-badge">
                <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </span>
            </div>
          </div>

          <p className="up-section-title">Posts by {profile.name}</p>

          {posts.length === 0 ? (
            <div className="up-empty">
              <div className="up-empty-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              No posts yet.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={{ ...post, author_name: profile.name, author_avatar: profile.avatar_url }}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>


      </div>
    </>
  );
}
