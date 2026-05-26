const rateLimit = require('express-rate-limit');

// General limiter for all API routes not covered by specific limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — slow down! Try again in 15 minutes.' }
});

// Stricter limit for registration to prevent account spam
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many registration attempts. Please wait an hour before trying again.' }
});

// Stricter limit for login to slow brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Please wait 15 minutes before trying again.' }
});

// Per-user limit for post creation (keyed by JWT user ID, not IP)
const postCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'You have created too many posts. Please wait before posting again.' }
});

module.exports = { generalLimiter, registerLimiter, loginLimiter, postCreationLimiter };
