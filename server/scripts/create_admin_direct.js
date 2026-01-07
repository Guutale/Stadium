const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'cb@gmail.com';
        const password = '123456';
        const username = 'admin_cb';

        // Check if exists
        const existing = await User.findOne({ email });
        if (existing) {
            console.log('User already exists, updating password and role...');
            const salt = await bcrypt.genSalt(10);
            existing.password = await bcrypt.hash(password, salt);
            existing.role = 'admin';
            existing.username = username;
            // Ensure no conflict with pre-save if I re-enable it later, but currently disabled
            await existing.save();
            console.log('Admin user updated successfully');
        } else {
            console.log('Creating new admin user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                role: 'admin'
            });

            await newUser.save();
            console.log('Admin user created successfully');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
