const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const readline = require('readline');
const User = require('../models/User');

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const fixUserPasswords = async () => {
    try {
        console.log('🔧 USER PASSWORD FIX TOOL\n');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log('⚠️  WARNING: This script will modify user passwords in the database.');
        console.log('   Make sure you have a backup before proceeding!\n');

        const proceed = await question('Do you want to continue? (yes/no): ');
        if (proceed.toLowerCase() !== 'yes') {
            console.log('\n❌ Operation cancelled.\n');
            rl.close();
            process.exit(0);
        }

        console.log('\n');

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_stadium_management');
        console.log('✅ Connected to MongoDB\n');

        // Get all users
        const users = await User.find({});
        console.log(`📊 Found ${users.length} users\n`);

        const problematicUsers = [];

        // Identify problematic users
        for (const user of users) {
            const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

            if (!isBcryptHash) {
                problematicUsers.push(user);
                console.log(`🚨 Found user with invalid hash: ${user.email}`);
            } else {
                try {
                    await bcrypt.compare('test', user.password);
                } catch (err) {
                    problematicUsers.push(user);
                    console.log(`🚨 Found user with corrupted hash: ${user.email}`);
                }
            }
        }

        console.log('\n');

        if (problematicUsers.length === 0) {
            console.log('✅ All users have valid password hashes!\n');
            console.log('   No fixes needed.\n');
            rl.close();
            process.exit(0);
        }

        console.log(`Found ${problematicUsers.length} users with password issues:\n`);
        problematicUsers.forEach((u, i) => {
            console.log(`   ${i + 1}. ${u.email} (${u.role})`);
        });

        console.log('\n═══════════════════════════════════════════════════════════════\n');
        console.log('FIX OPTIONS:\n');
        console.log('1. Reset passwords to a temporary password (recommended)');
        console.log('2. Try to re-hash existing passwords (assumes current password is plain-text)');
        console.log('3. Cancel operation\n');

        const choice = await question('Select option (1/2/3): ');

        if (choice === '3') {
            console.log('\n❌ Operation cancelled.\n');
            rl.close();
            process.exit(0);
        }

        console.log('\n');

        if (choice === '1') {
            // Option 1: Reset to temporary password
            const tempPassword = await question('Enter temporary password for all affected users: ');

            if (!tempPassword || tempPassword.length < 6) {
                console.log('\n❌ Password must be at least 6 characters.\n');
                rl.close();
                process.exit(1);
            }

            console.log('\n🔐 Hashing password...\n');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(tempPassword, salt);

            let fixed = 0;
            for (const user of problematicUsers) {
                user.password = hashedPassword;
                await user.save();
                console.log(`   ✅ Fixed: ${user.email}`);
                fixed++;
            }

            console.log(`\n✅ Successfully fixed ${fixed} users!\n`);
            console.log(`   Temporary password: ${tempPassword}`);
            console.log(`   Users should change their passwords after logging in.\n`);

        } else if (choice === '2') {
            // Option 2: Re-hash existing passwords
            console.log('⚠️  WARNING: This assumes the current passwords are stored as plain-text.\n');
            const confirm = await question('Are you sure? (yes/no): ');

            if (confirm.toLowerCase() !== 'yes') {
                console.log('\n❌ Operation cancelled.\n');
                rl.close();
                process.exit(0);
            }

            console.log('\n🔐 Re-hashing passwords...\n');

            let fixed = 0;
            for (const user of problematicUsers) {
                const plainPassword = user.password; // Assuming it's plain-text
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(plainPassword, salt);

                user.password = hashedPassword;
                await user.save();
                console.log(`   ✅ Fixed: ${user.email}`);
                fixed++;
            }

            console.log(`\n✅ Successfully fixed ${fixed} users!\n`);
        } else {
            console.log('\n❌ Invalid option.\n');
        }

        console.log('═══════════════════════════════════════════════════════════════\n');

        rl.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error(err.stack);
        rl.close();
        process.exit(1);
    }
};

fixUserPasswords();
