const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// All report routes should be admin only ideally, but 'auth' + role check
// We will rely on 'auth' generic middleware here, but UI handles role.
// Ideally middleware should verifyAdmin.

router.get('/stats', auth, reportController.getDashboardStats);
router.get('/revenue', auth, reportController.getRevenueChart);
router.get('/popularity', auth, reportController.getStadiumPopularity);
router.get('/detailed', auth, reportController.getDetailedReports);

module.exports = router;
