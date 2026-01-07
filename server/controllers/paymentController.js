const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

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
