const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
    body('fullName').trim().isLength({ min: 2, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3, max: 15 }).matches(/^[a-zA-Z0-9_]+$/),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { fullName, email, username, password } = req.body;

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
            fullName,
            email,
            username,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    username: user.username,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
    body('username').notEmpty(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: username.toLowerCase() },
                { username: username }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
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

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    lastLogin: user.lastLogin,
                    profile: user.profile,
                    cart: user.cart
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @desc    Get current user with cart
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    lastLogin: user.lastLogin,
                    profile: user.profile,
                    cart: user.cart,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
    body('fullName').optional().trim().isLength({ min: 2, max: 50 }),
    body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { fullName, email, profile } = req.body;
        const updateFields = {};

        if (fullName) updateFields.fullName = fullName;
        if (email) updateFields.email = email;
        if (profile) updateFields.profile = profile;

        // Check if email already exists (if changing email)
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateFields,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
});

// @desc    Add to cart
// @route   POST /api/auth/cart
// @access  Private
router.post('/cart', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { productId, name, price, quantity, image, category } = req.body;

        await user.addToCart({
            productId,
            name,
            price,
            quantity,
            image,
            category
        });

        // Get updated user
        const updatedUser = await User.findById(req.user.id);

        res.json({
            success: true,
            message: 'Item added to cart',
            data: {
                cart: updatedUser.cart
            }
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding to cart'
        });
    }
});

// @desc    Remove from cart
// @route   DELETE /api/auth/cart/:productId/:category
// @access  Private
router.delete('/cart/:productId/:category', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { productId, category } = req.params;

        await user.removeFromCart(productId, category);

        res.json({
            success: true,
            message: 'Item removed from cart',
            data: {
                cart: user.cart
            }
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error removing from cart'
        });
    }
});

// @desc    Update cart quantity
// @route   PUT /api/auth/cart/:productId/:category
// @access  Private
router.put('/cart/:productId/:category', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { productId, category } = req.params;
        const { quantity } = req.body;

        await user.updateCartQuantity(productId, category, quantity);

        res.json({
            success: true,
            message: 'Cart updated',
            data: {
                cart: user.cart
            }
        });

    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating cart'
        });
    }
});

// @desc    Clear cart
// @route   DELETE /api/auth/cart
// @access  Private
router.delete('/cart', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        await user.clearCart();

        res.json({
            success: true,
            message: 'Cart cleared',
            data: {
                cart: user.cart
            }
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error clearing cart'
        });
    }
});

module.exports = router;