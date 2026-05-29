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
  deletePost,
  getComments,
  addComment,
  deleteComment,
  toggleLike,
  getLikes,
  getRating,
  setRating,
} = require('../controllers/postsController');

// Public routes
router.get('/', getAllPosts);
router.get('/search', searchPosts);
router.get('/:id', getPostById);
router.get('/:id/comments', getComments);
router.get('/:id/likes', getLikes);
router.get('/:id/rating', getRating);

// Protected routes — require valid JWT
router.post('/', authenticateToken, postCreationLimiter, upload.single('media'), createPost);
router.put('/:id', authenticateToken, upload.single('media'), updatePost);
router.delete('/:id', authenticateToken, deletePost);
router.post('/:id/comments', authenticateToken, addComment);
router.delete('/:id/comments/:commentId', authenticateToken, deleteComment);
router.post('/:id/like', authenticateToken, toggleLike);
router.post('/:id/rating', authenticateToken, setRating);

module.exports = router;
