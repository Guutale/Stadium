const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const Match = require('../models/Match');

// Create Booking (User)
exports.createBooking = async (req, res) => {
    try {
        const { match, seats, totalAmount } = req.body;

        // Check if match exists and hasn't started
        const matchInfo = await Match.findById(match);
        if (!matchInfo) {
            return res.status(404).json({ msg: 'Match not found' });
        }

        // Combine date and time to create a full Date object
        const matchDateTime = new Date(matchInfo.date);
        const [hours, minutes] = matchInfo.time.split(':');
        matchDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (new Date() > matchDateTime) {
            return res.status(400).json({ msg: 'Match has already started. Booking is closed.' });
        }

        // Ensure user is attached by auth middleware
        const newBooking = new Booking({
            user: req.user.id,
            match,
            seats,
            totalAmount,
            paymentStatus: 'pending'
        });

        const booking = await newBooking.save();
        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get User Bookings
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('match')
            .populate({ path: 'match', populate: { path: 'stadium' } });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get All Bookings (Admin)
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'username email')
            .populate({
                path: 'match',
                populate: { path: 'stadium' }
            })
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete Booking (Admin)
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Delete related Payment records
        await Payment.deleteMany({ booking: req.params.id });

        await booking.deleteOne();

        res.json({ msg: 'Booking removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('match')
            .populate({ path: 'match', populate: { path: 'stadium' } });

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Verify user owns this booking (optional but recommended)
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Cancel Booking (User)
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Verify user owns this booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Only allow cancelling if pending
        if (booking.paymentStatus !== 'pending') {
            return res.status(400).json({ msg: 'Cannot cancel processed booking' });
        }

        booking.paymentStatus = 'failed'; // Or 'cancelled' if enum allows, but requirement said "fails payment... return selected seats". 'failed' is safe.
        // Actually enum was ['pending', 'paid', 'failed', 'refunded']. 'failed' works.
        // If I want 'cancelled', I should update enum. But 'failed' effectively releases seats given the matchController change.
        // Let's use 'failed' or 'refunded'. 'failed' implies it didn't go through.

        await booking.save();
        res.json({ msg: 'Booking cancelled' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Booking Status (Admin or System)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body; // e.g., 'paid', 'cancelled'
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { $set: { paymentStatus: status } },
            { new: true }
        );
        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
