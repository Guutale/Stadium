import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const MatchDetails = () => {
    const { id } = useParams();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const res = await api.get(`/matches/${id}`);
                setMatch(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load match details');
                setLoading(false);
            }
        };
        fetchMatch();
    }, [id]);

    if (loading) return <div className="text-center mt-20">Loading...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
    if (!match) return <div className="text-center mt-20">Match not found</div>;

    // Use fetched prices or existing ones
    const vipPrice = match.vipPrice || 0;
    const regularPrice = match.regularPrice || 0;

    // Booking closure status from backend
    const isBookingClosed = match.bookingClosed || false;
    const isMatchStarted = match.matchStarted || false;
    const minutesUntilClosure = match.minutesUntilClosure || 0;
    const minutesUntilStart = match.minutesUntilStart || 0;

    // Determine if booking button should be disabled
    const isBookingDisabled = isBookingClosed || match.status === 'cancelled';

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-primary to-blue-900 p-12 text-center text-white relative">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 font-heading">
                        {match.homeTeam} <span className="text-secondary">VS</span> {match.awayTeam}
                    </h1>
                    <p className="text-xl opacity-90">
                        {new Date(match.date).toLocaleDateString()} | {match.time}
                        {match.competitionType && match.competitionType !== 'Other' && (
                            <span className="ml-3 px-3 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full uppercase tracking-wider">
                                {match.competitionType}
                            </span>
                        )}
                    </p>
                    {/* Decorative Circle */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                </div>

                <div className="p-8 lg:p-12">
                    {/* Booking Closure Warnings */}
                    {match.status === 'cancelled' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800 font-semibold text-lg mb-1">⚠️ Match Cancelled</p>
                            <p className="text-red-700 text-sm">
                                This match has been cancelled. Booking is not available.
                                {match.rescheduledTo && ' Please check for the rescheduled match.'}
                            </p>
                        </div>
                    )}

                    {!isBookingClosed && minutesUntilClosure > 0 && minutesUntilClosure <= 30 && match.status !== 'cancelled' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-yellow-800 font-semibold text-lg mb-1">⏰ Booking Closes Soon</p>
                            <p className="text-yellow-700 text-sm">
                                Bookings will close in <strong>{minutesUntilClosure} minute(s)</strong> (10 minutes before match start).
                                Book your tickets now!
                            </p>
                        </div>
                    )}

                    {isBookingClosed && !isMatchStarted && match.status !== 'cancelled' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                            <p className="text-orange-800 font-semibold text-lg mb-1">🚫 Booking Closed</p>
                            <p className="text-orange-700 text-sm">
                                The booking window has closed. Match starts in <strong>{minutesUntilStart} minute(s)</strong>.
                                Bookings close 10 minutes before match start to ensure smooth operations.
                            </p>
                        </div>
                    )}

                    {isMatchStarted && match.status !== 'cancelled' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800 font-semibold text-lg mb-1">🏟️ Match Has Started</p>
                            <p className="text-red-700 text-sm">
                                This match has already started. Booking is no longer available.
                            </p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">Match Information</h2>
                            <ul className="space-y-4 text-lg">
                                <li className="flex items-start">
                                    <span className="mr-3">📍</span>
                                    <span>
                                        <strong>Stadium:</strong><br />
                                        {match.stadium?.name || "Stadium Name"}
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-3">🗺️</span>
                                    <span>
                                        <strong>Location:</strong><br />
                                        {match.stadium?.location || "Location"}
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-3">📝</span>
                                    <span>
                                        <strong>Description:</strong><br />
                                        {match.description || "No description available."}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">Ticket Pricing</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div>
                                        <h3 className="font-bold text-xl text-yellow-800">VIP Ticket</h3>
                                        <p className="text-sm text-yellow-700">Premium seating (Rows A-B)</p>
                                    </div>
                                    <span className="text-2xl font-bold text-yellow-900">${vipPrice}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-800">Regular Ticket</h3>
                                        <p className="text-sm text-gray-600">Standard seating</p>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">${regularPrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">Stadium Rules & Policies</h2>
                        <div className="bg-gray-50 p-6 rounded-lg text-gray-700 space-y-2">
                            <p>• Entry requires a valid ticket (digital or printed).</p>
                            <p>• No outside food or beverages allowed.</p>
                            <p>• Security checks will be conducted at the entrance.</p>
                            <p>• Respectful behavior is expected at all times.</p>
                            <p>• Smoking is prohibited in seating areas.</p>
                            <p>• <strong>Bookings close 10 minutes before match start.</strong></p>
                            {match.matchRules && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h3 className="font-bold text-lg mb-2 text-gray-800">Special Event Rules:</h3>
                                    <p className="whitespace-pre-line sm:text-sm">{match.matchRules}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center">
                        {isBookingDisabled ? (
                            <button
                                disabled
                                className="inline-block bg-gray-400 text-gray-700 px-12 py-4 rounded-full font-bold text-xl shadow-lg cursor-not-allowed opacity-60"
                            >
                                {match.status === 'cancelled' ? 'Match Cancelled' :
                                    isMatchStarted ? 'Match Started' :
                                        'Booking Closed'}
                            </button>
                        ) : (
                            <Link
                                to={`/matches/${id}/book`}
                                className="inline-block bg-secondary text-primary px-12 py-4 rounded-full font-bold text-xl shadow-lg hover:bg-yellow-400 transform hover:scale-105 transition"
                            >
                                Book Ticket Now
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchDetails;
