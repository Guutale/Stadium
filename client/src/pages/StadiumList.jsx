import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const StadiumList = () => {
    const [stadiums, setStadiums] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStadiums = async () => {
            try {
                const res = await api.get('/stadiums');
                setStadiums(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchStadiums();
    }, []);

    if (loading) return <div className="text-center mt-20 text-2xl font-bold text-gray-500">Loading Stadiums...</div>;

    return (
        <div>
            <h2 className="text-4xl font-bold mb-8 text-center text-primary font-heading">Our Stadiums</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stadiums.map(stadium => (
                    <div key={stadium._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition border border-gray-100">
                        {/* Placeholder image if none */}
                        <div className="h-48 bg-gray-300 relative">
                            {stadium.images && stadium.images.length > 0 ? (
                                <img src={stadium.images[0]} alt={stadium.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 font-bold">No Image</div>
                            )}
                            <span className="absolute top-4 right-4 bg-secondary text-primary px-3 py-1 rounded-full font-bold text-sm">
                                {stadium.capacity.toLocaleString()} Seats
                            </span>
                        </div>
                        <div className="p-6">
                            <h3 className="text-2xl font-bold mb-2 text-primary">{stadium.name}</h3>
                            <p className="text-gray-600 mb-4 flex items-center gap-2">
                                📍 {stadium.location}
                            </p>
                            <p className="text-gray-500 text-sm mb-6 line-clamp-2">{stadium.description}</p>
                            <Link to={`/stadiums/${stadium._id}`} className="block w-full bg-primary text-white text-center py-3 rounded-lg font-bold hover:bg-blue-900 transition">
                                View Details & Book
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StadiumList;
