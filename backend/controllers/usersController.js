const pool = require('../db');

// GET /api/users/:id — public user profile + their posts
async function getUserProfile(req, res) {
  const { id } = req.params;
  try {
    const userResult = await pool.query(
      'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const postsResult = await pool.query(
      'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      user: userResult.rows[0],
      posts: postsResult.rows
    });
  } catch (err) {
    console.error('getUserProfile error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}

module.exports = { getUserProfile };
