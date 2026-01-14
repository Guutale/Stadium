const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        enum: ['booking_config', 'pricing_config', 'notification_config'] // We can categorize settings
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Allows flexible structure for each setting group
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Helper to get a setting by key
systemSettingSchema.statics.getSetting = async function (key) {
    const setting = await this.findOne({ key });
    return setting ? setting.value : null;
};

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
