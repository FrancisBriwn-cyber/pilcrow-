import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    api.get(`/api/posts/search?q=${encodeURIComponent(query)}`)
      .then((res) => setPosts(res.data))
      .catch(() => setError('Search failed. Please try again.'))
      .finally(() => setLoading(false));
  }, [query]);

  function handleDelete(deletedId) {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  }

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
        Search Results
      </h1>
      {query && (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          Showing results for "<strong>{query}</strong>"
        </p>
      )}

      {loading && <LoadingSpinner message="Searching..." />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && posts.length === 0 && query && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '16px' }}>No posts found for "{query}"</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>Try a different keyword.</p>
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={handleDelete} />
      ))}
    </div>
  );
}
