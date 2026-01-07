import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            setBookings(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            // Assuming we have an endpoint for this, we missed adding distinct status update in controller separate from overall update
            // But we can use the generic update if we had one. 
            // Actually, we implemented updateBookingStatus in controller but didn't explicitly route it uniquely or it might be PUT /:id
            // Let's check routes. bookings.js has PUT /:id -> bookingController.updateBookingStatus

            await api.put(`/bookings/${id}`, { paymentStatus: status });
            setBookings(bookings.map(b => b._id === id ? { ...b, paymentStatus: status } : b));
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Booking Management</h1>

            <div className="bg-admin-card rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-800 text-gray-200 uppercase text-sm">
                        <tr>
                            <th className="p-4 border-b border-gray-700 font-bold">User</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Event</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Seats</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Amount</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Status</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {bookings.map(booking => (
                            <tr key={booking._id} className="hover:bg-gray-800 transition border-b border-gray-700 last:border-0">
                                <td className="p-4">
                                    <div className="font-bold text-white">
                                        {booking.user?.isDeleted ?
                                            <span className="text-gray-500">(Deleted User)</span> :
                                            (booking.user?.username || 'Unknown')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {booking.user?.isDeleted ?
                                            <span>(Account removed)</span> :
                                            booking.user?.email}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {booking.match?.homeTeam} vs {booking.match?.awayTeam}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {booking.seats.map(seat => (
                                            <span key={seat} className="px-1.5 py-0.5 bg-gray-700 rounded text-xs text-white">{seat}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 text-green-400 font-bold">${booking.totalAmount}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${booking.paymentStatus === 'paid' ? 'bg-green-900 text-green-300' :
                                        booking.paymentStatus === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                                        }`}>
                                        {booking.paymentStatus}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <select
                                        value={booking.paymentStatus}
                                        onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                                        className="bg-gray-800 border-gray-600 rounded p-1 text-sm text-white focus:ring-1 focus:ring-admin-accent"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminBookings;
