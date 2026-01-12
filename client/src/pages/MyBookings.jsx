import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, MapPin, AlertCircle, Ticket as TicketIcon } from 'lucide-react';
import Ticket from '../components/Ticket';

const MyBookings = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [activeTab, setActiveTab] = useState('active');

    // Helper to check match status
    const getMatchStatus = (match) => {
        if (!match || !match.date || !match.time) return { isStarted: false, isFinished: false };
        const matchDate = new Date(match.date);
        const [hours, minutes] = match.time.split(':');
        matchDate.setHours(parseInt(hours), parseInt(minutes));
        const now = new Date();
        const isStarted = now >= matchDate;
        // Assume match duration ~3 hours (including halftime etc) for "Finished" status logic
        const isFinished = now >= new Date(matchDate.getTime() + 3 * 60 * 60 * 1000) || match.status === 'completed';
        return { isStarted, isFinished };
    };

    // Filter bookings based on active tab
    const displayedBookings = bookings.filter(booking => {
        const match = booking.match || {};
        const { isStarted, isFinished } = getMatchStatus(match);
        const isCancelled = booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'refunded' || match.status === 'cancelled';

        if (activeTab === 'active') {
            // Show: Active Future matches OR Rescheduled matches
            // Hide: Cancelled, Refunded, Finished, Started (if user considers 'started' as not 'upcoming' for booking purposes, but keeping 'Live' in active is usually better UX unless explicitly asked to move. 
            // User request: "Cancelled or started matches should be automatically removed from the user’s My Bookings list".
            // Interpretation: "Removed from list" -> Move to history.

            if (isCancelled) return false;
            if (isFinished) return false;
            if (isStarted) return false; // STRICT REQUIREMENT: Remove started matches from detailed Upcoming list?

            return true;
        } else {
            // History Tab: Finished, Cancelled, Started (if we hide them from Active)
            return isCancelled || isFinished || isStarted;
        }
    });

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/my');
                setBookings(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching bookings:", err);
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) {
        return <div className="text-center py-10 font-bold text-gray-500">Loading your bookings...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-20">
            <h1 className="text-3xl font-bold mb-8 font-heading text-primary">My Bookings</h1>

            {/* Tabs for Active vs History */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`pb-4 px-6 font-bold ${activeTab === 'active' ? 'border-b-4 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('active')}
                >
                    Upcoming & Active
                </button>
                <button
                    className={`pb-4 px-6 font-bold ${activeTab === 'history' ? 'border-b-4 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('history')}
                >
                    History & Cancelled
                </button>
            </div>

            {displayedBookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-10 text-center">
                    <div className="text-6xl mb-4 opacity-20">🎟️</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">
                        {activeTab === 'active' ? 'No Active Bookings' : 'No Booking History'}
                    </h2>
                    <p className="text-gray-500 mb-6">
                        {activeTab === 'active'
                            ? "You don't have any upcoming matches booked."
                            : "You don't have any past or cancelled bookings."}
                    </p>
                    {activeTab === 'active' && (
                        <Link to="/stadiums" className="bg-secondary text-primary px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition inline-block">
                            Browse Matches
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-6">
                    {displayedBookings.map((booking) => {
                        const match = booking.match || {};
                        const { isStarted, isFinished } = getMatchStatus(match);

                        return (
                            <div key={booking._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">
                                <div className="md:flex">
                                    {/* Left Status Bar */}
                                    <div className={`h-2 md:h-auto md:w-3 ${booking.bookingStatus === 'cancelled' ? 'bg-red-500' :
                                        booking.bookingStatus === 'rescheduled' ? 'bg-purple-500' :
                                            booking.bookingStatus === 'refunded' ? 'bg-gray-500' :
                                                isFinished ? 'bg-gray-400' :
                                                    isStarted ? 'bg-orange-500' :
                                                        'bg-green-500'
                                        }`}></div>

                                    <div className="p-6 flex-1">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                        Booking ID: {booking._id.slice(-8).toUpperCase()}
                                                    </span>

                                                    {isStarted && booking.bookingStatus === 'active' && !isFinished && (
                                                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded font-bold border border-orange-200 animate-pulse">
                                                            LIVE NOW
                                                        </span>
                                                    )}

                                                    {isFinished && booking.bookingStatus === 'active' && (
                                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-bold border border-gray-200">
                                                            ENDED
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-bold text-primary">
                                                    {match.homeTeam || 'Unknown Team'} <span className="text-secondary px-1">VS</span> {match.awayTeam || 'Unknown Team'}
                                                </h3>
                                            </div>

                                            <div className="mt-2 md:mt-0 flex items-center gap-2">
                                                {/* Status Badges */}
                                                {booking.bookingStatus === 'cancelled' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold border border-red-200">Cancelled</span>}
                                                {booking.bookingStatus === 'rescheduled' && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold border border-purple-200">Rescheduled</span>}
                                                {booking.bookingStatus === 'refunded' && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold border border-gray-200">Refunded</span>}
                                                {booking.bookingStatus === 'active' && !isStarted && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200">Confirmed</span>}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar size={18} className="text-secondary" />
                                                <span>{match.date ? new Date(match.date).toLocaleDateString() : 'Date Unavailable'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock size={18} className="text-secondary" />
                                                <span>{match.time || 'Time Unavailable'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin size={18} className="text-secondary" />
                                                <span className="truncate">{match.stadium ? match.stadium.name : 'Stadium Unavailable'}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {booking.seats.map(seat => (
                                                <span key={seat} className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-mono text-sm border border-gray-200">
                                                    Seat {seat}
                                                </span>
                                            ))}
                                            <span className="ml-auto font-bold text-lg text-primary">
                                                To Pay: ${booking.totalAmount}
                                            </span>
                                        </div>

                                        {/* Notifications / Alerts Section */}
                                        {booking.bookingStatus === 'cancelled' && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex items-start gap-2">
                                                <AlertCircle size={18} className="text-red-600 mt-0.5" />
                                                <div>
                                                    <p className="text-red-800 font-bold text-sm">Match Cancelled</p>
                                                    <p className="text-red-700 text-xs mt-1">
                                                        This match has been cancelled. Check your notifications for refund/reschedule details.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {booking.bookingStatus === 'rescheduled' && (
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3 flex items-start gap-2">
                                                <AlertCircle size={18} className="text-purple-600 mt-0.5" />
                                                <div>
                                                    <p className="text-purple-800 font-bold text-sm">Match Rescheduled</p>
                                                    <p className="text-purple-700 text-xs mt-1">
                                                        Your booking has been transferred to the rescheduled match.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            {(booking.bookingStatus === 'active' || booking.bookingStatus === 'rescheduled') && !isFinished && (
                                                <button
                                                    onClick={() => setSelectedTicket({ booking, match })}
                                                    className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition shadow-md"
                                                >
                                                    <TicketIcon size={18} /> View Ticket
                                                </button>
                                            )}

                                            {/* Delete Button ONLY for History Tab (Finished/Cancelled/Refunded) */}
                                            {activeTab === 'history' && (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to remove this booking from your history?')) {
                                                            try {
                                                                await api.delete(`/bookings/${booking._id}`);
                                                                setBookings(bookings.filter(b => b._id !== booking._id));
                                                            } catch (err) {
                                                                alert(err.response?.data?.msg || 'Failed to delete booking');
                                                            }
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition"
                                                >
                                                    Remove from History
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Ticket Modal */}
            {selectedTicket && (
                <Ticket
                    booking={selectedTicket.booking}
                    match={selectedTicket.match}
                    onClose={() => setSelectedTicket(null)}
                />
            )}
        </div>
    );
};

export default MyBookings;
