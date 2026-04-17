const { body } = require('express-validator');

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').custom((value, { req }) => {
    if (req.body.autoGeneratePassword) return true;
    if (!value || value.length < 6) throw new Error('Password must be at least 6 characters');
    return true;
  }),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Role must be admin, manager, or user'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
];

exports.updateUserValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
];
