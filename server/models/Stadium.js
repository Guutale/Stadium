const mongoose = require('mongoose');

const stadiumSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }], // Array of image URLs
    status: { type: String, enum: ['active', 'maintenance'], default: 'active' },
    vipPrice: { type: Number, required: true }, // Default VIP price
    regularPrice: { type: Number, required: true }, // Default regular price
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stadium', stadiumSchema);
