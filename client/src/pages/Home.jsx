import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Search, MapPin, ChevronRight, Share2, Shield, Clock, CreditCard, Ticket, Bell } from 'lucide-react';

const Home = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [matches, setMatches] = useState([]);
    const [stadiums, setStadiums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const matchesRes = await api.get('/matches');
                const stadiumsRes = await api.get('/stadiums');

                // Filter matches: Future dates only AND not cancelled
                const upcoming = matchesRes.data.filter(match => {
                    const matchDate = new Date(match.date);
                    const now = new Date();
                    // Check if match is in the future (including today if time hasn't passed, though simplified here to date)
                    // Better: Check exact time if available, or just keeping date logic for now:
                    // Only show matches where date >= today (ignoring time for simplicity in "Upcoming" generally, but strict "Started" removal requested)

                    // Strict "Started" check:
                    let isStarted = false;
                    if (match.time) {
                        const [hours, minutes] = match.time.split(':');
                        const matchDateTime = new Date(matchDate);
                        matchDateTime.setHours(parseInt(hours), parseInt(minutes));
                        isStarted = now >= matchDateTime;
                    } else {
                        isStarted = now >= matchDate.setHours(0, 0, 0, 0);
                    }

                    return !isStarted && match.status !== 'cancelled';
                });

                upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
                setMatches(upcoming);
                setStadiums(stadiumsRes.data.slice(0, 3)); // Featured stadiums
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter matches
    const filteredMatches = matches.filter(match =>
        match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* 1. Hero Section */}
            <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/stadium-hero-v2.png"
                        alt="Stadium Atmosphere"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-lg font-heading">
                        Book Your <span className="text-yellow-400">Stadium Seat</span>.<br />
                        Experience the Match Live.
                    </h1>
                    <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto drop-shadow-md">
                        Secure online bookings for top football matches. Trusted payments, real-time updates, and unforgettable moments.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <a href="#matches" className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition transform hover:scale-105 shadow-xl">
                            View Upcoming Matches
                        </a>
                        <Link to="/stadiums" className="bg-transparent border-2 border-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-gray-900 transition shadow-xl">
                            Explore Stadiums
                        </Link>
                    </div>
                </div>
            </section>

            {/* 6. Live / Highlighted Match (Banner) - Showing first big match if available */}
            {matches.length > 0 && (
                <div className="bg-blue-900 text-white py-4 overflow-hidden shadow-lg border-b-4 border-yellow-500">
                    <div className="container mx-auto px-4 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-4">
                            <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Featured Match</span>
                            <span className="font-bold text-lg hidden md:inline">{matches[0].homeTeam} vs {matches[0].awayTeam}</span>
                        </div>
                        <div className="text-yellow-400 font-bold flex items-center gap-2">
                            <Clock size={18} />
                            <span>Coming Soon: {new Date(matches[0].date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Upcoming Matches Section */}
            <section id="matches" className="py-20 container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-2 font-heading">Upcoming Matches</h2>
                        <p className="text-gray-600 text-lg">Don't miss the action. Secure your spot now.</p>
                    </div>
                    <div className="relative hidden md:block w-96">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search matches..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading matches...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMatches.slice(0, 6).map(match => (
                            <div key={match._id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100 flex flex-col">
                                <div className="p-6 bg-gradient-to-br from-gray-900 to-blue-900 text-white relative h-48 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {match.competitionType || 'Match Day'}
                                        </span>
                                        <span className="text-yellow-400 font-bold flex items-center gap-1">
                                            <Share2 size={16} />
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center w-full mt-4">
                                        <div className="text-center w-1/3">
                                            <div className="w-12 h-12 bg-white text-gray-900 mx-auto rounded-full flex items-center justify-center font-bold text-xl mb-2">{match.homeTeam.charAt(0)}</div>
                                            <p className="font-bold text-sm truncate">{match.homeTeam}</p>
                                        </div>
                                        <div className="text-center w-1/3">
                                            <span className="text-2xl font-bold text-yellow-500">VS</span>
                                        </div>
                                        <div className="text-center w-1/3">
                                            <div className="w-12 h-12 bg-white text-gray-900 mx-auto rounded-full flex items-center justify-center font-bold text-xl mb-2">{match.awayTeam.charAt(0)}</div>
                                            <p className="font-bold text-sm truncate">{match.awayTeam}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                                            <MapPin size={18} className="text-primary" />
                                            <span className="font-medium text-sm">{match.stadium ? match.stadium.name : 'Stadium TBD'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock size={18} className="text-primary" />
                                            <span className="font-medium text-sm">{new Date(match.date).toLocaleDateString()} at {match.time}</span>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/matches/${match._id}`}
                                        className="w-full bg-primary text-white py-3 rounded-xl font-bold text-center hover:bg-blue-800 transition flex items-center justify-center gap-2 group-hover:bg-secondary group-hover:text-primary"
                                    >
                                        Book Now <ChevronRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {filteredMatches.length > 6 && (
                    <div className="text-center mt-12">
                        <button className="text-primary font-bold border-b-2 border-primary hover:text-blue-800 transition">View All Matches</button>
                    </div>
                )}
            </section>

            {/* 3. Featured Stadiums */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center font-heading">Featured Stadiums</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stadiums.map((stadium, index) => (
                            <div key={stadium._id || index} className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer h-96">
                                <img
                                    src="https://images.unsplash.com/photo-1522778119026-d647f0565c71?auto=format&fit=crop&q=80&w=1000" // Placeholder for now, ideally dynamic
                                    alt={stadium.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end">
                                    <h3 className="text-2xl font-bold text-white mb-2">{stadium.name}</h3>
                                    <p className="text-gray-300 mb-4">{stadium.location}</p>
                                    <p className="text-yellow-400 font-bold text-sm mb-6 flex items-center gap-2">
                                        <Ticket size={16} /> Capacity: {stadium.capacity}
                                    </p>
                                    <Link to={`/stadiums/${stadium._id}`} className="inline-block bg-white text-gray-900 px-6 py-2 rounded-full font-bold text-sm text-center hover:bg-gray-200 transition">
                                        View Matches
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. How It Works - Step-based */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold mb-4 font-heading">Three Simple Steps</h2>
                        <p className="text-gray-400 text-lg">We've streamlined the booking process so you can focus on the game.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gray-700 -z-0"></div>

                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-gray-900">
                                <Search size={40} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">1. Select Event</h3>
                            <p className="text-gray-400">Browse upcoming matches and choose your favorite team.</p>
                        </div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-gray-900">
                                <CreditCard size={40} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">2. Secure Payment</h3>
                            <p className="text-gray-400">Choose your seat and pay safely with our secure gateway.</p>
                        </div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-gray-900">
                                <Ticket size={40} className="text-gray-900" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">3. Get Ticket</h3>
                            <p className="text-gray-400">Receive your digital ticket instantly via email or download.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Why Choose Us */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-16 font-heading">Why Fans Trust Us</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="p-6 bg-white rounded-xl shadow-lg border-b-4 border-primary">
                            <Shield size={48} className="text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">100% Secure</h3>
                            <p className="text-sm text-gray-500">Verified tickets and encrypted payments.</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-lg border-b-4 border-green-500">
                            <Clock size={48} className="text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Instant Booking</h3>
                            <p className="text-sm text-gray-500">No waiting. Get your tickets immediately.</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-lg border-b-4 border-yellow-500">
                            <Ticket size={48} className="text-yellow-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Official Partner</h3>
                            <p className="text-sm text-gray-500">Directly connected to stadium systems.</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-lg border-b-4 border-red-500">
                            <Bell size={48} className="text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Real-time Updates</h3>
                            <p className="text-sm text-gray-500">Get notified about match changes instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Notifications Preview (Static Mockup) */}
            <section className="py-12 bg-white border-t">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 bg-blue-50 p-8 rounded-2xl border border-blue-100">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-600 text-white p-2 rounded-lg">
                                    <Bell size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">Stay Updated</h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Join thousands of fans who get instant alerts on match schedules, ticket availability, and exclusive offers.
                            </p>
                            <Link to="/register" className="text-primary font-bold hover:underline">
                                Create an account to subscribe &rarr;
                            </Link>
                        </div>
                        <div className="w-full md:w-1/3 space-y-3 opacity-80">
                            <div className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Booking Confirmed: RMA vs FCB</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Match Rescheduled: LIV vs ARS</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
