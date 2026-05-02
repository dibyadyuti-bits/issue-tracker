const express = require('express');
const { getAllUsers, getUserById, updateUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);

module.exports = router;
