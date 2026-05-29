const pool = require('../db');
const cloudinary = require('../middleware/cloudinary');
const streamifier = require('streamifier');

// Helper: upload a buffer to Cloudinary and return the secure URL
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// GET /api/posts — all posts, newest first, with author info
async function getAllPosts(_req, res) {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name AS author_name, u.avatar_url AS author_avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('getAllPosts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
}

// GET /api/posts/search?q=keyword — full-text search
async function searchPosts(req, res) {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  try {
    // Use full-text search with a fallback ILIKE for short/single-char terms
    const result = await pool.query(`
      SELECT p.*, u.name AS author_name, u.avatar_url AS author_avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', $1)
         OR p.title ILIKE $2
         OR p.content ILIKE $2
      ORDER BY p.created_at DESC
    `, [q.trim(), `%${q.trim()}%`]);
    res.json(result.rows);
  } catch (err) {
    console.error('searchPosts error:', err);
    res.status(500).json({ error: 'Search failed. Please try again.' });
  }
}

// GET /api/posts/:id — single post with author info
async function getPostById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT p.*, u.name AS author_name, u.avatar_url AS author_avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getPostById error:', err);
    res.status(500).json({ error: 'Failed to fetch post.' });
  }
}

// POST /api/posts — create post (authenticated)
async function createPost(req, res) {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  try {
    let media_url = null;

    if (req.file) {
      media_url = await uploadToCloudinary(req.file.buffer, 'pilcrow/posts');
    }

    const result = await pool.query(
      'INSERT INTO posts (user_id, title, content, media_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, content, media_url]
    );

    const post = result.rows[0];

    // Return post with author info so the frontend can display it immediately
    res.status(201).json({
      ...post,
      author_name: req.user.name,
      author_avatar: req.user.avatar_url
    });
  } catch (err) {
    console.error('createPost error:', err);
    res.status(500).json({ error: 'Failed to create post.' });
  }
}

// PUT /api/posts/:id — edit post (owner only)
async function updatePost(req, res) {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  try {
    const existing = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Enforce ownership on the backend — never trust the frontend alone
    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You can only edit your own posts.' });
    }

    let media_url = existing.rows[0].media_url;
    if (req.file) {
      media_url = await uploadToCloudinary(req.file.buffer, 'pilcrow/posts');
    }

    const result = await pool.query(
      'UPDATE posts SET title = $1, content = $2, media_url = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [title, content, media_url, id]
    );
    res.json({ ...result.rows[0], author_name: req.user.name, author_avatar: req.user.avatar_url });
  } catch (err) {
    console.error('updatePost error:', err);
    res.status(500).json({ error: 'Failed to update post.' });
  }
}

// DELETE /api/posts/:id — delete post (owner only)
async function deletePost(req, res) {
  const { id } = req.params;
  try {
    const existing = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You can only delete your own posts.' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('deletePost error:', err);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
}

// GET /api/posts/:id/comments
async function getComments(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT c.*, u.name AS author_name, u.avatar_url AS author_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('getComments error:', err);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
}

// POST /api/posts/:id/comments
async function addComment(req, res) {
  const { id } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Comment cannot be empty.' });
  try {
    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [id, req.user.id, content.trim()]
    );
    res.status(201).json({ ...result.rows[0], author_name: req.user.name, author_avatar: req.user.avatar_url });
  } catch (err) {
    console.error('addComment error:', err);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
}

// DELETE /api/posts/:id/comments/:commentId
async function deleteComment(req, res) {
  const { commentId } = req.params;
  try {
    const existing = await pool.query('SELECT * FROM comments WHERE id = $1', [commentId]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Comment not found.' });
    if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });
    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    console.error('deleteComment error:', err);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
}

// POST /api/posts/:id/like — toggle like, returns { liked, count }
async function toggleLike(req, res) {
  const { id } = req.params;
  try {
    const existing = await pool.query('SELECT id FROM likes WHERE post_id = $1 AND user_id = $2', [id, req.user.id]);
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [id, req.user.id]);
    } else {
      await pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [id, req.user.id]);
    }
    const countResult = await pool.query('SELECT COUNT(*) FROM likes WHERE post_id = $1', [id]);
    res.json({ liked: existing.rows.length === 0, count: parseInt(countResult.rows[0].count) });
  } catch (err) {
    console.error('toggleLike error:', err);
    res.status(500).json({ error: 'Failed to toggle like.' });
  }
}

// GET /api/posts/:id/likes?userId=N
async function getLikes(req, res) {
  const { id } = req.params;
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM likes WHERE post_id = $1', [id]);
    const count = parseInt(countResult.rows[0].count);
    let liked = false;
    if (req.query.userId) {
      const check = await pool.query('SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2', [id, req.query.userId]);
      liked = check.rows.length > 0;
    }
    res.json({ count, liked });
  } catch (err) {
    console.error('getLikes error:', err);
    res.status(500).json({ error: 'Failed to fetch likes.' });
  }
}

// GET /api/posts/:id/rating?userId=N
async function getRating(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT ROUND(AVG(score)::numeric, 1) AS average, COUNT(*) AS count FROM ratings WHERE post_id = $1',
      [id]
    );
    const { average, count } = result.rows[0];
    let userScore = null;
    if (req.query.userId) {
      const userResult = await pool.query(
        'SELECT score FROM ratings WHERE post_id = $1 AND user_id = $2',
        [id, req.query.userId]
      );
      if (userResult.rows.length > 0) userScore = userResult.rows[0].score;
    }
    res.json({ average: average ? parseFloat(average) : null, count: parseInt(count), userScore });
  } catch (err) {
    console.error('getRating error:', err);
    res.status(500).json({ error: 'Failed to fetch rating.' });
  }
}

// POST /api/posts/:id/rating — upsert a rating (1–5)
async function setRating(req, res) {
  const { id } = req.params;
  const score = parseInt(req.body.score);
  if (!score || score < 1 || score > 5) return res.status(400).json({ error: 'Score must be 1–5.' });
  try {
    await pool.query(
      `INSERT INTO ratings (post_id, user_id, score) VALUES ($1, $2, $3)
       ON CONFLICT (post_id, user_id) DO UPDATE SET score = $3`,
      [id, req.user.id, score]
    );
    const result = await pool.query(
      'SELECT ROUND(AVG(score)::numeric, 1) AS average, COUNT(*) AS count FROM ratings WHERE post_id = $1',
      [id]
    );
    const { average, count } = result.rows[0];
    res.json({ average: parseFloat(average), count: parseInt(count), userScore: score });
  } catch (err) {
    console.error('setRating error:', err);
    res.status(500).json({ error: 'Failed to save rating.' });
  }
}

module.exports = { getAllPosts, searchPosts, getPostById, createPost, updatePost, deletePost, getComments, addComment, deleteComment, toggleLike, getLikes, getRating, setRating };
