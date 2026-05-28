
export default function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner-wrap {
          text-align: center; padding: 70px 20px;
          color: rgba(255,255,255,0.25);
        }
        .spinner-ring {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.08);
          border-top-color: #6366f1;
          animation: spin 0.7s linear infinite;
          margin: 0 auto 14px;
        }
        .spinner-msg { font-size: 13px; }
      `}</style>
      <div className="spinner-wrap">
        <div className="spinner-ring" />
        <p className="spinner-msg">{message}</p>
      </div>
    </>
  );
}
