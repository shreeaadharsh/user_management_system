const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createUserValidation, updateUserValidation } = require('../middleware/validators');

// Stats route — admin and manager
router.get('/stats', authenticate, authorize('admin', 'manager'), getUserStats);

// List users — admin and manager
router.get('/', authenticate, authorize('admin', 'manager'), getUsers);

// Create user — admin only
router.post('/', authenticate, authorize('admin'), createUserValidation, validate, createUser);

// Get single user — admin, manager, or own profile (checked in controller)
router.get('/:id', authenticate, getUser);

// Update user — all roles (RBAC logic in controller)
router.put('/:id', authenticate, updateUserValidation, validate, updateUser);

// Delete/deactivate user — admin only
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;
