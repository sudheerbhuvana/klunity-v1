import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'sudheerbhuvana25@gmail.com';
        const adminData = {
            username: 'Sudhi250806',
            name: 'Sudheer Bhuvana',
            email: adminEmail,
            password: '@Sudhi250806',
            role: 'admin',
            department: 'Administration',
            college: 'Koneru Lakshmaiah Education Foundation (KLEF)',
            isVerified: true,
            isEmailVerified: true
        };

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists');
            // Update password just in case
            existingAdmin.password = adminData.password;
            existingAdmin.role = 'admin';
            existingAdmin.isVerified = true;
            existingAdmin.isEmailVerified = true;
            await existingAdmin.save();
            console.log('Admin user updated');
        } else {
            await User.create(adminData);
            console.log('Admin user created');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
