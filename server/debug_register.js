const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const runDebug = async () => {
    try {
        console.log('--- DEBUG START ---');
        console.log('1. Connecting to MongoDB...');
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/online_stadium_management';
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        console.log('2. Creating Test User...');
        const testUser = new User({
            username: 'DebugUser',
            email: 'debug_user_' + Date.now() + '@example.com',
            password: 'password123'
        });

        console.log('3. Saving User (Testing Pre-save Hook & Bcrypt)...');
        await testUser.save();
        console.log('✅ User Saved Successfully');
        console.log('User ID:', testUser._id);
        console.log('Hashed Password:', testUser.password);

        console.log('4. Cleaning up...');
        await User.deleteOne({ _id: testUser._id });
        console.log('✅ Cleanup Complete');

        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR CAUGHT:');
        console.error(error);
        const errorLog = `Error: ${error.message}\nStack: ${error.stack}\n`;
        require('fs').writeFileSync('error_stack.txt', errorLog);
        process.exit(1);
    }
};

runDebug();
