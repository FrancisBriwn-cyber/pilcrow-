
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const { generalLimiter } = require('./middleware/rateLimiter');

// Load Passport Google strategy
require('./middleware/passport');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://pilcrow-eta.vercel.app',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

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
