const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET api/audit-logs
// @desc    Get audit logs
// @access  Private/Admin
router.get('/', [auth, admin], auditLogController.getAuditLogs);

module.exports = router;
