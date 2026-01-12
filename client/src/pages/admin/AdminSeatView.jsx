import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import SeatMap from '../../components/SeatMap';

const AdminSeatView = () => {
    const { id } = useParams(); // Match ID
    const [match, setMatch] = useState(null);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatchAndSeats = async () => {
            try {
                const res = await api.get(`/matches/${id}`);
                setMatch(res.data);
                setBookedSeats(res.data.bookedSeats || []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchMatchAndSeats();
    }, [id]);

    if (loading) return <div className="text-white">Loading Seat Map...</div>;
    if (!match) return <div className="text-white">Match not found</div>;

    // Calculate seat statistics
    const vipSeats = bookedSeats.filter(seat => seat.startsWith('A') || seat.startsWith('B'));
    const regularSeats = bookedSeats.filter(seat => !seat.startsWith('A') && !seat.startsWith('B'));

    const totalVipSeats = 20; // 2 rows (A, B) * 10 seats each
    const totalRegularSeats = 80; // 8 rows (C-J) * 10 seats each

    const vipBooked = vipSeats.length;
    const vipAvailable = totalVipSeats - vipBooked;
    const regularBooked = regularSeats.length;
    const regularAvailable = totalRegularSeats - regularBooked;

    const vipPercentage = (vipBooked / totalVipSeats) * 100;
    const regularPercentage = (regularBooked / totalRegularSeats) * 100;

    const totalRevenue = vipSeats.reduce((acc) => acc + match.vipPrice, 0) +
        regularSeats.reduce((acc) => acc + match.regularPrice, 0);

    return (
        <div className="text-white">
            <h1 className="text-3xl font-bold mb-6">Seat Overview: {match.homeTeam} vs {match.awayTeam}</h1>

            {/* Seat Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* VIP Seats */}
                <div className="bg-yellow-900/30 border border-yellow-700 p-6 rounded-xl">
                    <h3 className="text-yellow-400 font-bold text-lg mb-4">🏆 VIP Seats</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Booked:</span>
                            <span className="font-bold text-yellow-400">{vipBooked} / {totalVipSeats}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Available:</span>
                            <span className="font-bold text-green-400">{vipAvailable}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-yellow-500 h-full transition-all duration-500"
                                style={{ width: `${vipPercentage}%` }}
                            ></div>
                        </div>
                        <div className="text-center text-xs text-gray-400">{vipPercentage.toFixed(1)}% Occupied</div>
                    </div>
                </div>

                {/* Regular Seats */}
                <div className="bg-blue-900/30 border border-blue-700 p-6 rounded-xl">
                    <h3 className="text-blue-400 font-bold text-lg mb-4">🎫 Regular Seats</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Booked:</span>
                            <span className="font-bold text-blue-400">{regularBooked} / {totalRegularSeats}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Available:</span>
                            <span className="font-bold text-green-400">{regularAvailable}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-blue-500 h-full transition-all duration-500"
                                style={{ width: `${regularPercentage}%` }}
                            ></div>
                        </div>
                        <div className="text-center text-xs text-gray-400">{regularPercentage.toFixed(1)}% Occupied</div>
                    </div>
                </div>

                {/* Total Summary */}
                <div className="bg-green-900/30 border border-green-700 p-6 rounded-xl">
                    <h3 className="text-green-400 font-bold text-lg mb-4">💰 Revenue Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Total Booked:</span>
                            <span className="font-bold text-white">{bookedSeats.length} / 100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Total Revenue:</span>
                            <span className="font-bold text-green-400">${totalRevenue}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">VIP Revenue:</span>
                            <span className="text-yellow-400">${vipBooked * match.vipPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Regular Revenue:</span>
                            <span className="text-blue-400">${regularBooked * match.regularPrice}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seat Map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-4 rounded-xl text-gray-800">
                    <SeatMap
                        bookedSeats={bookedSeats}
                        selectedSeats={[]}
                        onSeatSelect={() => { }}
                        vipPrice={match.vipPrice}
                        regularPrice={match.regularPrice}
                    />
                </div>
                <div className="bg-admin-card p-6 rounded-xl shadow-lg border border-gray-700 h-fit">
                    <h3 className="font-bold mb-4 text-xl">Match Details</h3>
                    <p className="mb-2"><span className="text-gray-400">Stadium:</span> {match.stadium?.name || 'Unknown'}</p>
                    <p className="mb-2"><span className="text-gray-400">Date:</span> {new Date(match.date).toLocaleDateString()}</p>
                    <p className="mb-2"><span className="text-gray-400">Time:</span> {match.time}</p>
                    <p className="mb-2"><span className="text-gray-400">Status:</span> <span className="capitalize">{match.status}</span></p>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">Pricing</p>
                        <p className="mb-1"><span className="text-yellow-400">VIP:</span> ${match.vipPrice}</p>
                        <p><span className="text-blue-400">Regular:</span> ${match.regularPrice}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSeatView;
