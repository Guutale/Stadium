const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const verifyLatest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const user = await User.findOne().sort({ createdAt: -1 });

        if (!user) {
            console.log("No users found.");
        } else {
            user.isVerified = true;
            user.verificationToken = undefined;
            user.verificationTokenExpire = undefined;
            await user.save();
            console.log(`Verified user: ${user.email} (${user._id})`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyLatest();
