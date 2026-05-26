const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const SALT_ROUNDS = 10;

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password_hash]
    );

    const user = result.rows[0];
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    // Users who signed up via Google may not have a password
    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account uses Google Sign-In. Please log in with Google.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

// GET /api/auth/google/callback — called after Passport verifies the Google token
function googleCallback(req, res) {
  const token = generateToken(req.user);
  // Redirect to frontend with token in query param; frontend stores it in localStorage
  res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
}

module.exports = { register, login, googleCallback };
