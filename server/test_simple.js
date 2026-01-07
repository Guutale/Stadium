const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const simpleTest = async () => {
    try {
        console.log('Simple test to create a user\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_stadium_management');
        console.log('Connected to MongoDB\n');

        // Delete test user if exists
        await User.deleteOne({ email: 'simple@test.com' });

        console.log('Creating user...');
        const user = new User({
            username: 'Test',
            email: 'simple@test.com',
            password: 'TestPass123',
            role: 'user'
        });

        console.log('Saving user...');
        await user.save();

        console.log('✅ User created successfully!');
        console.log('Password hash:', user.password.substring(0, 30));

        await User.deleteOne({ email: 'simple@test.com' });

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.log('\nError name:', err.name);
        console.log('Error stack:', err.stack);
        if (err.errors) {
            console.log('\nValidation errors:');
            for (const field in err.errors) {
                console.log(`  ${field}: ${err.errors[field].message}`);
            }
        }
        process.exit(1);
    }
};

simpleTest();
