const SystemSetting = require('../models/SystemSetting');
const { logAction } = require('./auditLogController');

// Get all settings (Admin)
exports.getSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.find();
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get public settings (User)
exports.getPublicSettings = async (req, res) => {
    try {
        // Only return settings that are safe for public
        const settings = await SystemSetting.find({
            key: { $in: ['booking_config', 'pricing_config'] }
        });
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update setting (Admin)
exports.updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;

        let setting = await SystemSetting.findOne({ key });

        if (setting) {
            setting.value = value;
            setting.updatedBy = req.user.id;
            setting.lastUpdated = Date.now();
            await setting.save();
        } else {
            setting = new SystemSetting({
                key,
                value,
                updatedBy: req.user.id
            });
            await setting.save();
        }

        // Log the action
        await logAction({
            adminUser: req.user.id,
            action: 'SETTINGS_UPDATED',
            details: `Updated setting: ${key}`,
            targetResource: `Setting: ${key}`,
            ipAddress: req.ip
        });

        res.json(setting);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
