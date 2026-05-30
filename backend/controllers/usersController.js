const pool = require('../db');

// GET /api/users/:id — public profile + posts + follow counts
async function getUserProfile(req, res) {
  const { id } = req.params;
  const viewerId = req.query.viewerId ? parseInt(req.query.viewerId) : null;
  try {
    const userResult = await pool.query(
      'SELECT id, name, email, avatar_url, bio, created_at FROM users WHERE id = $1',
      [id]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const postsResult = await pool.query(
      'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC',
      [id]
    );

    const followersResult = await pool.query(
      'SELECT COUNT(*) FROM follows WHERE following_id = $1', [id]
    );
    const followingResult = await pool.query(
      'SELECT COUNT(*) FROM follows WHERE follower_id = $1', [id]
    );

    let isFollowing = false;
    if (viewerId) {
      const check = await pool.query(
        'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
        [viewerId, id]
      );
      isFollowing = check.rows.length > 0;
    }

    res.json({
      user: {
        ...userResult.rows[0],
        followers: parseInt(followersResult.rows[0].count),
        following: parseInt(followingResult.rows[0].count),
        isFollowing,
      },
      posts: postsResult.rows
    });
  } catch (err) {
    console.error('getUserProfile error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
}

// PUT /api/users/:id/bio — update bio (owner only)
async function updateBio(req, res) {
  const { id } = req.params;
  const { bio } = req.body;
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Forbidden.' });
  }
  try {
    await pool.query('UPDATE users SET bio = $1 WHERE id = $2', [bio || null, id]);
    res.json({ bio: bio || null });
  } catch (err) {
    console.error('updateBio error:', err);
    res.status(500).json({ error: 'Failed to update bio.' });
  }
}

// POST /api/users/:id/follow — toggle follow
async function toggleFollow(req, res) {
  const followingId = parseInt(req.params.id);
  const followerId = req.user.id;

  if (followerId === followingId) {
    return res.status(400).json({ error: 'You cannot follow yourself.' });
  }

  try {
    const existing = await pool.query(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );
      const count = await pool.query('SELECT COUNT(*) FROM follows WHERE following_id = $1', [followingId]);
      return res.json({ following: false, followers: parseInt(count.rows[0].count) });
    } else {
      await pool.query(
        'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
        [followerId, followingId]
      );
      const count = await pool.query('SELECT COUNT(*) FROM follows WHERE following_id = $1', [followingId]);
      return res.json({ following: true, followers: parseInt(count.rows[0].count) });
    }
  } catch (err) {
    console.error('toggleFollow error:', err);
    res.status(500).json({ error: 'Failed to update follow.' });
  }
}

module.exports = { getUserProfile, updateBio, toggleFollow };
