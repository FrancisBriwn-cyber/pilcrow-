import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const styles = {
  card: {
    background: 'var(--card-bg)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px',
    marginBottom: '16px',
    transition: 'box-shadow 0.15s'
  },
  header: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'var(--primary)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, fontSize: '14px', flexShrink: 0, overflow: 'hidden'
  },
  meta: { flex: 1 },
  authorName: { fontWeight: 600, fontSize: '14px' },
  timestamp: { fontSize: '12px', color: 'var(--text-muted)' },
  title: { fontSize: '18px', fontWeight: 700, marginBottom: '8px' },
  content: { fontSize: '14px', color: '#374151', marginBottom: '12px', lineHeight: '1.6' },
  media: { width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '6px', marginBottom: '12px' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  actions: { display: 'flex', gap: '8px' }
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user && user.id === post.user_id;

  async function handleDelete() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/api/posts/${post.id}`);
      if (onDelete) onDelete(post.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post.');
    }
  }

  const initials = post.author_name?.charAt(0).toUpperCase() || '?';

  return (
    <article style={styles.card}>
      <div style={styles.header}>
        <Link to={`/users/${post.user_id}`} style={{ textDecoration: 'none' }}>
          <div style={styles.avatar}>
            {post.author_avatar
              ? <img src={post.author_avatar} alt={post.author_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials
            }
          </div>
        </Link>
        <div style={styles.meta}>
          <Link to={`/users/${post.user_id}`} style={{ textDecoration: 'none' }}>
            <div style={styles.authorName}>{post.author_name}</div>
          </Link>
          <div style={styles.timestamp}>{formatDate(post.created_at)}</div>
        </div>
      </div>

      <Link to={`/posts/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h2 style={styles.title}>{post.title}</h2>
      </Link>

      <p style={styles.content}>
        {post.content.length > 300 ? post.content.slice(0, 300) + '…' : post.content}
      </p>

      {post.media_url && (
        <img src={post.media_url} alt="Post media" style={styles.media} loading="lazy" />
      )}

      <div style={styles.footer}>
        <Link to={`/posts/${post.id}`} style={{ fontSize: '13px', color: 'var(--primary)' }}>
          Read more →
        </Link>
        {isOwner && (
          <div style={styles.actions}>
            <button
              className="btn btn-outline"
              style={{ fontSize: '13px', padding: '5px 10px' }}
              onClick={() => navigate(`/posts/${post.id}/edit`)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              style={{ fontSize: '13px', padding: '5px 10px' }}
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
