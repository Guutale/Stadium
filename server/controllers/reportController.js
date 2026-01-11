const Booking = require('../models/Booking');
const Stadium = require('../models/Stadium');
const Payment = require('../models/Payment');
const Match = require('../models/Match');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const totalStadiums = await Stadium.countDocuments();
        const totalMatches = await Match.countDocuments();
        const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });

        // Calculate tickets sold from bookings
        const ticketsResult = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: { $size: '$seats' } } } }
        ]);
        const ticketsSold = ticketsResult.length > 0 ? ticketsResult[0].total : 0;

        // Sum total revenue from successful bookings
        const revenueResult = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            totalBookings,
            totalStadiums,
            totalMatches,
            totalUsers,
            ticketsSold,
            totalRevenue
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getRevenueChart = async (req, res) => {
    try {
        // Daily revenue for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const data = await Payment.aggregate([
            { $match: { status: 'success', date: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getStadiumPopularity = async (req, res) => {
    try {
        // Top 5 stadiums by number of bookings
        // We need to look up match -> stadium
        const data = await Booking.aggregate([
            {
                $lookup: {
                    from: 'matches',
                    localField: 'match',
                    foreignField: '_id',
                    as: 'matchInfo'
                }
            },
            { $unwind: '$matchInfo' },
            {
                $group: {
                    _id: '$matchInfo.stadium',
                    bookingsCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'stadia', // Mongoose mimics pluralization, usually 'stadia' or 'stadiums' depending on config. Let's assume default 'stadia' or check model.
                    localField: '_id',
                    foreignField: '_id',
                    as: 'stadiumInfo'
                }
            },
            { $unwind: '$stadiumInfo' },
            {
                $project: {
                    name: '$stadiumInfo.name',
                    bookings: '$bookingsCount'
                }
            },
            { $sort: { bookings: -1 } },
            { $limit: 5 }
        ]);

        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
exports.getDetailedReports = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = {};

        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // 1. Booking Status Distribution
        const bookingStatus = await Booking.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 2. Revenue by Payment Method
        const paymentMethodRevenue = await Payment.aggregate([
            {
                $match: {
                    status: 'success',
                    ...(startDate && endDate ? {
                        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    } : {})
                }
            },
            { $group: { _id: '$method', total: { $sum: '$amount' } } }
        ]);

        // 3. User Registration Trend (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 4. Booking Trends (Daily for selected range or last 30 days)
        const trendStart = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const bookingTrends = await Booking.aggregate([
            { $match: { createdAt: { $gte: trendStart } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);


        res.json({
            bookingStatus,
            paymentMethodRevenue,
            userGrowth,
            bookingTrends
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
