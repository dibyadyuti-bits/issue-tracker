const express = require('express');
const { getAllIssues, getIssue, createIssue, updateIssue, deleteIssue } = require('../controllers/issueController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', getAllIssues);
router.get('/:id', getIssue);
router.post('/', protect, createIssue);
router.put('/:id', protect, updateIssue);
router.delete('/:id', protect, deleteIssue);

module.exports = router;
