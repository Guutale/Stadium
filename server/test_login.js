const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_stadium_management');
        console.log('✅ MongoDB Connected');

        // Find all users
        const users = await User.find({});
        console.log(`\n📊 Total users in database: ${users.length}\n`);

        // Test each user's password
        for (const user of users) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`Testing user: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Password hash: ${user.password}`);
            console.log(`Hash length: ${user.password.length}`);

            // Test with a common password (12345678)
            const testPassword = '12345678';
            const isMatch = await bcrypt.compare(testPassword, user.password);
            console.log(`Testing password "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);

            // Try to verify if it's a valid bcrypt hash
            const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
            console.log(`Is valid bcrypt hash: ${isBcryptHash ? '✅ YES' : '❌ NO'}`);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

testLogin();
