import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

const StadiumList = () => {
    const [stadiums, setStadiums] = useState([]);
    const [filteredStadiums, setFilteredStadiums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStadiums = async () => {
            try {
                const res = await api.get('/stadiums');
                setStadiums(res.data);
                setFilteredStadiums(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchStadiums();
    }, []);

    useEffect(() => {
        const results = stadiums.filter(stadium =>
            stadium.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stadium.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStadiums(results);
    }, [searchTerm, stadiums]);

    if (loading) return <div className="text-center mt-20 text-2xl font-bold text-gray-500">Loading Stadiums...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-4xl font-bold mb-8 text-center text-primary font-heading">Our Stadiums</h2>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-10 relative">
                <input
                    type="text"
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-5 py-3 pl-12 rounded-full border-2 border-gray-200 focus:border-secondary focus:outline-none transition text-lg shadow-sm"
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={24} />
            </div>

            {filteredStadiums.length === 0 ? (
                <div className="text-center text-xl text-gray-500 mt-10">
                    No stadiums found matching "{searchTerm}"
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredStadiums.map(stadium => (
                        <div key={stadium._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition border border-gray-100 group">
                            {/* Placeholder image if none */}
                            <div className="h-52 bg-gray-200 relative overflow-hidden">
                                {stadium.images && stadium.images.length > 0 ? (
                                    <img src={stadium.images[0]} alt={stadium.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 font-bold">No Image</div>
                                )}
                                <span className="absolute top-4 right-4 bg-secondary text-primary px-3 py-1 rounded-full font-bold text-sm shadow-md">
                                    {stadium.capacity.toLocaleString()} Seats
                                </span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold mb-2 text-primary">{stadium.name}</h3>
                                <p className="text-gray-600 mb-4 flex items-center gap-2">
                                    <MapPin size={18} className="text-secondary" /> {stadium.location}
                                </p>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{stadium.description}</p>
                                <Link to={`/stadiums/${stadium._id}`} className="block w-full bg-primary text-white text-center py-3 rounded-lg font-bold hover:bg-blue-900 transition">
                                    View Details & Book
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StadiumList;
