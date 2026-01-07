const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/online_stadium_management';

const createAdmin = async () => {
    try {
        console.log('Connecting to MongoDB at', MONGO_URI);
        await mongoose.connect(MONGO_URI);
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

        console.log('Done.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

createAdmin();
