const express = require('express');
const https = require('https');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { registerLimiter, loginLimiter } = require('../middleware/rateLimiter');
const pool = require('../db');

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);

// Redirect user to Google's OAuth consent screen
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Manual OAuth callback — bypasses passport state verification entirely
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  console.log('[OAuth callback] code present:', !!code, 'error:', error);

  if (error || !code) {
    return res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }

  try {
    // Step 1: Exchange code for access token
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'https://pilcrow.onrender.com/api/auth/google/callback';
    console.log('[OAuth] Using redirect_uri:', callbackUrl);

    const tokenData = await post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    });

    if (!tokenData.access_token) {
      console.error('[OAuth] Token exchange failed:', tokenData);
      return res.redirect(`${clientUrl}/login?error=oauth_failed`);
    }

    // Step 2: Get Google user info
    const profile = await get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      tokenData.access_token
    );

    if (!profile.email) {
      console.error('[OAuth] No email in profile:', profile);
      return res.redirect(`${clientUrl}/login?error=oauth_failed`);
    }

    // Step 3: Find or create user
    let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.sub]);

    if (result.rows.length === 0) {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [profile.email]);
      if (result.rows.length > 0) {
        await pool.query(
          'UPDATE users SET google_id = $1, avatar_url = $2 WHERE email = $3',
          [profile.sub, profile.picture || null, profile.email]
        );
        result = await pool.query('SELECT * FROM users WHERE email = $1', [profile.email]);
      } else {
        result = await pool.query(
          'INSERT INTO users (name, email, google_id, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
          [profile.name, profile.email, profile.sub, profile.picture || null]
        );
      }
    }

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`${clientUrl}/oauth-callback?token=${token}`);
  } catch (err) {
    console.error('[OAuth] Error:', err.message);
    res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }
});

// Helper: POST JSON and return parsed response
function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = https.request(url, options, (response) => {
      let raw = '';
      response.on('data', chunk => { raw += chunk; });
      response.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error('Invalid JSON')); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Helper: GET with Bearer token
function get(url, accessToken) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Authorization: `Bearer ${accessToken}` } }, (response) => {
      let raw = '';
      response.on('data', chunk => { raw += chunk; });
      response.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error('Invalid JSON')); } });
    }).on('error', reject);
  });
}

module.exports = router;
