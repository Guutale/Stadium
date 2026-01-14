const cron = require('node-cron');
const Match = require('../models/Match');

const initializeScheduler = () => {
    console.log('⏰ Match Lifecycle Scheduler Initialized');

    // Run every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        // console.log(`Running match status check at ${now.toISOString()}`);

        try {
            // ---------------------------------------------------------
            // 1. Check for Matches to START (Upcoming -> Ongoing)
            // ---------------------------------------------------------
            const upcomingMatches = await Match.find({ status: 'upcoming' });

            for (const match of upcomingMatches) {
                // Combine date and time to get full start time
                // match.date is a Date object (usually set to midnight UTC or local), match.time is "HH:MM" string
                const matchDateStr = match.date.toISOString().split('T')[0]; // "YYYY-MM-DD"
                const startDateTimeStr = `${matchDateStr}T${match.time}:00`;

                // We need to handle timezone carefully. Assuming server/system is configured or treating inputs as local/UTC consistent.
                // If match.time is just "19:00", we assume it corresponds to the date.
                // Use a robust parsing:
                const startDate = new Date(match.date);
                const [hours, minutes] = match.time.split(':').map(Number);
                startDate.setHours(hours, minutes, 0, 0);

                if (startDate <= now) {
                    console.log(`▶️ Starting match: ${match.homeTeam} vs ${match.awayTeam}`);
                    match.status = 'ongoing';
                    await match.save();
                }
            }

            // ---------------------------------------------------------
            // 2. Check for Matches to END (Ongoing -> Completed)
            // ---------------------------------------------------------
            const ongoingMatches = await Match.find({ status: 'ongoing' });

            for (const match of ongoingMatches) {
                const startDate = new Date(match.date);
                const [hours, minutes] = match.time.split(':').map(Number);
                startDate.setHours(hours, minutes, 0, 0);

                // Demo Validation: Match lasts strictly 5 minutes for demonstration
                // Start Time + 5 minutes = End Time
                const demoDurationMs = 5 * 60 * 1000;
                const endDate = new Date(startDate.getTime() + demoDurationMs);

                if (endDate <= now) {
                    console.log(`🏁 Ending match: ${match.homeTeam} vs ${match.awayTeam}`);
                    match.status = 'completed';
                    await match.save();
                }
            }

        } catch (error) {
            console.error('❌ Error in match scheduler:', error);
        }
    });
};

module.exports = initializeScheduler;
