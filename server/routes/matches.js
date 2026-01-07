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

module.exports = router;
