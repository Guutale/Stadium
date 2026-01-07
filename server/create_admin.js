const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

console.log('Starting script...');
console.log('MONGO_URI present:', !!process.env.MONGO_URI);

const createAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI); // Simplified options for mongoose 6+
        console.log('MongoDB Connected');

        const email = 'c@gmail.com';
        const password = '1234567';
        const hashedPassword = await bcrypt.hash(password, 10);

        let user = await User.findOne({ email });

        if (user) {
            console.log('User found, updating...');
            user.password = hashedPassword;
            user.role = 'admin';
            user.username = 'Admin User';
            await user.save();
            console.log('User updated to Admin');
        } else {
            console.log('User not found, creating...');
            user = new User({
                username: 'Admin User',
                email,
                password: hashedPassword,
                role: 'admin'
            });
            await user.save();
            console.log('Admin user created');
        }

        console.log('Done, closing connection.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error occurred:', err);
        process.exit(1);
    }
};

createAdmin();
