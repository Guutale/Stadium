import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col gap-12">
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
                        <Link to="/register" className="bg-transparent border-2 border-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition">
                            Sign Up Now
                        </Link>
                    </div>
                </div>
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-800 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-600 rounded-full opacity-50 blur-3xl"></div>
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
