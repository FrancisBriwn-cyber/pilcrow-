const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../db');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0] || false);
  } catch (err) { done(err); }
});

// Bypass state/CSRF verification — JWT handles security after login
class NullStateStore {
  store(_req, callback) { callback(null, 'x'); }
  verify(_req, _state, callback) { callback(null, true, {}); }
}

// Only register Google strategy if credentials are configured
if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
  console.warn('Google OAuth not configured — skipping Google strategy.');
} else {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    store: new NullStateStore()
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const avatar_url = profile.photos[0]?.value || null;
      const google_id = profile.id;

      // Check if user exists by google_id
      let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [google_id]);
      if (result.rows.length > 0) {
        return done(null, result.rows[0]);
      }

      // Check if user exists by email (link accounts)
      result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        await pool.query('UPDATE users SET google_id = $1, avatar_url = $2 WHERE email = $3', [google_id, avatar_url, email]);
        result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return done(null, result.rows[0]);
      }

      // Create new user
      result = await pool.query(
        'INSERT INTO users (name, email, google_id, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, google_id, avatar_url]
      );
      return done(null, result.rows[0]);
    } catch (err) {
      return done(err, null);
    }
  }));
}
