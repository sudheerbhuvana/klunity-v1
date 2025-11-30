import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import { uploadFile } from '../services/storageService.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { username, name, college, major, year, bio, linkedin, github, portfolio, twitter } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ username });
            if (usernameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }
            user.username = username;
        }
        if (name) user.name = name;
        if (college !== undefined) user.college = college;
        if (major !== undefined) user.major = major;
        if (year !== undefined) user.year = year;
        if (bio !== undefined) user.bio = bio;
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (github !== undefined) user.github = github;
        if (portfolio !== undefined) user.portfolio = portfolio;
        if (twitter !== undefined) user.twitter = twitter;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                college: user.college,
                major: user.major,
                year: user.year,
                bio: user.bio,
                avatar: user.avatar,
                linkedin: user.linkedin,
                github: user.github,
                portfolio: user.portfolio,
                twitter: user.twitter
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
});

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        // Upload to R2
        const avatarUrl = await uploadFile(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            'avatars'
        );

        // Update user avatar
        const user = await User.findById(req.user._id);
        user.avatar = avatarUrl;
        await user.save();

        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            avatarUrl
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading avatar',
            error: error.message
        });
    }
});

// @route   GET /api/users/id/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/id/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name username avatar college major bio role');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// @route   GET /api/users/:username
// @desc    Get public user profile
// @access  Public
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpire -email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// @route   GET /api/users/search/query
// @desc    Search users
// @access  Public
router.get('/search/query', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json({ success: true, users: [] });
        }

        const searchRegex = new RegExp(q, 'i');
        const users = await User.find({
            $or: [
                { name: searchRegex },
                { username: searchRegex },
                { college: searchRegex },
                { major: searchRegex }
            ]
        })
            .select('name username avatar college major bio')
            .limit(20);

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching users',
            error: error.message
        });
    }
});

export default router;
