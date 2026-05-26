import React, { useEffect, useState } from 'react';
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
    <div className="container" style={{ paddingTop: '40px' }}>
      <div className="alert alert-error">{error}</div>
      <Link to="/" className="btn btn-outline">← Back to feed</Link>
    </div>
  );

  const isOwner = user && user.id === post.user_id;

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '40px' }}>
      <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'inline-block', marginBottom: '20px' }}>
        ← Back to feed
      </Link>

      <article style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Link to={`/users/${post.user_id}`} style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'var(--primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '16px', overflow: 'hidden', flexShrink: 0
          }}>
            {post.author_avatar
              ? <img src={post.author_avatar} alt={post.author_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : post.author_name?.charAt(0).toUpperCase()
            }
          </Link>
          <div>
            <Link to={`/users/${post.user_id}`} style={{ fontWeight: 600 }}>{post.author_name}</Link>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(post.created_at)}</div>
          </div>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>{post.title}</h1>

        <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#374151', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
          {post.content}
        </p>

        {post.media_url && (
          <img src={post.media_url} alt="Post media"
            style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', borderRadius: '6px', marginBottom: '20px' }}
          />
        )}

        {isOwner && (
          <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button className="btn btn-outline" onClick={() => navigate(`/posts/${id}/edit`)}>Edit Post</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete Post</button>
          </div>
        )}
      </article>
    </div>
  );
}
