const mongoose = require('mongoose');

const stadiumSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    vipCapacity: { type: Number, required: true, default: 0 },
    regularCapacity: { type: Number, required: true, default: 0 },
    description: { type: String },
    images: [{ type: String }], // Array of image URLs
    status: { type: String, enum: ['active', 'maintenance'], default: 'active' },
    vipPrice: { type: Number }, // Default VIP price (optional)
    regularPrice: { type: Number }, // Default regular price (optional)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stadium', stadiumSchema);
