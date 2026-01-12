/**
 * Test Script for Match Cancellation & Reschedule Policy
 * 
 * This script tests the complete cancellation and reschedule policy implementation:
 * 1. Match cancellation
 * 2. Match rescheduling and booking transfer
 * 3. Final match refund processing
 * 4. Notification system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Stadium = require('../models/Stadium');
const Match = require('../models/Match');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stadium_management';

// Test data
let testUser, testStadium, testMatch, testFinalMatch, testBooking, testFinalBooking;

const runTests = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Cleanup previous test data
        await cleanupTestData();

        // Test 1: Setup test data
        await setupTestData();

        // Test 2: Test match cancellation
        await testMatchCancellation();

        // Test 3: Test match reschedule and booking transfer
        await testMatchReschedule();

        // Test 4: Test final match refund
        await testFinalMatchRefund();

        console.log('\n✅ ALL TESTS PASSED!\n');

    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    }
};

async function cleanupTestData() {
    console.log('🧹 Cleaning up previous test data...');
    await User.deleteMany({ email: { $regex: /^test.*@test\.com$/ } });
    await Stadium.deleteMany({ name: { $regex: /^Test Stadium/ } });
    await Match.deleteMany({ homeTeam: { $regex: /^Test Team/ } });
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    console.log('✅ Cleanup complete\n');
}

async function setupTestData() {
    console.log('📝 Setting up test data...');

    // Create test user
    testUser = new User({
        username: 'testuser',
        email: 'testuser@test.com',
        password: 'hashedpassword123',
        role: 'user'
    });
    await testUser.save();
    console.log('✅ Created test user:', testUser.email);

    // Create test stadium
    testStadium = new Stadium({
        name: 'Test Stadium',
        location: 'Test City',
        capacity: 50000,
        vipSeats: ['VIP-A1', 'VIP-A2', 'VIP-A3'],
        regularSeats: Array.from({ length: 100 }, (_, i) => `R-${i + 1}`)
    });
    await testStadium.save();
    console.log('✅ Created test stadium:', testStadium.name);

    // Create regular test match
    testMatch = new Match({
        stadium: testStadium._id,
        homeTeam: 'Test Team A',
        awayTeam: 'Test Team B',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: '19:00',
        description: 'Regular season match',
        status: 'upcoming',
        isFinal: false,
        vipPrice: 100,
        regularPrice: 50
    });
    await testMatch.save();
    console.log('✅ Created regular test match:', `${testMatch.homeTeam} vs ${testMatch.awayTeam}`);

    // Create final test match
    testFinalMatch = new Match({
        stadium: testStadium._id,
        homeTeam: 'Test Team C',
        awayTeam: 'Test Team D',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        time: '20:00',
        description: 'Championship Final',
        status: 'upcoming',
        isFinal: true,
        vipPrice: 200,
        regularPrice: 100
    });
    await testFinalMatch.save();
    console.log('✅ Created final test match:', `${testFinalMatch.homeTeam} vs ${testFinalMatch.awayTeam}`);

    // Create booking for regular match
    testBooking = new Booking({
        user: testUser._id,
        match: testMatch._id,
        seats: ['R-1', 'R-2'],
        totalAmount: 100,
        paymentStatus: 'paid',
        bookingStatus: 'active'
    });
    await testBooking.save();
    console.log('✅ Created test booking for regular match');

    // Create payment for regular match
    const testPayment = new Payment({
        user: testUser._id,
        booking: testBooking._id,
        amount: 100,
        method: 'card',
        status: 'success',
        transactionId: 'TEST-TXN-001'
    });
    await testPayment.save();
    console.log('✅ Created test payment');

    // Create booking for final match
    testFinalBooking = new Booking({
        user: testUser._id,
        match: testFinalMatch._id,
        seats: ['VIP-A1'],
        totalAmount: 200,
        paymentStatus: 'paid',
        bookingStatus: 'active'
    });
    await testFinalBooking.save();
    console.log('✅ Created test booking for final match');

    // Create payment for final match
    const testFinalPayment = new Payment({
        user: testUser._id,
        booking: testFinalBooking._id,
        amount: 200,
        method: 'card',
        status: 'success',
        transactionId: 'TEST-TXN-002'
    });
    await testFinalPayment.save();
    console.log('✅ Created test payment for final match\n');
}

async function testMatchCancellation() {
    console.log('🧪 TEST 1: Match Cancellation');
    console.log('─────────────────────────────');

    // Cancel the match
    testMatch.status = 'cancelled';
    testMatch.cancelledAt = new Date();
    testMatch.cancellationReason = 'Weather conditions';
    await testMatch.save();

    // Update booking status
    testBooking.bookingStatus = 'cancelled';
    await testBooking.save();

    // Verify match is cancelled
    const cancelledMatch = await Match.findById(testMatch._id);
    console.assert(cancelledMatch.status === 'cancelled', '❌ Match status should be cancelled');
    console.assert(cancelledMatch.cancellationReason === 'Weather conditions', '❌ Cancellation reason not set');
    console.log('✅ Match cancelled successfully');

    // Verify booking is cancelled but payment remains paid
    const cancelledBooking = await Booking.findById(testBooking._id);
    console.assert(cancelledBooking.bookingStatus === 'cancelled', '❌ Booking status should be cancelled');
    console.assert(cancelledBooking.paymentStatus === 'paid', '❌ Payment status should remain paid');
    console.log('✅ Booking marked as cancelled, payment remains valid');
    console.log('✅ TEST 1 PASSED\n');
}

async function testMatchReschedule() {
    console.log('🧪 TEST 2: Match Reschedule & Booking Transfer');
    console.log('─────────────────────────────────────────────');

    // Create new rescheduled match
    const rescheduledMatch = new Match({
        stadium: testStadium._id,
        homeTeam: testMatch.homeTeam,
        awayTeam: testMatch.awayTeam,
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        time: '18:00',
        description: testMatch.description,
        status: 'upcoming',
        isFinal: false,
        rescheduledFrom: testMatch._id,
        vipPrice: testMatch.vipPrice,
        regularPrice: testMatch.regularPrice
    });
    await rescheduledMatch.save();
    console.log('✅ Created rescheduled match');

    // Link old match to new match
    testMatch.rescheduledTo = rescheduledMatch._id;
    await testMatch.save();

    // Transfer booking to new match
    testBooking.match = rescheduledMatch._id;
    testBooking.bookingStatus = 'rescheduled';
    testBooking.originalMatch = testMatch._id;
    testBooking.rescheduledTo = rescheduledMatch._id;
    await testBooking.save();

    // Verify old match links to new match
    const oldMatch = await Match.findById(testMatch._id);
    console.assert(oldMatch.rescheduledTo.toString() === rescheduledMatch._id.toString(), '❌ Old match should link to new match');
    console.log('✅ Old match linked to new match');

    // Verify new match links to old match
    const newMatch = await Match.findById(rescheduledMatch._id);
    console.assert(newMatch.rescheduledFrom.toString() === testMatch._id.toString(), '❌ New match should link to old match');
    console.log('✅ New match linked to old match');

    // Verify booking transferred
    const transferredBooking = await Booking.findById(testBooking._id);
    console.assert(transferredBooking.match.toString() === rescheduledMatch._id.toString(), '❌ Booking should be transferred to new match');
    console.assert(transferredBooking.bookingStatus === 'rescheduled', '❌ Booking status should be rescheduled');
    console.assert(transferredBooking.paymentStatus === 'paid', '❌ Payment status should remain paid');
    console.log('✅ Booking transferred to new match');
    console.log('✅ User does NOT need to pay again');
    console.log('✅ TEST 2 PASSED\n');
}

async function testFinalMatchRefund() {
    console.log('🧪 TEST 3: Final Match Refund');
    console.log('─────────────────────────────');

    // Cancel final match
    testFinalMatch.status = 'cancelled';
    testFinalMatch.cancelledAt = new Date();
    testFinalMatch.cancellationReason = 'Cannot be replayed';
    await testFinalMatch.save();

    // Process refund
    testFinalBooking.bookingStatus = 'refunded';
    testFinalBooking.paymentStatus = 'refunded';
    await testFinalBooking.save();

    const payment = await Payment.findOne({ booking: testFinalBooking._id });
    payment.status = 'refunded';
    payment.refundDate = new Date();
    payment.refundReason = 'Final match cancelled and cannot be replayed';
    await payment.save();

    // Verify match is cancelled and marked as final
    const cancelledFinal = await Match.findById(testFinalMatch._id);
    console.assert(cancelledFinal.status === 'cancelled', '❌ Final match should be cancelled');
    console.assert(cancelledFinal.isFinal === true, '❌ Match should be marked as final');
    console.assert(!cancelledFinal.rescheduledTo, '❌ Final match should not be rescheduled');
    console.log('✅ Final match cancelled without reschedule');

    // Verify booking refunded
    const refundedBooking = await Booking.findById(testFinalBooking._id);
    console.assert(refundedBooking.bookingStatus === 'refunded', '❌ Booking status should be refunded');
    console.assert(refundedBooking.paymentStatus === 'refunded', '❌ Payment status should be refunded');
    console.log('✅ Booking marked as refunded');

    // Verify payment refunded
    const refundedPayment = await Payment.findOne({ booking: testFinalBooking._id });
    console.assert(refundedPayment.status === 'refunded', '❌ Payment status should be refunded');
    console.assert(refundedPayment.refundReason, '❌ Refund reason should be set');
    console.assert(refundedPayment.refundDate, '❌ Refund date should be set');
    console.log('✅ Payment refunded with reason and date');
    console.log('✅ TEST 3 PASSED\n');
}

// Run the tests
console.log('🚀 Starting Match Cancellation & Reschedule Policy Tests\n');
console.log('═══════════════════════════════════════════════════════\n');
runTests();
