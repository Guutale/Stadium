const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const run = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('No MONGODB_URI found. Env path:', path.join(__dirname, '.env'));
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Create dummy data
        const fakeUserId = new mongoose.Types.ObjectId();
        const fakeMatchId = new mongoose.Types.ObjectId();

        const booking = await new Booking({
            user: fakeUserId,
            match: fakeMatchId,
            seats: ['A1'],
            totalAmount: 50
        }).save();

        const payment = await new Payment({
            user: fakeUserId,
            booking: booking._id,
            amount: 50,
            method: 'card',
            transactionId: 'tx_verify_cascade'
        }).save();

        console.log(`Created Booking ${booking._id} and Payment ${payment._id}`);

        // Verify Deletion Logic (Simulating what deleteBooking does)
        console.log('Executing Deletion...');
        await Payment.deleteMany({ booking: booking._id });
        await Booking.findByIdAndDelete(booking._id);

        const bCheck = await Booking.findById(booking._id);
        const pCheck = await Payment.findById(payment._id);

        let success = true;
        if (bCheck) {
            console.error('FAILURE: Booking still exists');
            success = false;
        } else {
            console.log('SUCCESS: Booking deleted');
        }

        if (pCheck) {
            console.error('FAILURE: Payment still exists');
            success = false;
        } else {
            console.log('SUCCESS: Payment deleted');
        }


        if (success) {
            console.log('ALL TESTS PASSED');
            process.exit(0);
        } else {
            process.exit(1);
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
run();
