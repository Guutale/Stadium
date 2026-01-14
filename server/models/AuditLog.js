const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'MATCH_CREATED',
            'MATCH_UPDATED',
            'MATCH_CANCELLED',
            'MATCH_RESCHEDULED',
            'REFUND_PROCESSED',
            'SETTINGS_UPDATED',
            'STADIUM_CREATED',
            'STADIUM_UPDATED',
            'STADIUM_DELETED',
            'OTHER'
        ]
    },
    details: {
        type: String,
        required: true
    },
    targetResource: {
        type: String, // e.g., "Match: <id>" or "Booking: <id>"
    },
    ipAddress: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
