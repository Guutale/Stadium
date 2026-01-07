const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        const uris = [
            process.env.MONGO_URI,
            'mongodb://localhost:27017/online_stadium_management'
        ].filter(Boolean); // Remove null/undefined

        // Remove duplicates
        const uniqueUris = [...new Set(uris)];

        for (const uri of uniqueUris) {
            console.log(`\nConnecting to ${uri}...`);
            if (mongoose.connection.readyState !== 0) {
                await mongoose.connection.close();
            }
            await mongoose.connect(uri);
            console.log('MongoDB Connected');

            // Check if user already exists
            let user = await User.findOne({ email: 'a@gmail.com' });

            if (user) {
                console.log('User with email a@gmail.com already exists!');
                console.log('Deleting existing user and creating new one...');
                await User.deleteOne({ email: 'a@gmail.com' });
            }

            // Hash password manually since pre-save hook is disabled
            const salt = await bcrypt.genSalt(10);
            const password = '12345678';
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new admin user
            const newAdmin = new User({
                username: 'Admin',
                email: 'a@gmail.com',
                password: hashedPassword,
                role: 'admin'
            });

            await newAdmin.save();
            console.log(`✅ Admin user created successfully in ${uri}!`);
        }

        console.log('\nAll done.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

createAdmin();
