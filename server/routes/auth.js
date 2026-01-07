const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

// @route   POST api/auth/register
router.post('/register', authController.register);

// @route   POST api/auth/login
router.post('/login', authController.login);

// @route   GET api/auth/me
router.get('/me', auth, authController.getMe);

// @route   GET api/auth/users (Admin only)
router.get('/users', auth, authController.getAllUsers);

// @route   DELETE api/auth/users/:id (Admin only)
router.delete('/users/:id', auth, authController.deleteUser);

module.exports = router;
