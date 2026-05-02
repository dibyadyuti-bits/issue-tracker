const express = require('express');
const { getCommentsByIssue, addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/issue/:issueId', getCommentsByIssue);
router.post('/issue/:issueId', protect, addComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
