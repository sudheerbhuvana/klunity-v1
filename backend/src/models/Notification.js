import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: ['follow_request', 'follow_accepted'],
            required: true
        },
        read: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Notification', NotificationSchema);
