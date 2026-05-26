import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/posts')
      .then((res) => setPosts(res.data))
      .catch(() => setError('Failed to load posts. Please refresh the page.'))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(deletedId) {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  }

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Latest Posts</h1>

      {loading && <LoadingSpinner />}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && posts.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '60px' }}>
          No posts yet. Be the first to post!
        </p>
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={handleDelete} />
      ))}
    </div>
  );
}
