const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

// @route   POST api/auth/register
router.post('/register', authController.register);

router.post('/verify-email/:token', authController.verifyEmail); // Using POST because sometimes GET can be pre-fetched by email scanners, but usually GET is standard for links. Let's use POST for consistency with my typical patterns, OR GET if using a direct link from browser. 
// Actually, for a clickable link, GET is better.
router.get('/verify-email/:token', authController.verifyEmail);

// @route   POST api/auth/login
router.post('/login', authController.login);

// @route   GET api/auth/me
router.get('/me', auth, authController.getMe);

// @route   GET api/auth/users (Admin only)
router.get('/users', auth, authController.getAllUsers);

// @route   DELETE api/auth/users/:id (Admin only)
router.delete('/users/:id', auth, authController.deleteUser);

router.put('/update-profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);


module.exports = router;
