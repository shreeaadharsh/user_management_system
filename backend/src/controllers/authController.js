const jwt = require('jsonwebtoken');
const { User, ROLES } = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { AppError } = require('../middleware/errorHandler');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use.', 409));
    }

    const user = await User.create({ name, email, password, role: ROLES.USER });

    const accessToken = generateAccessToken(user);
    const refreshTokenStr = generateRefreshToken(user);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);
    await RefreshToken.create({ token: refreshTokenStr, user: user._id, expiresAt: refreshExpiry });

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      accessToken,
      refreshToken: refreshTokenStr,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    if (user.status === 'inactive') {
      return next(new AppError('Your account has been deactivated. Contact an administrator.', 403));
    }

    const accessToken = generateAccessToken(user);
    const refreshTokenStr = generateRefreshToken(user);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);
    await RefreshToken.create({ token: refreshTokenStr, user: user._id, expiresAt: refreshExpiry });

    res.json({
      success: true,
      message: 'Login successful.',
      accessToken,
      refreshToken: refreshTokenStr,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return next(new AppError('Refresh token required.', 400));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return next(new AppError('Invalid or expired refresh token.', 401));
    }

    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) {
      return next(new AppError('Refresh token not found or already revoked.', 401));
    }

    const user = await User.findById(decoded.id);
    if (!user || user.status === 'inactive') {
      await RefreshToken.deleteOne({ token });
      return next(new AppError('User not found or inactive.', 401));
    }

    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout — revoke refresh token
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await RefreshToken.deleteOne({ token });
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, refreshToken, logout, getMe };
