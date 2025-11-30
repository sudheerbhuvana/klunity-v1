import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Send message
router.post('/:userId', protect, async (req, res) => {
    try {
        const { content } = req.body;
        const receiverId = req.params.userId;
        const senderId = req.user.id;

        if (!content) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Check if receiver follows sender (Mutual or Accepted Request logic)
        // The requirement: "dm can only be sent if follow request is accepted"
        // This implies: Receiver must be following Sender? Or Sender must be following Receiver (accepted)?
        // Usually, "Follow Request Accepted" means Sender follows Receiver.
        // If I follow you (and you accepted), can I DM you? Yes.
        // Let's check if Sender is in Receiver's followers list.

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFollowing = receiver.followers.includes(senderId);
        const isReceiverAdmin = receiver.role === 'admin';
        const isSenderAdmin = req.user.role === 'admin';

        if (!isFollowing && !isReceiverAdmin && !isSenderAdmin) {
            return res.status(403).json({ message: 'You must be following this user to send a message' });
        }

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content
        });

        // Emit real-time message
        if (req.io) {
            req.io.to(receiverId).emit('receive_message', message);
        }

        logger.info('Message', `Message sent from ${senderId} to ${receiverId}`);
        res.status(201).json(message);

    } catch (error) {
        logger.error('Message', 'Error sending message', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get conversation with a user
router.get('/:userId', protect, async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);

    } catch (error) {
        logger.error('Message', 'Error fetching conversation', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get list of conversations (users chatted with)
router.get('/', protect, async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Find all messages involving current user
        const messages = await Message.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        }).sort({ createdAt: -1 });

        // Extract unique user IDs
        const userIds = new Set();
        messages.forEach(msg => {
            const otherId = msg.sender.toString() === currentUserId
                ? msg.receiver.toString()
                : msg.sender.toString();
            userIds.add(otherId);
        });

        // Fetch user details
        const users = await User.find({ _id: { $in: Array.from(userIds) } })
            .select('name username avatar role');

        res.json(users);

    } catch (error) {
        logger.error('Message', 'Error fetching conversations', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
