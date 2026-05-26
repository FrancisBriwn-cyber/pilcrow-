const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../db');

// Only register Google strategy if credentials are configured
if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
  console.warn('Google OAuth not configured — skipping Google strategy.');
} else {
  /*
    Google OAuth strategy:
    - If a user with this Google ID already exists, return them.
    - If a user with the same email exists (registered via email/password), link the accounts.
    - Otherwise, create a new user record.
  */
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
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
