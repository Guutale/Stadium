const express = require('express');
const router = express.Router();
const stadiumController = require('../controllers/stadiumController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/stadiums
// @desc    Get all stadiums
// @access  Public
router.get('/', stadiumController.getAllStadiums);

// @route   GET api/stadiums/:id
// @desc    Get stadium by ID
// @access  Public
router.get('/:id', stadiumController.getStadiumById);

// @route   POST api/stadiums
// @desc    Add new stadium
// @access  Private/Admin
router.post('/', [auth, admin], stadiumController.createStadium);

// @route   PUT api/stadiums/:id
// @desc    Update stadium
// @access  Private/Admin
router.put('/:id', [auth, admin], stadiumController.updateStadium);

// @route   DELETE api/stadiums/:id
// @desc    Delete stadium
// @access  Private/Admin
router.delete('/:id', [auth, admin], stadiumController.deleteStadium);

module.exports = router;
