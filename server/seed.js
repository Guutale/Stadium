const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stadium = require('./models/Stadium');
const Match = require('./models/Match');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/online_stadium_management')
    .then(() => console.log("MongoDB connected for seeding"))
    .catch((error) => console.error("MongoDB Connection Error:", error));

const seedData = async () => {
    try {
        await Stadium.deleteMany({});
        await Match.deleteMany({});

        const stadiums = await Stadium.insertMany([
            {
                name: 'Mogadishu Stadium',
                location: 'Mogadishu, Somalia',
                capacity: 65000,
                images: ['https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mogadishu_Stadium.jpg/1200px-Mogadishu_Stadium.jpg'],
                vipPrice: 20,
                regularPrice: 5
            },
            {
                name: 'Banadir Stadium',
                location: 'Mogadishu, Somalia',
                capacity: 15000,
                images: ['https://pbs.twimg.com/media/FjqvzDZXEAEXXx_.jpg'],
                vipPrice: 15,
                regularPrice: 3
            },
            {
                name: 'Eng Yariisow Stadium',
                location: 'Mogadishu, Somalia',
                capacity: 20000,
                images: ['https://i.ytimg.com/vi/W5X2g8X6nKg/maxresdefault.jpg'],
                vipPrice: 10,
                regularPrice: 2
            }
        ]);

        console.log(`${stadiums.length} stadiums created.`);

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const matches = await Match.insertMany([
            {
                stadium: stadiums[0]._id,
                homeTeam: 'Horseed FC',
                awayTeam: 'Elman FC',
                date: tomorrow,
                time: '15:30',
                ticketPrice: 5,
                status: 'upcoming',
                description: 'Somali Premier League Derby'
            },
            {
                stadium: stadiums[0]._id,
                homeTeam: 'Mogadishu City Club',
                awayTeam: 'Heegan FC',
                date: nextWeek,
                time: '16:00',
                ticketPrice: 7,
                status: 'upcoming',
                description: 'Championship Final'
            },
            {
                stadium: stadiums[1]._id,
                homeTeam: 'Dekedda SC',
                awayTeam: 'Jeenyo United',
                date: tomorrow,
                time: '14:00',
                ticketPrice: 3,
                status: 'upcoming',
                description: 'Friendly Match'
            }
        ]);

        console.log(`${matches.length} matches created.`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
