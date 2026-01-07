const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

// Simulate the exact login process from authController
const simulateLogin = async (email, password) => {
    console.log(`\n🔐 Attempting login for: ${email}`);
    console.log(`   Password provided: ${password}`);

    // Check user (line 55 in authController.js)
    const user = await User.findOne({ email });
    if (!user) {
        console.log('   ❌ ERROR: User not found in database');
        return { success: false, message: 'Invalid Credentials' };
    }

    console.log(`   ✅ User found: ${user.email}`);
    console.log(`   User role: ${user.role}`);
    console.log(`   User isDeleted: ${user.isDeleted}`);
    console.log(`   Password hash in DB: ${user.password.substring(0, 30)}...`);

    // Check if user is deleted (line 61-63 in authController.js)
    if (user.isDeleted) {
        console.log('   ❌ ERROR: Account has been disabled');
        return { success: false, message: 'Account has been disabled' };
    }

    // Check password (line 66 in authController.js)
    console.log(`   \n   🔍 Comparing passwords...`);
    console.log(`   Plain password: "${password}"`);
    console.log(`   Hashed password: "${user.password}"`);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`   Result: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);

    if (!isMatch) {
        console.log('   ❌ ERROR: Password mismatch');
        return { success: false, message: 'Invalid Credentials' };
    }

    console.log('   ✅ Login successful!');
    return { success: true, user: { id: user.id, username: user.username, role: user.role } };
};

const runTests = async () => {
    try {
        console.log('🧪 SIMULATING ACTUAL LOGIN PROCESS\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_stadium_management');
        console.log('✅ MongoDB Connected\n');

        // Get all users in the database
        const users = await User.find({});
        console.log(`📊 Found ${users.length} users in database:\n`);

        users.forEach((u, i) => {
            console.log(`   ${i + 1}. ${u.email} (${u.role})`);
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🔍 TESTING LOGIN FOR EACH USER\n');

        // Test common passwords for each user
        const commonPasswords = ['12345678', 'password', 'admin123', 'admin', 'test', '123456'];

        for (const user of users) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`Testing user: ${user.email} (${user.role})`);
            console.log('='.repeat(60));

            let found = false;
            for (const pwd of commonPasswords) {
                const result = await simulateLogin(user.email, pwd);
                if (result.success) {
                    console.log(`\n   ✅✅✅ SUCCESSFUL LOGIN with password: "${pwd}"\n`);
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.log(`\n   ⚠️  Could not find the password from common list`);
                console.log(`   If you know the password, please note it down.\n`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('SUMMARY');
        console.log('='.repeat(60));
        console.log('\nAll users in the database:');
        users.forEach((u, i) => {
            console.log(`   ${i + 1}. ${u.email} - ${u.role} - Created: ${u.createdAt}`);
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
};

runTests();
