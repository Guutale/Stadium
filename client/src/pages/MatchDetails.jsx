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

    // Use fetched prices or existing ones if migration hasn't run fully (though model defaults should handle)
    const vipPrice = match.vipPrice || 0;
    const regularPrice = match.regularPrice || 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-primary to-blue-900 p-12 text-center text-white relative">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 font-heading">
                        {match.homeTeam} <span className="text-secondary">VS</span> {match.awayTeam}
                    </h1>
                    <p className="text-xl opacity-90">
                        {new Date(match.date).toLocaleDateString()} | {match.time}
                    </p>
                    {/* Decorative Circle */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                </div>

                <div className="p-8 lg:p-12">
                    <div className="grid md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">Match Information</h2>
                            <ul className="space-y-4 text-lg">
                                <li className="flex items-start">
                                    <span className="mr-3">📍</span>
                                    <span>
                                        <strong>Stadium:</strong><br />
                                        {/* Assuming match populated stadium, otherwise just ID. 
                                            Controller populate usually includes name. 
                                            If not, might need a check. 
                                            bookingController populated it. matchController getMatch might need populate.
                                        */}
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
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            to={`/matches/${id}/book`}
                            className="inline-block bg-secondary text-primary px-12 py-4 rounded-full font-bold text-xl shadow-lg hover:bg-yellow-400 transform hover:scale-105 transition"
                        >
                            Book Ticket Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchDetails;
