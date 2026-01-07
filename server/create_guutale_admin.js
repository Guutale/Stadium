const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createGuutaleAdmin = async () => {
    try {
        // Connect to the database specified in .env
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/authdb';

        console.log(`\nConnecting to ${uri}...`);
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected Successfully');

        // Delete ALL existing admin accounts (including soft-deleted ones)
        console.log('\n🗑️  Deleting all existing admin accounts...');
        const deleteResult = await User.deleteMany({ role: 'admin' });
        console.log(`   Deleted ${deleteResult.deletedCount} admin account(s)`);

        // Also delete any old admin emails that might exist
        const oldEmails = ['a@gmail.com', 'admin@gmail.com', 'guutale@gmail.com'];
        for (const email of oldEmails) {
            const result = await User.deleteMany({ email: email });
            if (result.deletedCount > 0) {
                console.log(`   Deleted ${result.deletedCount} user(s) with email: ${email}`);
            }
        }

        // Hash the new password
        const password = '123456';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin user with specified credentials
        const newAdmin = new User({
            username: 'Guutale Admin',
            email: 'guutale@gmail.com',
            password: hashedPassword,
            role: 'admin',
            isDeleted: false
        });

        await newAdmin.save();
        console.log('\n✅ NEW ADMIN CREATED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    guutale@gmail.com');
        console.log('🔑 Password: 123456');
        console.log('👤 Role:     admin');
        console.log('🗄️  Database: ' + uri);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Verify the admin was created
        const verifyAdmin = await User.findOne({ email: 'guutale@gmail.com' });
        if (verifyAdmin) {
            console.log('\n✅ Verification: Admin account exists in database');
            console.log(`   Username: ${verifyAdmin.username}`);
            console.log(`   Email: ${verifyAdmin.email}`);
            console.log(`   Role: ${verifyAdmin.role}`);
            console.log(`   Active: ${!verifyAdmin.isDeleted}`);
        }

        console.log('\n✅ All done! You can now login with the new credentials.');
        console.log('⚠️  Please restart your backend server for changes to take effect.');

        process.exit(0);
    } catch (err) {
        console.error('\n❌ Error:', err.message);
        console.error(err);
        process.exit(1);
    }
};

createGuutaleAdmin();
