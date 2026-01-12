const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Create Booking
router.post('/', auth, bookingController.createBooking);

// Get User Bookings
router.get('/my', auth, bookingController.getUserBookings);

// Get Booking by ID
router.get('/:id', auth, bookingController.getBookingById);
router.post('/:id/cancel', auth, bookingController.cancelBooking);

// Get All Bookings (Admin)
router.get('/', [auth, admin], bookingController.getAllBookings);

// Update Booking Status (Admin)
router.put('/:id', [auth, admin], bookingController.updateBookingStatus);

// Delete Booking (Admin or User for history)
router.delete('/:id', auth, bookingController.deleteBooking);

module.exports = router;
