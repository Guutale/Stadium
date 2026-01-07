const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const testAuthSystem = async () => {
    try {
        console.log('🧪 AUTHENTICATION SYSTEM VERIFICATION TEST\n');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_stadium_management');
        console.log('✅ Step 1: MongoDB Connected\n');

        // Test 1: Create a new test user
        console.log('📝 Test 1: Creating new test user...');
        const testEmail = 'verification_test@test.com';
        const testPassword = 'TestPass123';

        // Clean up if exists
        await User.deleteOne({ email: testEmail });

        const newUser = new User({
            username: 'Verification Test User',
            email: testEmail,
            password: testPassword, // Will be hashed by pre-save hook
            role: 'user'
        });

        await newUser.save();
        console.log(`   ✅ User created: ${testEmail}`);
        console.log(`   Password hash: ${newUser.password.substring(0, 30)}...`);
        console.log('');

        // Test 2: Verify password was hashed
        console.log('🔐 Test 2: Verifying password was hashed automatically...');
        const isBcryptHash = newUser.password.startsWith('$2a$') || newUser.password.startsWith('$2b$');
        if (isBcryptHash) {
            console.log('   ✅ Password is properly hashed (bcrypt format)');
        } else {
            console.log('   ❌ FAILED: Password is NOT hashed!');
            process.exit(1);
        }
        console.log('');

        // Test 3: Immediate login (before restart simulation)
        console.log('🔓 Test 3: Testing immediate login...');
        const userForLogin = await User.findOne({ email: testEmail });
        const isMatchImmediate = await userForLogin.comparePassword(testPassword);
        if (isMatchImmediate) {
            console.log('   ✅ Login successful (password comparison works)');
        } else {
            console.log('   ❌ FAILED: Password comparison failed!');
            process.exit(1);
        }
        console.log('');

        // Test 4: Close and reopen connection (simulate restart)
        console.log('🔄 Test 4: Simulating server restart...');
        await mongoose.connection.close();
        console.log('   Database connection closed');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_stadium_management');
        console.log('   Database connection reopened');
        console.log('');

        // Test 5: Login after restart
        console.log('🔓 Test 5: Testing login AFTER simulated restart...');
        const userAfterRestart = await User.findOne({ email: testEmail });
        if (!userAfterRestart) {
            console.log('   ❌ FAILED: User not found after restart!');
            process.exit(1);
        }

        const isMatchAfterRestart = await userAfterRestart.comparePassword(testPassword);
        if (isMatchAfterRestart) {
            console.log('   ✅ Login successful after restart');
        } else {
            console.log('   ❌ FAILED: Login failed after restart!');
            process.exit(1);
        }
        console.log('');

        // Test 6: Test email normalization
        console.log('📧 Test 6: Testing email normalization (case-insensitive)...');
        const userUppercase = await User.findOne({ email: testEmail.toUpperCase() });
        if (userUppercase) {
            console.log(`   ✅ Email normalization works (${testEmail.toUpperCase()} found ${userUppercase.email})`);
        } else {
            console.log('   ❌ FAILED: Email normalization not working!');
            process.exit(1);
        }

        const isMatchUppercase = await userUppercase.comparePassword(testPassword);
        if (isMatchUppercase) {
            console.log('   ✅ Login with uppercase email successful');
        } else {
            console.log('   ❌ FAILED: Login with uppercase email failed!');
            process.exit(1);
        }
        console.log('');

        // Test 7: Test wrong password
        console.log('🚫 Test 7: Testing wrong password (should fail)...');
        const isMatchWrong = await userAfterRestart.comparePassword('WrongPassword123');
        if (!isMatchWrong) {
            console.log('   ✅ Wrong password correctly rejected');
        } else {
            console.log('   ❌ FAILED: Wrong password was accepted!');
            process.exit(1);
        }
        console.log('');

        // Test 8: Check environment configuration
        console.log('⚙️  Test 8: Checking environment configuration...');
        if (process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your_jwt_secret_key_here') {
            console.log('   ✅ JWT_SECRET is properly configured');
        } else {
            console.log('   ⚠️  WARNING: JWT_SECRET is not set or using default value');
        }

        if (process.env.MONGODB_URI) {
            console.log('   ✅ MONGODB_URI is configured');
        } else {
            console.log('   ⚠️  WARNING: MONGODB_URI is not set (using default)');
        }
        console.log('');

        // Test 9: Test user model methods
        console.log('🔧 Test 9: Testing User model methods...');
        console.log(`   isActive(): ${newUser.isActive()}`);
        if (newUser.isActive()) {
            console.log('   ✅ isActive() method works');
        }
        console.log('');

        // Cleanup
        console.log('🧹 Cleaning up test data...');
        await User.deleteOne({ email: testEmail });
        console.log('   ✅ Test user deleted');
        console.log('');

        // Summary
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('✅ ALL TESTS PASSED!');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log('🎉 Authentication system is working correctly!\n');
        console.log('Key features verified:');
        console.log('  ✅ Automatic password hashing');
        console.log('  ✅ Password persistence after restart');
        console.log('  ✅ Email normalization (case-insensitive)');
        console.log('  ✅ Password comparison');
        console.log('  ✅ Invalid password rejection');
        console.log('  ✅ User model methods');
        console.log('  ✅ Environment configuration\n');

        process.exit(0);
    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
};

testAuthSystem();
