import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail, sendOTPEmail } from '../services/emailService.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, name, email, password, college, major, year, linkedin, github, portfolio, twitter, role, department } = req.body;

        // Check if user exists
        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        });
        if (userExists) {
            if (userExists.email === email && userExists.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            }
            if (userExists.username === username) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }

            // If user exists but not verified, update OTP and resend
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

            userExists.name = name;
            userExists.username = username;
            userExists.password = password; // Will be hashed by pre-save hook
            userExists.otp = otp;
            userExists.otpExpires = otpExpires;
            userExists.role = role || 'student';
            userExists.department = department;
            // Faculty needs verification, Student is auto-verified (if email verified)
            userExists.isVerified = role === 'faculty' ? false : true;

            await userExists.save();

            try {
                await sendOTPEmail(email, otp, name);
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }

            return res.status(200).json({
                success: true,
                message: 'Registration updated. Please check your email for the OTP.',
                token: generateToken(userExists._id),
                user: {
                    id: userExists._id,
                    name: userExists.name,
                    email: userExists.email,
                    college: userExists.college,
                    major: userExists.major,
                    year: userExists.year,
                    isEmailVerified: userExists.isEmailVerified,
                    role: userExists.role,
                    isVerified: userExists.isVerified
                }
            });
        }
        // Create new user
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        const user = await User.create({
            username,
            name,
            email,
            password,
            college,
            major,
            year,
            otp,
            otpExpires,
            linkedin,
            github,
            portfolio,
            twitter,
            role: role || 'student',
            department,
            isVerified: role === 'faculty' ? false : true
        });

        try {
            await sendOTPEmail(email, otp, name);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for the OTP.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                college: user.college,
                major: user.major,
                year: user.year,
                isEmailVerified: user.isEmailVerified,
                linkedin: user.linkedin,
                github: user.github,
                portfolio: user.portfolio,
                twitter: user.twitter
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check verification status
        if (!user.isEmailVerified) {
            // Generate new OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();

            try {
                await sendOTPEmail(user.email, otp, user.name);
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }

            return res.status(403).json({
                success: false,
                message: 'Email not verified. A new verification code has been sent to your email.',
                requiresVerification: true,
                email: user.email
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending approval by an administrator.'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                college: user.college,
                major: user.major,
                year: user.year,
                avatar: user.avatar,
                isEmailVerified: user.isEmailVerified,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
});

// @route   POST /api/auth/verify-email
// @desc    Verify user email with OTP
// @access  Public
router.post('/verify-email', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        const user = await User.findOne({ email }).select('+otp +otpExpires');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired'
            });
        }

        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying email',
            error: error.message
        });
    }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
// @access  Public
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, user.name);
            res.json({
                success: true,
                message: 'OTP sent successfully'
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            res.status(500).json({
                success: false,
                message: 'Error sending OTP email'
            });
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resending OTP',
            error: error.message
        });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email'
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, user.name);

            res.json({
                success: true,
                message: 'Password reset OTP sent to your email'
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            res.status(500).json({
                success: false,
                message: 'Error sending password reset email'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing password reset request',
            error: error.message
        });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, OTP, and new password'
            });
        }

        const user = await User.findOne({ email }).select('+otp +otpExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired'
            });
        }

        // Set new password
        user.password = password;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
});

export default router;
