const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  toggleBlockUser,
  getLeaderboard,
  sendUserMessage
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/leaderboard', getLeaderboard);
router.get('/', protect, adminOnly, getUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id/block', protect, adminOnly, toggleBlockUser);
router.post('/:id/message', protect, adminOnly, sendUserMessage);

module.exports = router;
