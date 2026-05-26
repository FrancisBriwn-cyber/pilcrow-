import React, { useEffect, useState } from 'react';
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
      .then((res) => {
        setProfile(res.data.user);
        setPosts(res.data.posts);
      })
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
    <div className="container" style={{ paddingTop: '40px' }}>
      <div className="alert alert-error">{error}</div>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '40px' }}>
      {/* Profile header */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '28px',
        display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px'
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'var(--primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '28px', overflow: 'hidden', flexShrink: 0
        }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : profile.name.charAt(0).toUpperCase()
          }
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{profile.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{profile.email}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Posts by {profile.name}</h2>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
          No posts yet.
        </p>
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
  );
}
