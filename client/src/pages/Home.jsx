import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Search, Calendar, MapPin } from 'lucide-react';

const Home = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [matches, setMatches] = useState([]);
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [stadiumFilter, setStadiumFilter] = useState('');

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await api.get('/matches');
                // Filter out past matches initially
                const upcoming = res.data.filter(match => new Date(match.date) >= new Date().setHours(0, 0, 0, 0));

                // Sort by date nearest first
                upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

                setMatches(upcoming);
                setFilteredMatches(upcoming);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching matches:", err);
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    useEffect(() => {
        let result = matches;

        // Filter by Team Name (Home or Away)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(match =>
                match.homeTeam.toLowerCase().includes(term) ||
                match.awayTeam.toLowerCase().includes(term)
            );
        }

        // Filter by Specific Date
        if (dateFilter) {
            result = result.filter(match => {
                const matchDate = new Date(match.date).toISOString().split('T')[0];
                return matchDate === dateFilter;
            });
        }

        // Filter by Stadium Name
        if (stadiumFilter) {
            const term = stadiumFilter.toLowerCase();
            result = result.filter(match =>
                match.stadium && match.stadium.name.toLowerCase().includes(term)
            );
        }

        setFilteredMatches(result);
    }, [searchTerm, dateFilter, stadiumFilter, matches]);

    return (
        <div className="flex flex-col gap-12 pb-12">
            {/* Hero Section */}
            <section className="bg-primary text-white rounded-2xl p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-5xl font-bold mb-6 font-heading">Book Your Seat for the Big Match</h1>
                    <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-200">
                        Experience the thrill of live sports. Secure your spot in the stadium effortlessly with our online booking system.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/stadiums" className="bg-secondary text-primary px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 transition transform hover:scale-105 shadow-lg">
                            Find Tickets
                        </Link>
                        {!isAuthenticated && (
                            <Link to="/register" className="bg-transparent border-2 border-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition">
                                Sign Up Now
                            </Link>
                        )}
                        {isAuthenticated && (
                            <Link to="/my-bookings" className="bg-transparent border-2 border-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition">
                                My Bookings
                            </Link>
                        )}
                    </div>
                </div>
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-800 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-600 rounded-full opacity-50 blur-3xl"></div>
            </section>

            {/* Upcoming Matches Section with Search */}
            <section>
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-3xl font-bold text-primary font-heading">Upcoming Matches</h2>

                    {/* Search Controls */}
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Teams..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-secondary w-full md:w-64"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Stadium..."
                                value={stadiumFilter}
                                onChange={(e) => setStadiumFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-secondary w-full md:w-48"
                            />
                            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                        <div className="relative">
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-secondary w-full md:w-auto text-gray-600"
                            />
                            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                        {(searchTerm || dateFilter || stadiumFilter) && (
                            <button
                                onClick={() => { setSearchTerm(''); setDateFilter(''); setStadiumFilter(''); }}
                                className="text-sm text-red-500 hover:text-red-700 underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 font-bold text-gray-500">Loading matches...</div>
                ) : filteredMatches.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-xl text-gray-500 font-bold mb-2">No upcoming matches found</p>
                        <p className="text-gray-400">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMatches.map(match => (
                            <div key={match._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition border border-gray-100 group">
                                <div className="h-3 bg-secondary w-full"></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4 text-sm text-gray-500 font-bold">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(match.date).toLocaleDateString()}</span>
                                        <span>{match.time}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-center text-primary">
                                        {match.homeTeam} <span className="text-secondary text-lg px-2">VS</span> {match.awayTeam}
                                    </h3>

                                    <div className="flex items-center gap-2 mb-6 justify-center text-gray-600 bg-gray-50 py-2 rounded-lg">
                                        <MapPin size={16} />
                                        <span className="font-medium text-sm">
                                            {match.stadium ? match.stadium.name : 'Unknown Stadium'}
                                        </span>
                                    </div>

                                    <Link to={`/matches/${match._id}`} className="block w-full bg-primary text-white text-center py-3 rounded-lg font-bold hover:bg-blue-900 transition transform group-hover:scale-105">
                                        Book Tickets
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Features Section */}
            <section className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-secondary text-center hover:shadow-2xl transition">
                    <div className="text-4xl mb-4">🏟️</div>
                    <h3 className="text-2xl font-bold mb-2">World Class Stadiums</h3>
                    <p className="text-gray-600">Browse through top-tier venues and choose your preferred location.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-primary text-center hover:shadow-2xl transition">
                    <div className="text-4xl mb-4">🎟️</div>
                    <h3 className="text-2xl font-bold mb-2">Easy Booking</h3>
                    <p className="text-gray-600">Select your seat from an interactive map and pay securely online.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-secondary text-center hover:shadow-2xl transition">
                    <div className="text-4xl mb-4">📱</div>
                    <h3 className="text-2xl font-bold mb-2">Instant Access</h3>
                    <p className="text-gray-600">Receive your digital ticket immediately and skip the queue.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
