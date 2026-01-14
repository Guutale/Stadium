const express = require('express');
const router = express.Router();
const systemSettingController = require('../controllers/systemSettingController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/settings
// @desc    Get all settings
// @access  Private/Admin
router.get('/', [auth, admin], systemSettingController.getSettings);

// @route   GET api/settings/public
// @desc    Get public settings
// @access  Public
router.get('/public', systemSettingController.getPublicSettings);

// @route   POST api/settings
// @desc    Update a setting
// @access  Private/Admin
router.post('/', [auth, admin], systemSettingController.updateSetting);

module.exports = router;
