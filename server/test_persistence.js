const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const comprehensiveTest = async () => {
    try {
        console.log('🔬 COMPREHENSIVE AUTHENTICATION PERSISTENCE TEST\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Step 1: Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_stadium_management');
        console.log('✅ Step 1: MongoDB Connected\n');

        // Step 2: Check current users in database
        const existingUsers = await User.find({});
        console.log(`📊 Step 2: Current users in database: ${existingUsers.length}`);
        existingUsers.forEach(u => {
            console.log(`   - ${u.email} (${u.role}) - Hash: ${u.password.substring(0, 20)}...`);
        });
        console.log('');

        // Step 3: Create a test user (simulating registration)
        const testEmail = 'test_persistence@test.com';
        const testPassword = 'TestPass123';

        // Remove if exists
        await User.deleteOne({ email: testEmail });

        console.log('🔐 Step 3: Creating test user (simulating registration)');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testPassword, salt);

        const testUser = new User({
            username: 'Test User',
            email: testEmail,
            password: hashedPassword,
            role: 'user'
        });

        await testUser.save();
        console.log(`   ✅ User created: ${testEmail}`);
        console.log(`   Password (plain): ${testPassword}`);
        console.log(`   Password (hashed): ${hashedPassword}`);
        console.log('');

        // Step 4: Immediate login test (simulating what happens right after registration)
        console.log('🔓 Step 4: Testing immediate login (before restart)');
        const userBeforeRestart = await User.findOne({ email: testEmail });
        if (!userBeforeRestart) {
            console.log('   ❌ ERROR: User not found in database!');
            process.exit(1);
        }

        const isMatchBefore = await bcrypt.compare(testPassword, userBeforeRestart.password);
        console.log(`   Testing password: ${isMatchBefore ? '✅ MATCH' : '❌ NO MATCH'}`);
        console.log('');

        // Step 5: Disconnect and reconnect (simulating restart)
        console.log('🔄 Step 5: Simulating server restart...');
        await mongoose.connection.close();
        console.log('   Database connection closed');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_stadium_management');
        console.log('   Database connection reopened');
        console.log('');

        // Step 6: Login test after restart
        console.log('🔓 Step 6: Testing login AFTER simulated restart');
        const userAfterRestart = await User.findOne({ email: testEmail });
        if (!userAfterRestart) {
            console.log('   ❌ ERROR: User not found in database after restart!');
            console.log('   🚨 ROOT CAUSE: User data not persisted!');
            process.exit(1);
        }

        console.log(`   User found: ${userAfterRestart.email}`);
        console.log(`   Password hash: ${userAfterRestart.password.substring(0, 20)}...`);

        const isMatchAfter = await bcrypt.compare(testPassword, userAfterRestart.password);
        console.log(`   Testing password: ${isMatchAfter ? '✅ MATCH' : '❌ NO MATCH'}`);

        if (!isMatchAfter) {
            console.log('\n   🚨 ROOT CAUSE IDENTIFIED: Password comparison failed after restart!');
            console.log('   Comparing hashes:');
            console.log(`   Before: ${hashedPassword}`);
            console.log(`   After:  ${userAfterRestart.password}`);
            console.log(`   Match:  ${hashedPassword === userAfterRestart.password}`);
        }
        console.log('');

        // Step 7: Test with existing users
        console.log('🔍 Step 7: Testing all existing users in database');
        const allUsers = await User.find({});
        for (const user of allUsers) {
            console.log(`\n   Testing: ${user.email} (${user.role})`);
            console.log(`   Hash type: ${user.password.substring(0, 4)}`);
            console.log(`   Hash length: ${user.password.length}`);

            // Try common passwords
            const commonPasswords = ['12345678', 'password', 'admin', 'test'];
            for (const pwd of commonPasswords) {
                const isMatch = await bcrypt.compare(pwd, user.password);
                if (isMatch) {
                    console.log(`   ✅ Password found: "${pwd}"`);
                    break;
                }
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('✅ TEST COMPLETED - Check results above\n');

        // Cleanup
        await User.deleteOne({ email: testEmail });

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
};

comprehensiveTest();
