import { useState } from 'react';
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
    <>
      <style>{`
        .editor-page {
          min-height: 100vh;
          background: #080808;
          padding: 100px 16px 60px;
          position: relative;
        }
        .editor-glow {
          position: absolute; width: 600px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
          top: 0; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .editor-inner {
          position: relative; z-index: 1;
          max-width: 720px; margin: 0 auto;
        }
        .editor-header {
          margin-bottom: 28px;
        }
        .editor-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; color: rgba(255,255,255,0.35);
          margin-bottom: 16px; transition: color 0.15s;
        }
        .editor-back:hover { color: rgba(255,255,255,0.7); }
        .editor-title {
          font-size: 26px; font-weight: 700; color: #fff;
          letter-spacing: -0.5px;
        }
        .editor-sub {
          font-size: 14px; color: rgba(255,255,255,0.35); margin-top: 4px;
        }
        .editor-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 32px;
        }
        .editor-preview-img {
          width: 100%; max-height: 320px; object-fit: cover;
          border-radius: 10px; margin-bottom: 16px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .editor-actions {
          display: flex; gap: 10px; padding-top: 4px;
        }
      `}</style>

      <div className="editor-page">
        <div className="editor-glow" />
        <div className="editor-inner">
          <div className="editor-header">
            <a onClick={() => navigate('/')} className="editor-back" style={{ cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 10H5M10 5l-5 5 5 5"/>
              </svg>
              Back to feed
            </a>
            <h1 className="editor-title">New Post</h1>
            <p className="editor-sub">Write something worth reading</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="editor-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Give your post a compelling title" required />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea name="content" value={form.content} onChange={handleChange} placeholder="What's on your mind?" required style={{ minHeight: '220px' }} />
              </div>
              <div className="form-group">
                <label>
                  Cover image
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, marginLeft: '6px' }}>optional</span>
                </label>
                <input type="file" accept="image/*" onChange={handleFile} />
              </div>

              {preview && (
                <img src={preview} alt="Preview" className="editor-preview-img" />
              )}

              <div className="editor-actions">
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
      </div>
    </>
  );
}
