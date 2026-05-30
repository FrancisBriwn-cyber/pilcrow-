import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import api from '../api/axios';

const CATEGORIES = [
  'Personal Essay', 'Poetry', 'Fiction', 'Travel & Places',
  'Ideas & Philosophy', 'Books & Reading', 'Creativity & Craft',
  'Life & Culture', 'Journal', 'Observations', 'General'
];

function MenuBar({ editor }) {
  if (!editor) return null;
  const btn = (action, label, active) => (
    <button
      type="button"
      className={`tbar-btn${active ? ' tbar-active' : ''}`}
      onClick={action}
      title={label}
    >{label}</button>
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
      {btn(() => editor.chain().focus().setHorizontalRule().run(), '— Rule', false)}
    </div>
  );
}

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Tell your story…' }),
    ],
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
  });

  function handleFile(e) {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const content = editor?.getHTML() || '';
    if (!title.trim()) return setError('Title is required.');
    if (!content || content === '<p></p>') return setError('Content is required.');
    setError(''); setLoading(true);
    try {
      const data = new FormData();
      data.append('title', title);
      data.append('content', content);
      data.append('category', category);
      if (file) data.append('media', file);
      const res = await api.post('/api/posts', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/posts/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [editor, title, category, file, navigate]);

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
        .editor-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 28px; margin-bottom: 16px;
        }

        /* Toolbar */
        .tbar {
          display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
          padding-bottom: 14px; margin-bottom: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .tbar-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.65); border-radius: 7px;
          padding: 5px 10px; font-size: 12.5px; font-family: inherit; cursor: pointer;
          transition: all 0.15s;
        }
        .tbar-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .tbar-active { background: rgba(13,148,136,0.18) !important; border-color: rgba(13,148,136,0.4) !important; color: #5eead4 !important; }
        .tbar-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 4px; }

        /* TipTap editor area */
        .tiptap-editor {
          min-height: 280px; outline: none;
          color: rgba(255,255,255,0.88); font-size: 16px; line-height: 1.8;
          font-family: Georgia, 'Times New Roman', serif;
        }
        .tiptap-editor p { margin: 0 0 14px; }
        .tiptap-editor h2 { font-size: 22px; font-weight: 700; color: #fff; margin: 24px 0 10px; letter-spacing: -0.3px; }
        .tiptap-editor h3 { font-size: 18px; font-weight: 600; color: #fff; margin: 20px 0 8px; }
        .tiptap-editor blockquote {
          border-left: 3px solid #0d9488; margin: 16px 0; padding: 8px 20px;
          color: rgba(255,255,255,0.55); font-style: italic;
        }
        .tiptap-editor ul, .tiptap-editor ol { padding-left: 24px; margin: 0 0 14px; }
        .tiptap-editor li { margin-bottom: 4px; }
        .tiptap-editor hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0; }
        .tiptap-editor strong { color: #fff; }
        .tiptap-editor em { color: rgba(255,255,255,0.75); }
        .tiptap-editor s { color: rgba(255,255,255,0.4); }
        .tiptap-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: rgba(255,255,255,0.2); float: left; pointer-events: none; height: 0;
        }

        /* Title input */
        .editor-title-input {
          width: 100%; background: transparent; border: none; outline: none;
          font-size: 28px; font-weight: 800; color: #fff;
          letter-spacing: -0.5px; font-family: Georgia, serif;
          margin-bottom: 20px; padding: 0;
        }
        .editor-title-input::placeholder { color: rgba(255,255,255,0.18); }

        /* Category select */
        .editor-row { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
        .editor-cat-label { font-size: 12px; color: rgba(255,255,255,0.4); white-space: nowrap; }
        .editor-cat-select {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; color: rgba(255,255,255,0.75);
          padding: 6px 12px; font-size: 13px; font-family: inherit; outline: none;
          cursor: pointer; transition: border-color 0.15s;
        }
        .editor-cat-select:focus { border-color: rgba(13,148,136,0.5); }
        .editor-cat-select option { background: #1a1a1a; }

        /* Cover image */
        .editor-cover-section { margin-top: 16px; }
        .editor-cover-label { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 8px; display: block; }
        .editor-preview-img {
          width: 100%; max-height: 260px; object-fit: cover;
          border-radius: 10px; margin-top: 10px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        /* Actions */
        .editor-actions { display: flex; gap: 10px; padding-top: 8px; }

        /* Light mode */
        [data-theme="light"] .editor-page { background: #faf7f2; }
        [data-theme="light"] .editor-card { background: #fff; border-color: rgba(0,0,0,0.08); }
        [data-theme="light"] .editor-heading { color: #0a0a0a; }
        [data-theme="light"] .editor-back { color: rgba(0,0,0,0.35); }
        [data-theme="light"] .editor-back:hover { color: #0a0a0a; }
        [data-theme="light"] .tiptap-editor { color: #1a1a1a; }
        [data-theme="light"] .tiptap-editor h2, [data-theme="light"] .tiptap-editor h3 { color: #0a0a0a; }
        [data-theme="light"] .tiptap-editor strong { color: #0a0a0a; }
        [data-theme="light"] .tiptap-editor p.is-editor-empty:first-child::before { color: rgba(0,0,0,0.25); }
        [data-theme="light"] .tbar-btn { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.1); color: rgba(0,0,0,0.6); }
        [data-theme="light"] .tbar-btn:hover { background: rgba(0,0,0,0.08); color: #0a0a0a; }
        [data-theme="light"] .editor-title-input { color: #0a0a0a; }
        [data-theme="light"] .editor-cat-select { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.1); color: #333; }
        [data-theme="light"] .editor-cat-select option { background: #fff; color: #0a0a0a; }

        @media (max-width: 640px) {
          .editor-page { padding: 90px 12px 48px; }
          .editor-card { padding: 18px 16px; }
          .editor-title-input { font-size: 22px; }
          .tiptap-editor { font-size: 15px; min-height: 220px; }
        }
      `}</style>

      <div className="editor-page">
        <div className="editor-glow" />
        <div className="editor-inner">
          <Link to="/" className="editor-back">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 10H5M10 5l-5 5 5 5"/>
            </svg>
            Back to feed
          </Link>
          <h1 className="editor-heading">New Story</h1>
          <p className="editor-sub">Write something worth reading</p>

          {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="editor-card">
              <input
                className="editor-title-input"
                placeholder="Your story title…"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />

              <div className="editor-row">
                <span className="editor-cat-label">Category</span>
                <select className="editor-cat-select" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <MenuBar editor={editor} />
              <EditorContent editor={editor} />

              <div className="editor-cover-section">
                <label className="editor-cover-label">
                  Cover image <span style={{ color: 'rgba(255,255,255,0.25)' }}>— optional</span>
                </label>
                <input type="file" accept="image/*" onChange={handleFile} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }} />
                {preview && <img src={preview} alt="Preview" className="editor-preview-img" />}
              </div>
            </div>

            <div className="editor-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Publishing…' : 'Publish Story'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
