import jwt from 'jsonwebtoken';
import User from '../model/userSchema.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register user
// @route   POST /api/users/signup
// @access  Public
export const userSignUp = asyncHandler(async (req, res) => {
    const { firstname, lastname, username, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email or username'
        });
    }

    // Create user
    const user = await User.create({
        firstname,
        lastname,
        username,
        email,
        password,
        phone
    });

    // Generate token
    const token = generateToken(user._id);

    // Send welcome email
    await sendWelcomeEmail(user);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user,
            token
        }
    });
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const userLogIn = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ 
        $or: [{ username }, { email: username }] 
    }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check if user is active
    if (!user.isActive) {
        return res.status(401).json({
            success: false,
            message: 'Account is deactivated'
        });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user,
            token
        }
    });
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    res.json({
        success: true,
        data: user
    });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    const { firstname, lastname, phone, profile } = req.body;
    
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { 
            firstname, 
            lastname, 
            phone, 
            profile: { ...req.user.profile, ...profile }
        },
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
    });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
        return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found with this email'
        });
    }

    // Generate reset token (in a real app, you'd store this in database with expiry)
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    // Send reset email
    await sendPasswordResetEmail(user, resetToken);

    res.json({
        success: true,
        message: 'Password reset email sent'
    });
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
        success: true,
        data: users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    res.json({
        success: true,
        message: 'User deleted successfully'
    });
});



