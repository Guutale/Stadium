const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

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

        // Create user
        // Generate username from email since it is required by the model
        const username = email.split('@')[0];

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Create Token
        const payload = {
            user: {
                id: newUser.id,
                role: newUser.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            (err, token) => {
                if (err) {
                    console.error('❌ JWT signing error:', err);
                    return res.status(500).json({ message: 'Token generation failed' });
                }

                res.status(201).json({
                    message: "User registered successfully",
                    token,
                    user: {
                        id: newUser.id,
                        username: newUser.username,
                        email: newUser.email,
                        role: newUser.role
                    }
                });
            }
        );

    } catch (error) {
        console.error("REGISTER ERROR:", error.message);
        const fs = require('fs');
        fs.writeFileSync('error_stack_v2.txt', error.toString() + '\n' + error.stack);
        res.status(500).json({
            message: "Internal Server Error"
        });
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
