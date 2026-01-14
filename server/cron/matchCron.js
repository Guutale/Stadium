const cron = require('node-cron');
const Match = require('../models/Match');

// Helper to combine date and time into a Date object
const getMatchDateTime = (date, time) => {
    const matchDate = new Date(date);
    const [hours, minutes] = time.split(':');
    matchDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return matchDate;
};

const startMatchCron = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            console.log('Running match status automation...');

            // 1. Start Matches (upcoming -> ongoing)
            // Find matches that are 'upcoming' and start time has passed
            const upcomingMatches = await Match.find({ status: 'upcoming' });

            for (const match of upcomingMatches) {
                const startDateTime = getMatchDateTime(match.date, match.time);

                if (now >= startDateTime) {
                    match.status = 'ongoing';
                    await match.save();
                    console.log(`Match Started: ${match.homeTeam} vs ${match.awayTeam}`);
                }
            }

            // 2. End Matches (ongoing -> completed)
            // Find matches that are 'ongoing' and (start time + duration + 5 mins grace) has passed
            const ongoingMatches = await Match.find({ status: 'ongoing' });

            for (const match of ongoingMatches) {
                const startDateTime = getMatchDateTime(match.date, match.time);
                const duration = match.duration || 120; // Default 120 mins
                const endDateTime = new Date(startDateTime.getTime() + (duration * 60000) + (5 * 60000)); // +5 mins grace

                if (now >= endDateTime) {
                    match.status = 'completed';
                    await match.save();
                    console.log(`Match Ended: ${match.homeTeam} vs ${match.awayTeam}`);
                }
            }

        } catch (err) {
            console.error('Match Cron Error:', err.message);
        }
    });

    console.log('📅 Match Status Automation Job Started');
};

module.exports = startMatchCron;
