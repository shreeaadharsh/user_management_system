const { User, ROLES } = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const crypto = require('crypto');

// @desc    Get all users (paginated, searchable, filterable)
// @route   GET /api/users
// @access  Admin, Manager
const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && ['admin', 'manager', 'user'].includes(role)) {
      query.role = role;
    }

    if (status && ['active', 'inactive'].includes(status)) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Admin, Manager, or own profile
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    // Users can only get their own profile
    if (requestingUser.role === ROLES.USER && requestingUser._id.toString() !== id) {
      return next(new AppError('Access denied. You can only view your own profile.', 403));
    }

    const user = await User.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .select('-password');

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Admin only
const createUser = async (req, res, next) => {
  try {
    const { name, email, role, status, autoGeneratePassword } = req.body;
    let { password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use.', 409));
    }

    if (autoGeneratePassword || !password) {
      password = crypto.randomBytes(8).toString('hex');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || ROLES.USER,
      status: status || 'active',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: user.toJSON(),
      ...(autoGeneratePassword && { generatedPassword: password }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin (all), Manager (non-admin, no role change), User (own name/password only)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;
    const { name, email, password, role, status } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return next(new AppError('User not found.', 404));
    }

    // Role-based permission checks
    if (requestingUser.role === ROLES.USER) {
      // Users can only update own profile
      if (requestingUser._id.toString() !== id) {
        return next(new AppError('Access denied. You can only update your own profile.', 403));
      }
      // Users cannot change role or status
      if (role || status) {
        return next(new AppError('You cannot change your own role or status.', 403));
      }
    }

    if (requestingUser.role === ROLES.MANAGER) {
      // Managers cannot update admins
      if (targetUser.role === ROLES.ADMIN) {
        return next(new AppError('Access denied. Managers cannot modify admin accounts.', 403));
      }
      // Managers cannot change roles
      if (role) {
        return next(new AppError('Managers cannot change user roles.', 403));
      }
    }

    // Build update object
    const updates = { updatedBy: requestingUser._id };
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined && requestingUser.role === ROLES.ADMIN) updates.role = role;
    if (status !== undefined && requestingUser.role === ROLES.ADMIN) updates.status = status;

    // Handle password update separately (needs hashing via pre-save)
    if (password) {
      targetUser.password = password;
      Object.assign(targetUser, updates);
      await targetUser.save();
    } else {
      await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    }

    const updatedUser = await User.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .select('-password');

    res.json({ success: true, message: 'User updated successfully.', data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate / soft delete user
// @route   DELETE /api/users/:id
// @access  Admin only
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    if (requestingUser._id.toString() === id) {
      return next(new AppError('You cannot deactivate your own account.', 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    // Soft delete — deactivate
    user.status = 'inactive';
    user.updatedBy = requestingUser._id;
    await user.save();

    res.json({ success: true, message: 'User deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/users/stats
// @access  Admin, Manager
const getUserStats = async (req, res, next) => {
  try {
    const [total, active, inactive, adminCount, managerCount, userCount, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'inactive' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'manager' }),
      User.countDocuments({ role: 'user' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role status createdAt'),
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive,
        byRole: { admin: adminCount, manager: managerCount, user: userCount },
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser, getUserStats };
