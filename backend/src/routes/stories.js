import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import Story from '../models/Story.js';
import { uploadFile } from '../services/storageService.js';
import { containsBlacklistedWords } from '../utils/blacklistCheck.js';

const router = express.Router();

// Configure multer
// Configure multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'video/mp4', 'video/webm',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' // pptx
        ];

        if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, videos, and documents (PDF, DOC, PPT) are allowed'), false);
        }
    }
});

// @route   GET /api/stories/test
// @desc    Test route
// @access  Public
router.get('/test', (req, res) => {
    res.send('Stories route working');
});

// @route   GET /api/stories
// @desc    Get all stories (with pagination)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const skip = (page - 1) * limit;

        const query = { published: true };
        if (category) query.category = category;
        if (req.query.author) query.author = req.query.author;

        // Search functionality
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { title: searchRegex },
                { content: searchRegex },
                { tags: searchRegex }
            ];
        }

        const stories = await Story.find(query)
            .populate('author', 'name avatar college major username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        if (stories.length > 0) {
            console.log('🔍 [Stories] First story images:', stories[0].images);
        }

        const total = await Story.countDocuments(query);

        res.json({
            success: true,
            stories,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get stories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stories',
            error: error.message
        });
    }
});

// @route   GET /api/stories/:id
// @desc    Get single story
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id)
            .populate('author', 'name avatar college major year username')
            .populate('comments.user', 'name avatar username');

        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        res.json({
            success: true,
            story
        });
    } catch (error) {
        console.error('Get story error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching story',
            error: error.message
        });
    }
});

// @route   POST /api/stories
// @desc    Create new story
// @access  Private
router.post('/', protect, upload.array('images', 10), async (req, res) => {
    console.log('📝 [Story] Create request received');
    console.log('📦 [Story] Body:', req.body);
    console.log('📂 [Story] Files:', req.files ? req.files.length : 0);

    try {
        const { title, content, excerpt, category, tags } = req.body;

        // Check for blacklisted words
        if (await containsBlacklistedWords(title) || await containsBlacklistedWords(content) || await containsBlacklistedWords(excerpt)) {
            return res.status(400).json({
                success: false,
                message: 'Your post contains inappropriate content and cannot be published.'
            });
        }

        // Upload images to R2 if any
        let imageUrls = [];
        let attachments = [];

        if (req.files && req.files.length > 0) {
            console.log('🚀 [Story] Starting image upload to R2...');
            for (const file of req.files) {
                try {
                    const url = await uploadFile(
                        file.buffer,
                        file.originalname,
                        file.mimetype,
                        'stories'
                    );
                    console.log('✅ [Story] Image uploaded:', url);
                    imageUrls.push(url);
                    attachments.push({
                        url,
                        originalName: file.originalname,
                        mimeType: file.mimetype
                    });
                } catch (uploadError) {
                    console.error('❌ [Story] Image upload failed:', uploadError);
                    throw new Error(`Image upload failed: ${uploadError.message}`);
                }
            }
        }

        console.log('💾 [Story] Saving to database...');
        const story = await Story.create({
            title,
            content,
            excerpt,
            category,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            images: imageUrls,
            attachments: attachments,
            author: req.user._id
        });

        console.log('✅ [Story] Story saved:', story._id);

        const populatedStory = await Story.findById(story._id)
            .populate('author', 'name avatar college major username');

        res.status(201).json({
            success: true,
            message: 'Story created successfully',
            story: populatedStory
        });
    } catch (error) {
        console.error('❌ [Story] Create error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating story',
            error: error.message
        });
    }
});

// @route   PUT /api/stories/:id
// @desc    Update story
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        // Check ownership
        if (story.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this story'
            });
        }

        const { title, content, excerpt, category, tags, published } = req.body;

        // Check for blacklisted words
        if (await containsBlacklistedWords(title) || await containsBlacklistedWords(content) || await containsBlacklistedWords(excerpt)) {
            return res.status(400).json({
                success: false,
                message: 'Your post contains inappropriate content and cannot be published.'
            });
        }

        if (title) story.title = title;
        if (content) story.content = content;
        if (excerpt) story.excerpt = excerpt;
        if (category) story.category = category;
        if (tags) story.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        if (published !== undefined) story.published = published;

        await story.save();

        const updatedStory = await Story.findById(story._id)
            .populate('author', 'name avatar college major username');

        res.json({
            success: true,
            message: 'Story updated successfully',
            story: updatedStory
        });
    } catch (error) {
        console.error('Update story error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating story',
            error: error.message
        });
    }
});

// @route   DELETE /api/stories/:id
// @desc    Delete story
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        // Check ownership
        if (story.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this story'
            });
        }

        await story.deleteOne();

        res.json({
            success: true,
            message: 'Story deleted successfully'
        });
    } catch (error) {
        console.error('Delete story error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting story',
            error: error.message
        });
    }
});

// @route   POST /api/stories/:id/react
// @desc    React to a story (heart)
// @access  Private
router.post('/:id/react', protect, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        const userIndex = story.reactions.users.indexOf(req.user._id);

        if (userIndex > -1) {
            // Remove reaction
            story.reactions.users.splice(userIndex, 1);
            story.reactions.hearts -= 1;
        } else {
            // Add reaction
            story.reactions.users.push(req.user._id);
            story.reactions.hearts += 1;
        }

        await story.save();

        res.json({
            success: true,
            message: userIndex > -1 ? 'Reaction removed' : 'Reaction added',
            reactions: story.reactions
        });
    } catch (error) {
        console.error('React to story error:', error);
        res.status(500).json({
            success: false,
            message: 'Error reacting to story',
            error: error.message
        });
    }
});

// @route   POST /api/stories/:id/comment
// @desc    Add comment to story
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
    try {
        const { text, parentId } = req.body;

        // Check for blacklisted words
        if (await containsBlacklistedWords(text)) {
            return res.status(400).json({
                success: false,
                message: 'Your comment contains inappropriate content.'
            });
        }

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        story.comments.push({
            user: req.user._id,
            text,
            parentId: parentId || null
        });

        await story.save();

        const updatedStory = await Story.findById(story._id)
            .populate('comments.user', 'name avatar username');

        res.json({
            success: true,
            message: 'Comment added successfully',
            comments: updatedStory.comments
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
});

export default router;
