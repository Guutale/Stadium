const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const verifyAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/online_stadium_management');
        console.log('Connected.');

        const email = 'a@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found!');
        } else {
            console.log('✅ User found:');
            console.log('ID:', user._id);
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Password Hash:', user.password);

            const password = '12345678';
            console.log(`Testing password '${password}' against hash...`);
            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Match Result:', isMatch);

            // Also test if the user.comparePassword method works
            try {
                const methodMatch = await user.comparePassword(password);
                console.log('Method Match Result:', methodMatch);
            } catch (e) {
                console.log('Method error:', e.message);
            }
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

verifyAdmin();
