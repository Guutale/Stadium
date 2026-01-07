const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    stadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium', required: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g., "19:00"
    description: { type: String },
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
    vipPrice: { type: Number, required: true },
    regularPrice: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
