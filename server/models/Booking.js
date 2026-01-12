const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    seats: [{ type: String }], // Array of seat IDs/numbers e.g. ["A1", "A2"]
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    bookingStatus: { type: String, enum: ['active', 'cancelled', 'rescheduled', 'refunded'], default: 'active' },
    originalMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' }, // Reference to original match if rescheduled
    rescheduledTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' }, // Reference to new match if rescheduled
    stripePaymentIntentId: { type: String },
    bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
