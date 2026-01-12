const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public
router.get('/', matchController.getAllMatches);
router.get('/:id', matchController.getMatchById);

// Admin only
router.post('/', [auth, admin], matchController.createMatch);
router.put('/:id', [auth, admin], matchController.updateMatch);
router.delete('/:id', [auth, admin], matchController.deleteMatch);

// Cancellation & Reschedule Policy Routes (Admin only)
router.post('/:id/cancel', [auth, admin], matchController.cancelMatch);
router.post('/:id/reschedule', [auth, admin], matchController.rescheduleMatch);
router.post('/:id/refund', [auth, admin], matchController.processMatchRefund);

module.exports = router;
