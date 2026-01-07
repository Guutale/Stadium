const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/create-payment-intent', auth, paymentController.createPaymentIntent);
// @route   POST api/payments/evc (Demo EVC payment)
router.post('/evc', auth, paymentController.processEVCPayment);
router.post('/', auth, paymentController.recordPayment);

module.exports = router;
