const Match = require('../models/Match');
const Stadium = require('../models/Stadium');

// Get all matches
exports.getAllMatches = async (req, res) => {
    try {
        const { stadium } = req.query;
        const query = stadium ? { stadium } : {};
        const matches = await Match.find(query).populate('stadium', 'name location');
        res.json(matches);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get match by ID
exports.getMatchById = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id).populate('stadium');
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Get booked seats
        const Bookings = require('../models/Booking');
        const bookings = await Bookings.find({
            match: req.params.id,
            paymentStatus: { $in: ['pending', 'paid'] }
        }).select('seats');

        let bookedSeats = [];
        bookings.forEach(booking => {
            bookedSeats = [...bookedSeats, ...booking.seats];
        });

        res.json({ ...match.toObject(), bookedSeats });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Match not found' });
        }
        res.status(500).send('Server Error');
    }
};

// Create a match (Admin only)
exports.createMatch = async (req, res) => {
    try {
        const { stadium, date, time } = req.body;

        // Basic conflict check (optional)
        // Check if stadium is busy at that time? keeping if simple for now as per instructions

        const newMatch = new Match(req.body);
        const match = await newMatch.save();
        res.json(match);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update a match
exports.updateMatch = async (req, res) => {
    try {
        const match = await Match.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(match);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete a match
exports.deleteMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }
        await match.deleteOne();
        res.json({ message: 'Match removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
