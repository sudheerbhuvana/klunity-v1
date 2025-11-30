import './src/config/env.js';
import { connectDB } from './src/config/database.js';
import User from './src/models/User.js';

const checkUser = async () => {
    await connectDB();

    const email = '2400080210@kluniversity.in';
    const user = await User.findOne({ email }).select('+password');

    if (user) {
        console.log('User found:', {
            id: user._id,
            email: user.email,
            username: user.username,
            isEmailVerified: user.isEmailVerified,
            isVerified: user.isVerified,
            role: user.role,
            hasPassword: !!user.password
        });
    } else {
        console.log('User NOT found with email:', email);
    }

    process.exit();
};

checkUser();
