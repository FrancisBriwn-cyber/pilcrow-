import { useEffect, useState } from 'react';
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
        if (user && post.user_id !== user.id) { navigate('/'); return; }
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
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
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
        .editor-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; color: rgba(255,255,255,0.35);
          margin-bottom: 16px; transition: color 0.15s; cursor: pointer;
        }
        .editor-back:hover { color: rgba(255,255,255,0.7); }
        .editor-title {
          font-size: 26px; font-weight: 700; color: #fff;
          letter-spacing: -0.5px; margin-bottom: 4px;
        }
        .editor-sub { font-size: 14px; color: rgba(255,255,255,0.35); margin-bottom: 28px; }
        .editor-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 32px;
        }
        .editor-preview-img {
          width: 100%; max-height: 320px; object-fit: cover;
          border-radius: 10px; margin-bottom: 16px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .editor-actions { display: flex; gap: 10px; padding-top: 4px; }
      `}</style>

      <div className="editor-page">
        <div className="editor-glow" />
        <div className="editor-inner">
          <a onClick={() => navigate(`/posts/${id}`)} className="editor-back">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 10H5M10 5l-5 5 5 5"/>
            </svg>
            Back to post
          </a>
          <h1 className="editor-title">Edit Post</h1>
          <p className="editor-sub">Make your changes below</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="editor-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea name="content" value={form.content} onChange={handleChange} required style={{ minHeight: '220px' }} />
              </div>
              <div className="form-group">
                <label>
                  Replace cover image
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400, marginLeft: '6px' }}>optional</span>
                </label>
                <input type="file" accept="image/*" onChange={handleFile} />
              </div>

              {(preview || existingMedia) && (
                <img src={preview || existingMedia} alt="Media" className="editor-preview-img" />
              )}

              <div className="editor-actions">
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
      </div>
    </>
  );
}
