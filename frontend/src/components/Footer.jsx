import { Link } from 'react-router-dom';

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        .ft {
          background: #0d9488;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* ── Decorative diamond grid (left) ── */
        .ft-diamonds {
          position: absolute;
          left: 60px; top: 0; bottom: 0;
          width: 280px;
          pointer-events: none; opacity: 0.18;
          display: flex; align-items: center;
        }
        @media (max-width: 860px) { .ft-diamonds { opacity: 0.09; left: 20px; } }
        @media (max-width: 600px) { .ft-diamonds { display: none; } }

        /* ── Main content ── */
        .ft-inner {
          max-width: 1300px; margin: 0 auto;
          position: relative; z-index: 1;
          padding: 64px 60px 0 240px;
        }
        @media (max-width: 860px) { .ft-inner { padding: 56px 40px 0 220px; } }
        @media (max-width: 600px) { .ft-inner { padding: 48px 28px 0; } }

        /* Top: brand + columns */
        .ft-top {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 80px;
          padding-bottom: 52px;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          align-items: center;
        }
        @media (max-width: 700px) {
          .ft-top { grid-template-columns: 1fr; gap: 36px; }
        }

        .ft-brand { display: flex; flex-direction: column; gap: 20px; }
        .ft-logo {
          display: inline-flex; align-items: center; gap: 10px;
          text-decoration: none; width: fit-content;
        }
        .ft-logo-mark {
          width: 36px; height: 36px; border-radius: 9px;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ft-logo-word {
          font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.3px;
        }
        .ft-headline {
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 900; color: #fff;
          letter-spacing: -1.5px; line-height: 1.05;
          max-width: 500px;
        }
        .ft-headline em {
          font-style: normal;
          color: rgba(0,0,0,0.3);
        }
        .ft-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #0d9488;
          font-size: 13.5px; font-weight: 700; font-family: inherit;
          padding: 12px 24px; border-radius: 100px;
          text-decoration: none; border: none; cursor: pointer;
          transition: transform 0.15s, opacity 0.15s;
          width: fit-content;
        }
        .ft-cta:hover { transform: translateY(-2px); opacity: 0.92; }

        /* Columns */
        .ft-cols {
          display: flex; gap: 52px;
          flex-shrink: 0;
        }
        @media (max-width: 500px) {
          .ft-cols { gap: 32px; }
        }
        .ft-col-title {
          font-size: 10.5px; font-weight: 700;
          color: rgba(255,255,255,0.5);
          letter-spacing: 1.2px; text-transform: uppercase;
          margin-bottom: 18px;
        }
        .ft-links { list-style: none; display: flex; flex-direction: column; gap: 13px; }
        .ft-link {
          font-size: 14px; color: rgba(255,255,255,0.8);
          text-decoration: none; transition: color 0.15s;
          white-space: nowrap;
        }
        .ft-link:hover { color: #fff; }

        /* Bottom bar */
        .ft-bottom {
          max-width: 1300px; margin: 0 auto;
          padding: 22px 60px 22px 240px;
          display: flex; align-items: center;
          justify-content: space-between;
          position: relative; z-index: 1;
          flex-wrap: wrap; gap: 12px;
        }
        @media (max-width: 860px) { .ft-bottom { padding: 22px 40px 22px 220px; } }
        @media (max-width: 600px) { .ft-bottom { padding: 22px 28px; } }

        .ft-copy {
          font-size: 12.5px; color: rgba(255,255,255,0.45);
        }
        .ft-copy strong { color: rgba(255,255,255,0.7); font-weight: 600; }

        .ft-bottom-right {
          display: flex; align-items: center; gap: 24px;
        }
        .ft-bottom-link {
          font-size: 12.5px; color: rgba(255,255,255,0.45);
          text-decoration: none; transition: color 0.15s;
        }
        .ft-bottom-link:hover { color: #fff; }

        .ft-back-top {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 600;
          color: #fff; background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 7px 14px; border-radius: 100px;
          cursor: pointer; font-family: inherit;
          transition: background 0.15s, transform 0.15s;
        }
        .ft-back-top:hover { background: rgba(0,0,0,0.35); transform: translateY(-2px); }

        /* Light mode */
        [data-theme="light"] .ft {
          background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
        }
      `}</style>

      <footer className="ft">
        {/* Diamond grid decoration */}
        <svg className="ft-diamonds" viewBox="0 0 260 340" fill="none" xmlns="http://www.w3.org/2000/svg">
          {[
            [60,50],[110,50],[160,50],
            [35,105],[85,105],[135,105],[185,105],
            [60,160],[110,160],[160,160],
            [35,215],[85,215],[135,215],[185,215],
            [60,270],[110,270],[160,270],
          ].map(([cx, cy], i) => (
            <rect key={i} x={cx-20} y={cy-20} width="36" height="36"
              rx="5" fill="white"
              transform={`rotate(45 ${cx} ${cy})`}
              opacity={0.7 + (i % 3) * 0.1}
            />
          ))}
        </svg>

        <div className="ft-inner">
          <div className="ft-top">
            {/* Brand + headline */}
            <div className="ft-brand">
              <Link to="/" className="ft-logo">
                <div className="ft-logo-mark">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M15 3H9a5 5 0 000 10h3v8"/>
                    <path d="M15 3a5 5 0 010 10"/>
                    <line x1="18" y1="3" x2="18" y2="21"/>
                  </svg>
                </div>
                <span className="ft-logo-word">Pilcrow</span>
              </Link>

              <h2 className="ft-headline">
                Your words.<br />
                <em>Their moment.</em>
              </h2>

              <Link to="/register" className="ft-cta">
                Start writing free
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 10h10M10 5l5 5-5 5"/>
                </svg>
              </Link>
            </div>

            {/* Link columns */}
            <div className="ft-cols">
              <div>
                <p className="ft-col-title">Platform</p>
                <ul className="ft-links">
                  <li><Link to="/" className="ft-link">Home</Link></li>
                  <li><Link to="/#feed" className="ft-link">Browse posts</Link></li>
                  <li><Link to="/posts/new" className="ft-link">Write</Link></li>
                  <li><Link to="/search?q=" className="ft-link">Search</Link></li>
                </ul>
              </div>
              <div>
                <p className="ft-col-title">Social</p>
                <ul className="ft-links">
                  <li><a href="https://github.com" target="_blank" rel="noreferrer" className="ft-link">GitHub</a></li>
                  <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="ft-link">Twitter / X</a></li>
                  <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="ft-link">LinkedIn</a></li>
                </ul>
              </div>
              <div>
                <p className="ft-col-title">Legal</p>
                <ul className="ft-links">
                  <li><a href="#" className="ft-link">Privacy</a></li>
                  <li><a href="#" className="ft-link">Terms</a></li>
                  <li><a href="#" className="ft-link">Cookies</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ft-bottom">
          <p className="ft-copy">© {year} <strong>Pilcrow</strong>. Built for writers, by writers.</p>
          <div className="ft-bottom-right">
            <a href="#" className="ft-bottom-link">Terms of service</a>
            <button className="ft-back-top" onClick={scrollToTop}>
              Back to top
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10 15V5M5 10l5-5 5 5"/>
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
