const express = require('express');
const { getAllTeams, getTeam, createTeam, updateTeam, deleteTeam, assignUser, removeUser } = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, getAllTeams);
router.get('/:id', protect, getTeam);
router.post('/', protect, authorize('admin'), createTeam);
router.put('/:id', protect, authorize('admin'), updateTeam);
router.delete('/:id', protect, authorize('admin'), deleteTeam);
router.put('/:id/assign', protect, authorize('admin'), assignUser);
router.put('/:id/remove', protect, authorize('admin'), removeUser);

module.exports = router;
