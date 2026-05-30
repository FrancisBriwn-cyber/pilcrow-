import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  'Personal Essay', 'Poetry', 'Fiction', 'Travel & Places',
  'Ideas & Philosophy', 'Books & Reading', 'Creativity & Craft',
  'Life & Culture', 'Journal', 'Observations', 'General'
];

function MenuBar({ editor }) {
  if (!editor) return null;
  const btn = (action, label, active) => (
    <button type="button" className={`tbar-btn${active ? ' tbar-active' : ''}`} onClick={action}>{label}</button>
  );
  return (
    <div className="tbar">
      {btn(() => editor.chain().focus().toggleBold().run(), 'B', editor.isActive('bold'))}
      {btn(() => editor.chain().focus().toggleItalic().run(), 'I', editor.isActive('italic'))}
      {btn(() => editor.chain().focus().toggleStrike().run(), 'S̶', editor.isActive('strike'))}
      <div className="tbar-sep" />
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', editor.isActive('heading', { level: 2 }))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3', editor.isActive('heading', { level: 3 }))}
      <div className="tbar-sep" />
      {btn(() => editor.chain().focus().toggleBulletList().run(), '• List', editor.isActive('bulletList'))}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), '1. List', editor.isActive('orderedList'))}
      <div className="tbar-sep" />
      {btn(() => editor.chain().focus().toggleBlockquote().run(), '" Quote', editor.isActive('blockquote'))}
    </div>
  );
}

export default function EditPost() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [file, setFile] = useState(null);
  const [existingMedia, setExistingMedia] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [contentLoaded, setContentLoaded] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Tell your story…' }),
    ],
    editorProps: { attributes: { class: 'tiptap-editor' } },
  });

  useEffect(() => {
    api.get(`/api/posts/${id}`)
      .then((res) => {
        const post = res.data;
        if (user && post.user_id !== user.id) { navigate('/'); return; }
        setTitle(post.title);
        setCategory(post.category || 'General');
        setExistingMedia(post.media_url || '');
        if (editor && !contentLoaded) {
          editor.commands.setContent(post.content || '');
          setContentLoaded(true);
        }
      })
      .catch(() => setError('Post not found.'))
      .finally(() => setLoading(false));
  }, [id, user, editor]);

  function handleFile(e) {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  }

  async function handleDelete() {
    if (!window.confirm('Permanently delete this post?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/posts/${id}`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete.');
      setDeleting(false);
    }
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const content = editor?.getHTML() || '';
    setError(''); setSaving(true);
    try {
      const data = new FormData();
      data.append('title', title);
      data.append('content', content);
      data.append('category', category);
      if (file) data.append('media', file);
      await api.put(`/api/posts/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }, [editor, title, category, file, id, navigate]);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <style>{`
        .editor-page { min-height: 100vh; background: #080808; padding: 100px 16px 60px; position: relative; }
        .editor-glow {
          position: absolute; width: 600px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%);
          top: 0; left: 50%; transform: translateX(-50%); pointer-events: none;
        }
        .editor-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }
        .editor-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; color: rgba(255,255,255,0.35);
          margin-bottom: 16px; transition: color 0.15s; text-decoration: none;
        }
        .editor-back:hover { color: rgba(255,255,255,0.7); }
        .editor-heading { font-size: 26px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
        .editor-sub { font-size: 14px; color: rgba(255,255,255,0.35); margin-top: 4px; margin-bottom: 28px; }
        .editor-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; margin-bottom: 16px; }
        .tbar { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .tbar-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.65); border-radius: 7px; padding: 5px 10px; font-size: 12.5px; font-family: inherit; cursor: pointer; transition: all 0.15s; }
        .tbar-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .tbar-active { background: rgba(13,148,136,0.18) !important; border-color: rgba(13,148,136,0.4) !important; color: #5eead4 !important; }
        .tbar-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 4px; }
        .tiptap-editor { min-height: 280px; outline: none; color: rgba(255,255,255,0.88); font-size: 16px; line-height: 1.8; font-family: Georgia, serif; }
        .tiptap-editor p { margin: 0 0 14px; }
        .tiptap-editor h2 { font-size: 22px; font-weight: 700; color: #fff; margin: 24px 0 10px; }
        .tiptap-editor h3 { font-size: 18px; font-weight: 600; color: #fff; margin: 20px 0 8px; }
        .tiptap-editor blockquote { border-left: 3px solid #0d9488; margin: 16px 0; padding: 8px 20px; color: rgba(255,255,255,0.55); font-style: italic; }
        .tiptap-editor ul, .tiptap-editor ol { padding-left: 24px; margin: 0 0 14px; }
        .tiptap-editor p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: rgba(255,255,255,0.2); float: left; pointer-events: none; height: 0; }
        .editor-title-input { width: 100%; background: transparent; border: none; outline: none; font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; font-family: Georgia, serif; margin-bottom: 20px; padding: 0; }
        .editor-title-input::placeholder { color: rgba(255,255,255,0.18); }
        .editor-row { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
        .editor-cat-label { font-size: 12px; color: rgba(255,255,255,0.4); }
        .editor-cat-select { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: rgba(255,255,255,0.75); padding: 6px 12px; font-size: 13px; font-family: inherit; outline: none; cursor: pointer; }
        .editor-cat-select option { background: #1a1a1a; }
        .editor-preview-img { width: 100%; max-height: 260px; object-fit: cover; border-radius: 10px; margin-top: 10px; border: 1px solid rgba(255,255,255,0.08); }
        .editor-actions { display: flex; gap: 10px; padding-top: 8px; flex-wrap: wrap; align-items: center; }
        .editor-actions-right { margin-left: auto; }
        .btn-delete-post { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 12px; font-size: 14px; font-weight: 600; font-family: inherit; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171; cursor: pointer; transition: background 0.15s; }
        .btn-delete-post:hover:not(:disabled) { background: rgba(239,68,68,0.18); }
        .btn-delete-post:disabled { opacity: 0.5; cursor: not-allowed; }
        [data-theme="light"] .editor-page { background: #faf7f2; }
        [data-theme="light"] .editor-card { background: #fff; border-color: rgba(0,0,0,0.08); }
        [data-theme="light"] .editor-heading, [data-theme="light"] .editor-title-input { color: #0a0a0a; }
        [data-theme="light"] .tiptap-editor { color: #1a1a1a; }
        [data-theme="light"] .tiptap-editor h2, [data-theme="light"] .tiptap-editor h3 { color: #0a0a0a; }
        [data-theme="light"] .tbar-btn { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.1); color: rgba(0,0,0,0.6); }
        [data-theme="light"] .editor-cat-select { background: rgba(0,0,0,0.04); color: #333; }
        [data-theme="light"] .editor-cat-select option { background: #fff; color: #0a0a0a; }
        @media (max-width: 640px) { .editor-page { padding: 90px 12px 48px; } .editor-card { padding: 18px 16px; } .editor-title-input { font-size: 22px; } }
      `}</style>

      <div className="editor-page">
        <div className="editor-glow" />
        <div className="editor-inner">
          <Link to={`/posts/${id}`} className="editor-back">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 10H5M10 5l-5 5 5 5"/>
            </svg>
            Back to post
          </Link>
          <h1 className="editor-heading">Edit Story</h1>
          <p className="editor-sub">Revise and refine</p>

          {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="editor-card">
              <input className="editor-title-input" value={title} onChange={e => setTitle(e.target.value)} required />
              <div className="editor-row">
                <span className="editor-cat-label">Category</span>
                <select className="editor-cat-select" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <MenuBar editor={editor} />
              <EditorContent editor={editor} />
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>
                  Replace cover image <span style={{ color: 'rgba(255,255,255,0.25)' }}>— optional</span>
                </label>
                <input type="file" accept="image/*" onChange={handleFile} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }} />
                {(preview || existingMedia) && <img src={preview || existingMedia} alt="Cover" className="editor-preview-img" />}
              </div>
            </div>
            <div className="editor-actions">
              <button type="submit" className="btn btn-primary" disabled={saving || deleting}>{saving ? 'Saving…' : 'Save Changes'}</button>
              <button type="button" className="btn btn-outline" onClick={() => navigate(`/posts/${id}`)} disabled={saving || deleting}>Cancel</button>
              <div className="editor-actions-right">
                <button type="button" className="btn-delete-post" onClick={handleDelete} disabled={deleting || saving}>
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h14M8 6V4h4v2M19 6l-1 12a2 2 0 01-2 2H4a2 2 0 01-2-2L1 6"/>
                  </svg>
                  {deleting ? 'Deleting…' : 'Delete Story'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
