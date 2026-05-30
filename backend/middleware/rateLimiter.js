const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many requests — slow down! Try again in 15 minutes.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many registration attempts. Please wait an hour before trying again.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many login attempts. Please wait 15 minutes before trying again.' }
});

const postCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip,
  validate: { xForwardedForHeader: false },
  message: { error: 'You have created too many posts. Please wait before posting again.' }
});

module.exports = { generalLimiter, registerLimiter, loginLimiter, postCreationLimiter };
