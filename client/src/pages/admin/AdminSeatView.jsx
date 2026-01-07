import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import SeatMap from '../../components/SeatMap';

const AdminSeatView = () => {
    const { id } = useParams(); // Match ID
    const [match, setMatch] = useState(null);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatchAndSeats = async () => {
            try {
                // Determine if ID is Match ID or Stadium ID. Usually Match ID for seat status.
                // Reusing match bookings endpoint or match details
                const res = await api.get(`/matches/${id}`);
                setMatch(res.data);
                setBookedSeats(res.data.bookedSeats || []); // Assuming getMatchById includes bookedSeats
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchMatchAndSeats();
    }, [id]);

    if (loading) return <div className="text-white">Loading Seat Map...</div>;
    if (!match) return <div className="text-white">Match not found</div>;

    return (
        <div className="text-white">
            <h1 className="text-3xl font-bold mb-6">Seat Overview: {match.homeTeam} vs {match.awayTeam}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-4 rounded-xl text-gray-800">
                    <SeatMap
                        bookedSeats={bookedSeats}
                        selectedSeats={[]}
                        onSeatSelect={() => { }} // Read-only for admin? Or maybe select to block?
                        vipPrice={match.vipPrice}
                        regularPrice={match.regularPrice}
                    />
                </div>
                <div className="bg-admin-card p-6 rounded-xl shadow-lg border border-gray-700 h-fit">
                    <h3 className="font-bold mb-4 text-xl">Details</h3>
                    <p className="mb-2"><span className="text-gray-400">Stadium:</span> {match.stadium.name}</p>
                    <p className="mb-2"><span className="text-gray-400">Date:</span> {new Date(match.date).toLocaleDateString()}</p>
                    <p className="mb-2"><span className="text-gray-400">Booked Seats:</span> {bookedSeats.length}</p>
                    <p className="mb-2"><span className="text-gray-400">Total Revenue (Est):</span> ${bookedSeats.reduce((acc, seat) => {
                        const isVip = seat.startsWith('A') || seat.startsWith('B');
                        return acc + (isVip ? match.vipPrice : match.regularPrice);
                    }, 0)}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminSeatView;
