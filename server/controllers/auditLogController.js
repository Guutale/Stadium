const AuditLog = require('../models/AuditLog');

// Helper function to log actions
exports.logAction = async ({ adminUser, action, details, targetResource, ipAddress }) => {
    try {
        const log = new AuditLog({
            adminUser,
            action,
            details,
            targetResource,
            ipAddress
        });
        await log.save();
    } catch (err) {
        console.error('Failed to create audit log:', err.message);
        // Do not fail the main request just because logging failed, but log the error
    }
};

// Get Audit Logs (Admin)
exports.getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, action, adminUser } = req.query;
        const query = {};

        if (action) query.action = action;
        if (adminUser) query.adminUser = adminUser;

        const logs = await AuditLog.find(query)
            .populate('adminUser', 'username email')
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await AuditLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
