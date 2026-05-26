const express = require('express');
const passport = require('passport');
const router = express.Router();
const { register, login, googleCallback } = require('../controllers/authController');
const { registerLimiter, loginLimiter } = require('../middleware/rateLimiter');

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);

// Redirect user to Google's OAuth consent screen
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Google redirects back here after user grants permission
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  googleCallback
);

module.exports = router;
