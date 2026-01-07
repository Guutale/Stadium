import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/my');
                setBookings(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) return <div className="text-center mt-20">Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-primary">My Bookings</h1>
            {bookings.length === 0 ? (
                <p className="text-gray-500 text-lg">You haven't booked any tickets yet.</p>
            ) : (
                <div className="space-y-4">
                    {bookings.map(booking => (
                        <div key={booking._id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-1">
                                    {booking.match.homeTeam || 'Team A'} vs {booking.match.awayTeam || 'Team B'}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {new Date(booking.match.date).toLocaleDateString()} | {booking.match.time}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">Stadium: {booking.match.stadium.name || 'Stadium'}</p>
                            </div>

                            <div className="flex gap-8 text-center">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Seats</p>
                                    <p className="font-bold">{booking.seats.join(', ')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Amount</p>
                                    <p className="font-bold text-primary">${booking.totalAmount}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold capitalize ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                            booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {booking.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
