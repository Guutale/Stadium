import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const StadiumDetails = () => {
    const { id } = useParams();
    const [stadium, setStadium] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stadiumRes = await api.get(`/stadiums/${id}`);
                const matchesRes = await api.get(`/matches?stadium=${id}`);
                setStadium(stadiumRes.data);
                setMatches(matchesRes.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="text-center mt-20">Loading...</div>;
    if (!stadium) return <div className="text-center mt-20">Stadium not found</div>;

    return (
        <div>
            {/* Stadium Info */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="h-64 bg-gray-300 relative">
                    {stadium.images && stadium.images.length > 0 && (
                        <img src={stadium.images[0]} alt={stadium.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent w-full p-8 text-white">
                        <h1 className="text-4xl font-bold font-heading">{stadium.name}</h1>
                        <p className="text-lg">📍 {stadium.location}</p>
                    </div>
                </div>
                <div className="p-8">
                    <p className="text-gray-700 text-lg mb-4">{stadium.description}</p>
                    <div className="flex gap-4">
                        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold">Capacity: {stadium.capacity.toLocaleString()}</span>
                        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">Status: {stadium.status}</span>
                    </div>
                </div>
            </div>

            {/* Matches List */}
            <h2 className="text-3xl font-bold mb-6 text-primary">Upcoming Matches</h2>

            {matches.length === 0 ? (
                <p className="text-gray-500 text-lg">No upcoming matches scheduled for this stadium.</p>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {matches
                        .filter(match => match.status === 'upcoming' && !match.matchStarted && !match.bookingClosed)
                        .map(match => (
                            <div key={match._id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-secondary hover:shadow-xl transition flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{match.homeTeam} <span className="text-secondary">vs</span> {match.awayTeam}</h3>
                                    <p className="text-gray-600">📅 {new Date(match.date).toLocaleDateString()} | ⏰ {match.time}</p>
                                    <p className="text-sm text-gray-500 mt-2">{match.description}</p>
                                </div>
                                <Link to={`/matches/${match._id}`} className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 transition">
                                    Book Ticket
                                </Link>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default StadiumDetails;
