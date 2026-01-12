const sendEmail = require('./emailService');

/**
 * Send notification when a match is cancelled
 */
const sendMatchCancellationNotification = async (user, match, booking) => {
    const subject = `Match Cancelled - ${match.homeTeam} vs ${match.awayTeam}`;
    const message = `
Dear ${user.username},

We regret to inform you that the match between ${match.homeTeam} and ${match.awayTeam} scheduled for ${new Date(match.date).toLocaleDateString()} at ${match.time} has been cancelled.

${match.cancellationReason ? `Reason: ${match.cancellationReason}` : ''}

IMPORTANT: Your booking remains valid!
- Booking ID: ${booking._id}
- Seats: ${booking.seats.join(', ')}
- Amount Paid: $${booking.totalAmount}

According to our policy:
✓ Your booking will automatically transfer to the next scheduled replay of this match
✓ You will NOT need to pay again
✓ We will notify you as soon as the match is rescheduled

If this is a final match that cannot be replayed, you will receive a full refund.

Thank you for your understanding.

Best regards,
Stadium Management Team
    `.trim();

    await sendEmail({
        email: user.email,
        subject,
        message
    });
};

/**
 * Send notification when a match is rescheduled
 */
const sendMatchRescheduleNotification = async (user, oldMatch, newMatch, booking) => {
    const subject = `Match Rescheduled - ${newMatch.homeTeam} vs ${newMatch.awayTeam}`;
    const message = `
Dear ${user.username},

Good news! The match between ${newMatch.homeTeam} and ${newMatch.awayTeam} has been rescheduled.

NEW MATCH DETAILS:
- Date: ${new Date(newMatch.date).toLocaleDateString()}
- Time: ${newMatch.time}
- Stadium: ${newMatch.stadium.name || 'TBD'}

YOUR BOOKING HAS BEEN AUTOMATICALLY TRANSFERRED:
- Booking ID: ${booking._id}
- Seats: ${booking.seats.join(', ')}
- Status: Active and ready for the new match date

You do NOT need to take any action. Your original payment covers this rescheduled match.

Original Match Date: ${new Date(oldMatch.date).toLocaleDateString()} at ${oldMatch.time}

We apologize for any inconvenience and look forward to seeing you at the match!

Best regards,
Stadium Management Team
    `.trim();

    await sendEmail({
        email: user.email,
        subject,
        message
    });
};

/**
 * Send reminder notification before a rescheduled match
 */
const sendMatchReplayReminderNotification = async (user, match, booking) => {
    const subject = `Reminder: Your Match is Coming Up - ${match.homeTeam} vs ${match.awayTeam}`;
    const message = `
Dear ${user.username},

This is a friendly reminder that your match is coming up soon!

MATCH DETAILS:
- Teams: ${match.homeTeam} vs ${match.awayTeam}
- Date: ${new Date(match.date).toLocaleDateString()}
- Time: ${match.time}
- Stadium: ${match.stadium.name || 'TBD'}

YOUR BOOKING:
- Booking ID: ${booking._id}
- Seats: ${booking.seats.join(', ')}
- Status: ${booking.bookingStatus}

${booking.bookingStatus === 'rescheduled' ? 'Note: This is a rescheduled match. Your original booking has been transferred.' : ''}

Please arrive at least 30 minutes before the match starts.

See you at the stadium!

Best regards,
Stadium Management Team
    `.trim();

    await sendEmail({
        email: user.email,
        subject,
        message
    });
};

/**
 * Send notification when a refund is processed
 */
const sendRefundConfirmationNotification = async (user, match, booking, payment) => {
    const subject = `Refund Processed - ${match.homeTeam} vs ${match.awayTeam}`;
    const message = `
Dear ${user.username},

We regret to inform you that the final match between ${match.homeTeam} and ${match.awayTeam} has been cancelled and cannot be replayed.

REFUND DETAILS:
- Refund Amount: $${payment.amount}
- Original Booking ID: ${booking._id}
- Payment Method: ${payment.method}
- Refund Date: ${new Date().toLocaleDateString()}

${payment.refundReason ? `Reason: ${payment.refundReason}` : ''}

Your refund has been processed and will be credited to your original payment method within 5-10 business days.

We sincerely apologize for the inconvenience and hope to serve you again in the future.

If you have any questions about your refund, please contact our support team.

Best regards,
Stadium Management Team
    `.trim();

    await sendEmail({
        email: user.email,
        subject,
        message
    });
};

/**
 * Send notification when booking attempt is made after closure
 */
const sendBookingClosureNotification = async (user, match, minutesUntilStart) => {
    const subject = `Booking Closed - ${match.homeTeam} vs ${match.awayTeam}`;
    const message = `
Dear ${user.username},

We noticed you attempted to book tickets for the match between ${match.homeTeam} and ${match.awayTeam}.

Unfortunately, the booking window for this match has closed as it is about to start.

MATCH DETAILS:
- Date: ${new Date(match.date).toLocaleDateString()}
- Time: ${match.time}
- Stadium: ${match.stadium?.name || 'TBD'}
${minutesUntilStart > 0 ? `- Match starts in: ${minutesUntilStart} minute(s)` : '- Match has already started'}

OUR POLICY:
Bookings close 10 minutes before match start to ensure smooth operations and prevent seat allocation conflicts.

We apologize for any inconvenience. Please check our upcoming matches for other booking opportunities.

Thank you for your understanding.

Best regards,
Stadium Management Team
    `.trim();

    await sendEmail({
        email: user.email,
        subject,
        message
    });
};

module.exports = {
    sendMatchCancellationNotification,
    sendMatchRescheduleNotification,
    sendMatchReplayReminderNotification,
    sendRefundConfirmationNotification,
    sendBookingClosureNotification
};
