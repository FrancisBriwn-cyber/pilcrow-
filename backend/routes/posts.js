const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { postCreationLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');
const {
  getAllPosts,
  searchPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postsController');

// Public routes
router.get('/', getAllPosts);
router.get('/search', searchPosts);
router.get('/:id', getPostById);

// Protected routes — require valid JWT
router.post('/', authenticateToken, postCreationLimiter, upload.single('media'), createPost);
router.put('/:id', authenticateToken, upload.single('media'), updatePost);
router.delete('/:id', authenticateToken, deletePost);

module.exports = router;
