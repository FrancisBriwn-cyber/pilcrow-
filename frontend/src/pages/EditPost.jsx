import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EditPost() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });
  const [file, setFile] = useState(null);
  const [existingMedia, setExistingMedia] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/posts/${id}`)
      .then((res) => {
        const post = res.data;
        // Redirect if not the owner
        if (user && post.user_id !== user.id) {
          navigate('/');
          return;
        }
        setForm({ title: post.title, content: post.content });
        setExistingMedia(post.media_url || '');
      })
      .catch(() => setError('Post not found.'))
      .finally(() => setLoading(false));
  }, [id, user]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFile(e) {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('content', form.content);
      if (file) data.append('media', file);

      await api.put(`/api/posts/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '40px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Edit Post</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea name="content" value={form.content} onChange={handleChange} required style={{ minHeight: '200px' }} />
          </div>
          <div className="form-group">
            <label>Replace Image/GIF <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input type="file" accept="image/*" onChange={handleFile} />
          </div>

          {(preview || existingMedia) && (
            <div style={{ marginBottom: '16px' }}>
              <img
                src={preview || existingMedia}
                alt="Media"
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '6px' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate(`/posts/${id}`)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
