const express = require('express');
const router = express.Router();
const { getUserProfile, updateBio, toggleFollow } = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/auth');

router.get('/:id', getUserProfile);
router.put('/:id/bio', authenticateToken, updateBio);
router.post('/:id/follow', authenticateToken, toggleFollow);

module.exports = router;
