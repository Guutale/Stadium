const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    stadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium', required: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g., "19:00"
    duration: { type: Number, default: 120 }, // Match duration in minutes (including breaks)
    description: { type: String },

    status: {
        type: String,
        enum: ['upcoming', 'booking_closed', 'ongoing', 'completed', 'cancelled', 'rescheduled', 'finished'],
        default: 'upcoming'
    },
    competitionType: {
        type: String,
        required: true
    },
    matchRules: { type: String },
    isFinal: { type: Boolean, default: false },
    isRefunded: { type: Boolean, default: false }, // Marks if refunds have been processed
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' }, // Original match if this is a rescheduled match
    rescheduledTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' }, // New match if this match was rescheduled
    vipPrice: { type: Number, required: true },
    regularPrice: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
