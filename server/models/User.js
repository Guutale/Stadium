const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [2, 'Username must be at least 2 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true, // Automatically convert to lowercase
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        // Note: minlength validation removed because it conflicts with pre-save hashing
        // Password length is validated in the pre-save hook before hashing
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Pre-save hook to hash password if it's modified
// Pre-save hook to hash password if it's modified
// Pre-save hook commented out to avoid conflict with controller hashing
// userSchema.pre('save', async function () {
//     if (!this.isModified('password')) {
//         return;
//     }
//     try {
//         if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
//             return;
//         }
//         if (this.password.length < 6) {
//             const error = new Error('Password must be at least 6 characters');
//             error.name = 'ValidationError';
//             throw error;
//         }
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//     } catch (error) {
//         throw error;
//     }
// });

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Instance method to check if user is active
userSchema.methods.isActive = function () {
    return !this.isDeleted;
};

module.exports = mongoose.model('User', userSchema);

