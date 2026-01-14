const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Match = require('../models/Match');
const SystemSetting = require('../models/SystemSetting');
const { v4: uuidv4 } = require('uuid');
const { logAction } = require('./auditLogController');

// Helper to add status history
const addStatusHistory = (booking, status, actionType, note, user) => {
    booking.statusHistory.push({
        status,
        actionType,
        timestamp: new Date(),
        note: note || `Status changed to ${status}`
    });
};

// Create Booking (User)
exports.createBooking = async (req, res) => {
    try {
        const { match, seats, totalAmount } = req.body;

        // Check if match exists
        const matchInfo = await Match.findById(match);
        if (!matchInfo) {
            return res.status(404).json({ msg: 'Match not found' });
        }

        // Check if match is cancelled
        if (matchInfo.status === 'cancelled') {
            if (matchInfo.rescheduledTo) {
                return res.status(400).json({
                    msg: 'This match has been cancelled and rescheduled. Please book the new match.',
                    rescheduledMatchId: matchInfo.rescheduledTo
                });
            }
            return res.status(400).json({ msg: 'This match has been cancelled. Booking is not available.' });
        }

        // Get Booking Closure Time from Settings (default 10)
        const bookingConfig = await SystemSetting.getSetting('booking_config');
        const closeMinutes = bookingConfig?.closeMinutesBeforeStart || 10;

        // Combine date and time
        const matchDateTime = new Date(matchInfo.date);
        const [hours, minutes] = matchInfo.time.split(':');
        matchDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Calculate closure
        const closureTime = new Date(matchDateTime.getTime() - closeMinutes * 60 * 1000);
        const now = new Date();

        if (now >= closureTime) {
            const minutesUntilStart = Math.round((matchDateTime - now) / 60000);
            if (minutesUntilStart <= 0) {
                return res.status(400).json({
                    msg: 'Match has already started. Booking is closed.',
                    matchStarted: true,
                    bookingClosed: true
                });
            } else {
                return res.status(400).json({
                    msg: `Booking is closed. Match starts in ${minutesUntilStart} minute(s). Bookings close ${closeMinutes} minutes before match start.`,
                    bookingClosed: true,
                    minutesUntilStart,
                    closureReason: `Bookings close ${closeMinutes} minutes before match start.`
                });
            }
        }

        // Create Booking
        const newBooking = new Booking({
            user: req.user.id,
            match,
            seats,
            totalAmount,
            paymentStatus: 'pending',
            bookingStatus: 'active',
            ticketCode: uuidv4(), // Generate unique ticket code
            statusHistory: [{
                status: 'pending', // Payment pending
                actionType: 'BOOKING_CREATED',
                timestamp: new Date(),
                note: 'Booking created, waiting for payment.'
            }]
        });

        const booking = await newBooking.save();
        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Match Bookings (Admin)
exports.getMatchBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ match: req.params.matchId }).populate('user', 'name email');
        res.json(bookings);
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
            .populate({ path: 'match', populate: { path: 'stadium' } })
            .populate('originalMatch')
            .populate('rescheduledTo');
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

        booking.paymentStatus = 'failed';
        booking.bookingStatus = 'cancelled';

        booking.statusHistory.push({
            status: 'cancelled',
            actionType: 'USER_CANCELLED',
            timestamp: new Date(),
            note: 'User cancelled pending booking.'
        });

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

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        const oldStatus = booking.paymentStatus;
        booking.paymentStatus = status;

        if (status === 'paid') {
            booking.statusHistory.push({
                status: 'paid',
                actionType: 'PAYMENT_COMPLETED',
                timestamp: new Date(),
                note: 'Payment success confirmed.'
            });
        }

        await booking.save();

        // Log if admin
        if (req.user && req.user.role === 'admin') {
            await logAction({
                adminUser: req.user.id,
                action: 'OTHER',
                details: `Booking ${booking._id} status updated from ${oldStatus} to ${status}`,
                targetResource: `Booking: ${booking._id}`,
                ipAddress: req.ip
            });
        }

        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete Booking (Admin or User)
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('match');

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Check user authorization
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Logic check: Only allow delete if match is finished OR booking is cancelled/refunded
        // Admins can delete anytime
        if (req.user.role !== 'admin') {
            const isCancelled = booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'refunded' || booking.paymentStatus === 'failed';

            let isFinished = false;
            if (booking.match) {
                const matchDate = new Date(booking.match.date);
                if (booking.match.time) {
                    const [hours, minutes] = booking.match.time.split(':');
                    matchDate.setHours(parseInt(hours) + 2, parseInt(minutes)); // Approx finish
                }
                isFinished = new Date() > matchDate;
            } else {
                isFinished = true; // Match deleted
            }

            if (!isCancelled && !isFinished) {
                return res.status(400).json({ msg: 'Active bookings cannot be deleted. Only past or cancelled bookings can be removed.' });
            }
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Booking deleted successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Verify Ticket (Scanner)
exports.verifyTicket = async (req, res) => {
    try {
        const { ticketCode } = req.body;
        
        const booking = await Booking.findOne({ ticketCode }).populate('match').populate('user', 'username email');
        
        if (!booking) {
             return res.status(404).json({ valid: false, msg: 'Invalid Ticket' });
        }

        if (booking.bookingStatus !== 'active' && booking.bookingStatus !== 'completed') {
             return res.status(400).json({ valid: false, msg: `Ticket is ${booking.bookingStatus}` });
        }

        if (booking.isTicketVerified) {
             return res.status(400).json({ 
                valid: false, 
                msg: 'Ticket already used', 
                verifiedAt: booking.ticketVerifiedAt 
            });
        }

        // Verify match date (optional, ensure it's today)
        const matchDate = new Date(booking.match.date);
        const now = new Date();
        const isSameDay = matchDate.getDate() === now.getDate() &&
                          matchDate.getMonth() === now.getMonth() &&
                          matchDate.getFullYear() === now.getFullYear();
        
        // if (!isSameDay) {
        //      return res.status(400).json({ valid: false, msg: 'Ticket is for a different date' });
        // }

        booking.isTicketVerified = true;
        booking.ticketVerifiedAt = new Date();
        booking.statusHistory.push({
            status: 'admitted',
            actionType: 'TICKET_VERIFIED',
            timestamp: new Date(),
            note: 'Ticket verified at gate.'
        });

        await booking.save();

        res.json({ 
            valid: true, 
            msg: 'Ticket Verified', 
            booking: {
                id: booking._id,
                user: booking.user.username,
                match: `${booking.match.homeTeam} vs ${booking.match.awayTeam}`,
                seats: booking.seats
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
