import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('content', form.content);
      if (file) data.append('media', file);

      const res = await api.post('/api/posts', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/posts/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '40px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Create New Post</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Give your post a title" required />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea name="content" value={form.content} onChange={handleChange} placeholder="What's on your mind?" required style={{ minHeight: '200px' }} />
          </div>
          <div className="form-group">
            <label>Image or GIF <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input type="file" accept="image/*" onChange={handleFile} />
          </div>

          {preview && (
            <div style={{ marginBottom: '16px' }}>
              <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '6px' }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Publishing…' : 'Publish Post'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
