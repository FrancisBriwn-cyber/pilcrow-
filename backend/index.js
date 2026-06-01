

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const { generalLimiter } = require('./middleware/rateLimiter');

// Load Passport Google strategy
require('./middleware/passport');

// Auto-migrate on startup — safe to run on every deploy (IF NOT EXISTS)
const pool = require('./db');
(async () => {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`);
    await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(60) DEFAULT 'General'`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS follows (
        id           SERIAL PRIMARY KEY,
        follower_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at   TIMESTAMP DEFAULT NOW(),
        UNIQUE(follower_id, following_id)
      )
    `);
    console.log('Auto-migration complete.');
  } catch (err) {
    console.error('Auto-migration error:', err.message);
  }
})();

const app = express();

app.set('trust proxy', 1); // Render sits behind a proxy — needed for secure cookies

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://pilcrow-eta.vercel.app',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(session({
  secret: process.env.JWT_SECRET || 'pilcrow_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, sameSite: 'lax', maxAge: 5 * 60 * 1000 }
}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Apply general rate limit to all API routes
app.use('/api', generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Pilcrow API running on port ${PORT}`));
