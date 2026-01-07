const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const diagnoseAuth = async () => {
    try {
        console.log('🔬 AUTHENTICATION DIAGNOSTIC TOOL\n');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_stadium_management');
        console.log('✅ Connected to MongoDB\n');

        // Get all users
        const users = await User.find({});
        console.log(`📊 Total users in database: ${users.length}\n`);

        if (users.length === 0) {
            console.log('⚠️  No users found in database!\n');
            process.exit(0);
        }

        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log('DETAILED USER ANALYSIS\n');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const issues = [];
        const validUsers = [];

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            console.log(`\n[${i + 1}] ${user.email}`);
            console.log('─'.repeat(60));
            console.log(`    Username: ${user.username}`);
            console.log(`    Role: ${user.role}`);
            console.log(`    Created: ${user.createdAt}`);
            console.log(`    Is Deleted: ${user.isDeleted ? 'YES ⚠️' : 'NO'}`);
            console.log(`    Password Hash: ${user.password.substring(0, 30)}...`);
            console.log(`    Hash Length: ${user.password.length} characters`);

            // Check if it's a valid bcrypt hash
            const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
            console.log(`    Valid bcrypt format: ${isBcryptHash ? '✅ YES' : '❌ NO'}`);

            if (!isBcryptHash) {
                console.log(`    🚨 ISSUE: Password is NOT properly hashed!`);
                issues.push({
                    email: user.email,
                    issue: 'Invalid password hash format',
                    passwordLength: user.password.length
                });
            } else {
                // Try to verify it's a working bcrypt hash by testing with a dummy password
                try {
                    await bcrypt.compare('test', user.password);
                    console.log(`    Bcrypt verification: ✅ Hash is valid`);
                    validUsers.push(user.email);
                } catch (err) {
                    console.log(`    🚨 ISSUE: Bcrypt hash is corrupted!`);
                    console.log(`    Error: ${err.message}`);
                    issues.push({
                        email: user.email,
                        issue: 'Corrupted bcrypt hash',
                        error: err.message
                    });
                }
            }

            // Check if user is soft-deleted
            if (user.isDeleted) {
                console.log(`    ⚠️  WARNING: User is marked as deleted`);
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('SUMMARY');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log(`✅ Valid users: ${validUsers.length}`);
        validUsers.forEach(email => console.log(`   - ${email}`));

        console.log(`\n🚨 Users with issues: ${issues.length}`);
        if (issues.length > 0) {
            issues.forEach(issue => {
                console.log(`   - ${issue.email}`);
                console.log(`     Issue: ${issue.issue}`);
                if (issue.error) console.log(`     Error: ${issue.error}`);
            });

            console.log('\n⚠️  RECOMMENDED ACTION:');
            console.log('   Run the password fix script to repair these accounts:');
            console.log('   node scripts/fix_user_passwords.js\n');
        } else {
            console.log('   None - all users have valid password hashes!\n');
        }

        console.log('═══════════════════════════════════════════════════════════════\n');

        // Environment check
        console.log('ENVIRONMENT CONFIGURATION CHECK\n');
        console.log('─'.repeat(60));
        console.log(`JWT_SECRET: ${process.env.JWT_SECRET ?
            (process.env.JWT_SECRET === 'your_jwt_secret_key_here' ?
                '⚠️  Using default/weak secret' :
                '✅ Custom secret configured') :
            '❌ NOT SET'}`);
        console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? '✅ SET' : '❌ NOT SET'}`);
        console.log(`PORT: ${process.env.PORT || '5000 (default)'}`);
        console.log('\n');

        if (process.env.JWT_SECRET === 'your_jwt_secret_key_here') {
            console.log('⚠️  WARNING: You are using the default JWT_SECRET.');
            console.log('   This should be changed to a strong, random value.\n');
        }

        console.log('═══════════════════════════════════════════════════════════════\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
};

diagnoseAuth();
