const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const crypto = require('crypto');
const sendEmail = require('../utils/emailService');

// Register User
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Verification Token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Create user
        const username = email.split('@')[0];

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            verificationToken: crypto
                .createHash('sha256')
                .update(verificationToken)
                .digest('hex'),
            verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        await newUser.save();

        // Create Verification URL
        // Assuming client runs on port 5173 (Vite default)
        const verificationUrl = `http://localhost:5173/verify-email/${verificationToken}`;

        const message = `
            <h1>Email Verification</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}" clicktracking=off>${verificationUrl}</a>
            <p>This link expires in 24 hours.</p>
        `;

        try {
            await sendEmail({
                email: newUser.email,
                subject: 'Online Stadium - Verify your email',
                message
            });

            res.status(201).json({
                success: true,
                message: "Registration successful. Please check your email to verify your account."
            });

        } catch (err) {
            console.error("Email send error:", err);
            // We still register the user, but tell them email failed
            res.status(201).json({
                success: true,
                message: "User registered, but email failed to send. Please contact support."
            });
        }

    } catch (error) {
        console.error("REGISTER ERROR:", error.message);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
    try {
        const verificationToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            verificationToken,
            verificationTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        // Auto login after verification? 
        // Or just return success. Let's return token so they are logged in.

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    success: true,
                    message: 'Email verified successfully!',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            console.log('❌ Login failed: Missing email or password');
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();
        console.log(`🔐 Login attempt for: ${normalizedEmail}`);

        // Check user
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            console.log(`❌ Login failed: User not found - ${normalizedEmail}`);
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        console.log(`   User found: ${user.email} (${user.role})`);

        // Check if user is deleted
        if (user.isDeleted) {
            console.log(`❌ Login failed: Account disabled - ${normalizedEmail}`);
            return res.status(403).json({ message: 'Account has been disabled' });
        }

        // Check password using the model's comparePassword method
        console.log(`   Verifying password...`);
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            console.log(`❌ Login failed: Invalid password - ${normalizedEmail}`);
            require('fs').appendFileSync('login_debug.txt', `[${new Date().toISOString()}] Login failed for ${normalizedEmail}. Match: ${isMatch}. DB: ${mongoose.connection.name}\n`);
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        console.log(`✅ Login successful: ${normalizedEmail}`);
        require('fs').appendFileSync('login_debug.txt', `[${new Date().toISOString()}] Login successful for ${normalizedEmail}. DB: ${mongoose.connection.name}\n`);

        // Return Token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
            if (err) {
                console.error('❌ JWT signing error:', err.message);
                throw err;
            }
            console.log(`🔐 JWT token generated for: ${normalizedEmail}`);
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        });

    } catch (err) {
        console.error('❌ Login error:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        // Only show active users (not soft-deleted)
        const users = await User.find({ isDeleted: { $ne: true } })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete user (Admin only) - Soft Delete
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isDeleted) {
            return res.status(400).json({ message: 'User already deleted' });
        }

        // Soft delete - mark as deleted but keep in database
        user.isDeleted = true;
        user.deletedAt = new Date();
        await user.save();

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Profile (Admin/User)
exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Update Profile Error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};


// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Required fields
        if (!currentPassword || !newPassword || !confirmPassword)
            return res.status(400).json({ message: "All fields are required" });

        // Match check
        if (newPassword !== confirmPassword)
            return res.status(400).json({ message: "New passwords do not match" });

        // Strength check
        if (newPassword.length < 6)
            return res.status(400).json({ message: "Password must be at least 6 characters" });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Verify old password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch)
            return res.status(400).json({ message: "Current password is incorrect" });

        // Prevent same password
        const samePassword = await user.comparePassword(newPassword);
        if (samePassword)
            return res.status(400).json({ message: "New password cannot be same as old password" });

        // Hash new password
        const bcrypt = require("bcryptjs");
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: "Password updated successfully" });

    } catch (err) {
        console.error("Password Change Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

