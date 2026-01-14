const Match = require('../models/Match');
const Stadium = require('../models/Stadium');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');
const {
    sendMatchCancellationNotification,
    sendMatchRescheduleNotification,
    sendRefundConfirmationNotification
} = require('../utils/notificationService');
const { logAction } = require('./auditLogController');

// Helper function: Calculate match start time
const getMatchStartTime = (match) => {
    const matchDateTime = new Date(match.date);
    const [hours, minutes] = match.time.split(':');
    matchDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return matchDateTime;
};

// Helper function: Check if booking is closed (10 minutes before start)
const isBookingClosed = (match) => {
    const matchStart = getMatchStartTime(match);
    const closureTime = new Date(matchStart.getTime() - 10 * 60 * 1000);
    return new Date() >= closureTime;
};

// Helper function: Check if match has started
const hasMatchStarted = (match) => {
    const matchStart = getMatchStartTime(match);
    return new Date() >= matchStart;
};

// Helper function: Get minutes until closure/start
const getMatchTiming = (match) => {
    const matchStart = getMatchStartTime(match);
    const closureTime = new Date(matchStart.getTime() - 10 * 60 * 1000);
    const now = new Date();

    return {
        minutesUntilClosure: Math.round((closureTime - now) / 60000),
        minutesUntilStart: Math.round((matchStart - now) / 60000),
        bookingClosed: now >= closureTime,
        matchStarted: now >= matchStart
    };
};

// Get all matches
exports.getAllMatches = async (req, res) => {
    try {
        const { stadium } = req.query;
        const query = stadium ? { stadium } : {};
        const matches = await Match.find(query).populate('stadium', 'name location');

        // Add booking closure status to each match
        const matchesWithStatus = matches.map(match => {
            const timing = getMatchTiming(match);
            return {
                ...match.toObject(),
                ...timing
            };
        });

        res.json(matchesWithStatus);
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

        // Add booking closure status
        const timing = getMatchTiming(match);

        res.json({
            ...match.toObject(),
            bookedSeats,
            ...timing
        });
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

        await logAction({
            adminUser: req.user.id,
            action: 'MATCH_CREATED',
            details: `Created match: ${match.homeTeam} vs ${match.awayTeam} on ${match.date}`,
            targetResource: `Match: ${match._id}`,
            ipAddress: req.ip
        });

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

// Cancel a match (Admin only)
exports.cancelMatch = async (req, res) => {
    try {
        const { cancellationReason } = req.body;
        const match = await Match.findById(req.params.id).populate('stadium');

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        if (match.status === 'cancelled') {
            return res.status(400).json({ message: 'Match is already cancelled' });
        }

        // Update match status
        match.status = 'cancelled';
        match.cancelledAt = new Date();
        match.cancellationReason = cancellationReason || 'Unforeseen circumstances';
        await match.save();

        // Find all paid bookings for this match
        const bookings = await Booking.find({
            match: req.params.id,
            paymentStatus: 'paid',
            bookingStatus: 'active'
        }).populate('user');

        // Update booking status to 'cancelled'
        let notificationsSent = 0;
        for (const booking of bookings) {
            booking.bookingStatus = 'cancelled';
            await booking.save();

            // Send cancellation notification
            try {
                await sendMatchCancellationNotification(booking.user, match, booking);
                notificationsSent++;
            } catch (notifErr) {
                console.error('Failed to send notification:', notifErr.message);
            }
        }

        res.json({
            message: 'Match cancelled successfully',
            match,
            affectedBookings: bookings.length,
            notificationsSent
        });

        await logAction({
            adminUser: req.user.id,
            action: 'MATCH_CANCELLED',
            details: `Cancelled match: ${match.homeTeam} vs ${match.awayTeam}. Reason: ${cancellationReason}`,
            targetResource: `Match: ${match._id}`,
            ipAddress: req.ip
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Reschedule a match (Admin only)
exports.rescheduleMatch = async (req, res) => {
    try {
        const { newDate, newTime, newStadium } = req.body;
        const oldMatch = await Match.findById(req.params.id).populate('stadium');

        if (!oldMatch) {
            return res.status(404).json({ message: 'Match not found' });
        }

        if (oldMatch.status !== 'cancelled') {
            return res.status(400).json({ message: 'Only cancelled matches can be rescheduled' });
        }

        // Create new match with updated details
        const newMatch = new Match({
            stadium: newStadium || oldMatch.stadium._id,
            homeTeam: oldMatch.homeTeam,
            awayTeam: oldMatch.awayTeam,
            date: newDate,
            time: newTime,
            description: oldMatch.description,
            status: 'upcoming',
            isFinal: oldMatch.isFinal,
            rescheduledFrom: oldMatch._id,
            vipPrice: oldMatch.vipPrice,
            regularPrice: oldMatch.regularPrice
        });

        await newMatch.save();

        // Link old match to new match
        oldMatch.rescheduledTo = newMatch._id;
        await oldMatch.save();

        // Populate stadium for new match
        await newMatch.populate('stadium');

        // Find all cancelled bookings from the old match
        const bookings = await Booking.find({
            match: oldMatch._id,
            paymentStatus: 'paid',
            bookingStatus: 'cancelled'
        }).populate('user');

        // Transfer bookings to new match
        let transferredBookings = 0;
        let notificationsSent = 0;

        for (const booking of bookings) {
            booking.match = newMatch._id;
            booking.bookingStatus = 'rescheduled';
            booking.originalMatch = oldMatch._id;
            booking.rescheduledTo = newMatch._id;
            await booking.save();
            transferredBookings++;

            // Send reschedule notification
            try {
                await sendMatchRescheduleNotification(booking.user, oldMatch, newMatch, booking);
                notificationsSent++;
            } catch (notifErr) {
                console.error('Failed to send notification:', notifErr.message);
            }
        }

        await logAction({
            adminUser: req.user.id,
            action: 'MATCH_RESCHEDULED',
            details: `Rescheduled match ${oldMatch._id} to new match ${newMatch._id} on ${newDate} ${newTime}`,
            targetResource: `Match: ${oldMatch._id} -> ${newMatch._id}`,
            ipAddress: req.ip
        });

        res.json({
            message: 'Match rescheduled successfully',
            oldMatch,
            newMatch,
            transferredBookings,
            notificationsSent
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Process refunds for cancelled final matches (Admin only)
exports.processMatchRefund = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Removed isFinal check to allow refunds for all cancelled matches

        if (match.status !== 'cancelled') {
            return res.status(400).json({ message: 'Match must be cancelled to process refunds' });
        }

        if (match.rescheduledTo) {
            return res.status(400).json({ message: 'Match has been rescheduled. Refunds not applicable.' });
        }

        // Find all paid bookings for this match
        const bookings = await Booking.find({
            match: req.params.id,
            paymentStatus: 'paid',
            bookingStatus: { $in: ['active', 'cancelled'] }
        }).populate('user');

        let refundsProcessed = 0;
        let notificationsSent = 0;
        const refundReason = 'Final match cancelled and cannot be replayed';

        for (const booking of bookings) {
            // Update booking status
            booking.bookingStatus = 'refunded';
            booking.paymentStatus = 'refunded';
            await booking.save();

            // Please note: We need to set a flag on the match to know it has been refunded
            match.isRefunded = true;
            await match.save();

            // Find and update payment record
            const payment = await Payment.findOne({ booking: booking._id });
            if (payment) {
                payment.status = 'refunded';
                payment.refundDate = new Date();
                payment.refundReason = refundReason;
                await payment.save();

                refundsProcessed++;

                // Send refund notification
                try {
                    await sendRefundConfirmationNotification(booking.user, match, booking, payment);
                    notificationsSent++;
                } catch (notifErr) {
                    console.error('Failed to send notification:', notifErr.message);
                }
            }
        }

        await logAction({
            adminUser: req.user.id,
            action: 'REFUND_PROCESSED',
            details: `Processed refunds for match ${match._id}. Total refunds: ${refundsProcessed}`,
            targetResource: `Match: ${match._id}`,
            ipAddress: req.ip
        });

        res.json({
            message: 'Refunds processed successfully',
            match,
            refundsProcessed,
            notificationsSent
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

