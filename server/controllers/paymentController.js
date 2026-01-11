const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ticketService = require('../utils/ticketService');
const sendEmail = require('../utils/emailService');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { bookingId, amount } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            metadata: { bookingId }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Process EVC Payment (Demo/Simulation)
exports.processEVCPayment = async (req, res) => {
    try {
        const { bookingId, pin } = req.body;

        // In production, this would call the real EVC Plus API
        // For demo: simulate successful payment if PIN is provided
        if (!pin || pin.length < 4) {
            return res.status(400).json({ message: 'Invalid PIN' });
        }

        // Find the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Simulate payment processing delay
        // In production: await evcPlusAPI.processPayment(...)

        // Update booking status to paid
        booking.paymentStatus = 'paid';
        await booking.save();

        // Create payment record
        const payment = new Payment({
            user: booking.user,
            booking: booking._id,
            amount: booking.totalAmount,
            method: 'evc_plus',
            status: 'success',
            transactionId: `EVC${Date.now()}`, // Demo transaction ID
            date: new Date()
        });
        await payment.save();

        res.json({
            success: true,
            message: 'Payment successful',
            bookingId: booking._id,
            transactionId: payment.transactionId
        });
    } catch (err) {
        console.error('EVC Payment Error:', err);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        res.status(500).json({ message: 'Payment processing failed', error: err.message });
    }
};

exports.recordPayment = async (req, res) => {
    // This might be used for manual confirmation if not using webhooks
    // Or just a wrapper to update status
    try {
        const { bookingId, paymentIntentId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Verify with Stripe if needed, or trust client for this demo scope if user just wants "flow"
        // Better to verify.
        if (paymentIntentId) {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status === 'succeeded') {
                booking.paymentStatus = 'paid';
                await booking.save();
                return res.json(booking);
            }
        }

        res.status(400).json({ msg: 'Payment not confirmed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Simulate Card Payment (No Stripe)
exports.simulateCardPayment = async (req, res) => {
    console.log("► simulateCardPayment START");
    try {
        console.log("► req.body:", req.body);
        console.log("► req.user:", req.user);

        const { bookingId, amount } = req.body;

        if (!req.user || !req.user.id) {
            console.error("► Missing req.user or req.user.id");
            return res.status(401).json({ message: 'User not authenticated properly' });
        }

        // Security Check: Is User Verified?
        console.log("► Finding user:", req.user.id);
        const user = await User.findById(req.user.id);

        if (!user) {
            console.error("► User not found in DB");
            return res.status(401).json({ message: 'User not found' });
        }
        console.log("► User verification status:", user.isVerified);

        if (!user.isVerified) {
            console.warn("► User not verified");
            return res.status(403).json({ success: false, message: 'Email not verified. Please verify your email before booking.' });
        }

        console.log("► Finding booking:", bookingId);
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            console.error("► Booking not found");
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Simulate successful payment
        console.log("► Updating booking status");
        booking.paymentStatus = 'paid';
        await booking.save();

        // Record fake payment
        console.log("► Creating payment record");
        const payment = new Payment({
            user: req.user.id,
            booking: booking._id,
            amount: booking.totalAmount,
            method: 'card', // Use valid enum value
            status: 'success',
            transactionId: `SIM${Date.now()}`,
            date: new Date()
        });
        await payment.save();

        console.log("► Payment success. Transaction:", payment.transactionId);
        res.json({ success: true, transactionId: payment.transactionId });
    } catch (err) {
        console.error("► Payment Simulation Error:", err);
        console.error("► Stack:", err.stack);
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message, stack: err.stack });
    }
};
