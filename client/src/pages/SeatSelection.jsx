import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import SeatMap from '../components/SeatMap';
import { AuthContext } from '../context/AuthContext';

const SeatSelection = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);
    const [match, setMatch] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
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

    const handleSeatSelect = (seatId) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const calculateTotal = () => {
        if (!match) return 0;
        let total = 0;
        selectedSeats.forEach(seat => {
            const isVip = seat.startsWith('A') || seat.startsWith('B');
            total += isVip ? match.vipPrice : match.regularPrice;
        });
        return total;
    };

    const handleBooking = async () => {
        if (!isAuthenticated) return navigate('/login');

        try {
            const bookingData = {
                match: match._id,
                seats: selectedSeats,
                totalAmount: calculateTotal()
            };

            const res = await api.post('/bookings', bookingData);
            navigate(`/payment/${res.data._id}`);
        } catch (err) {
            console.error(err);
            alert('Booking failed. Please try again.');
        }
    };

    if (loading) return <div className="text-center mt-20">Loading...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

    const totalPrice = calculateTotal();

    const matchDate = new Date(match.date);
    const [hours, minutes] = match.time.split(':');
    matchDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const isStarted = new Date() > matchDate;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-primary">Select Your Seats</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                    <SeatMap
                        bookedSeats={match.bookedSeats || []}
                        selectedSeats={selectedSeats}
                        onSeatSelect={handleSeatSelect}
                        vipPrice={match.vipPrice}
                        regularPrice={match.regularPrice}
                    />
                </div>
                <div className="lg:w-1/3">
                    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-secondary sticky top-24">
                        <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
                        <div className="space-y-4 mb-6">
                            <p className="flex justify-between"><span>Match:</span> <span className="font-bold">{match.homeTeam} vs {match.awayTeam}</span></p>
                            <p className="flex justify-between"><span>Date:</span> <span>{new Date(match.date).toLocaleDateString()} {match.time}</span></p>
                            <div className="border-t pt-2 max-h-40 overflow-y-auto">
                                <p className="font-bold mb-2">Selected Seats:</p>
                                {selectedSeats.map(seat => {
                                    const isVip = seat.startsWith('A') || seat.startsWith('B');
                                    return (
                                        <div key={seat} className="flex justify-between text-sm mb-1">
                                            <span>{seat} ({isVip ? 'VIP' : 'Regular'})</span>
                                            <span>${isVip ? match.vipPrice : match.regularPrice}</span>
                                        </div>
                                    );
                                })}
                                {selectedSeats.length === 0 && <span className="text-gray-500">None</span>}
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <p className="flex justify-between text-2xl font-bold text-primary"><span>Total:</span> <span>${totalPrice.toFixed(2)}</span></p>
                            </div>
                        </div>
                        <button
                            onClick={handleBooking}
                            disabled={selectedSeats.length === 0 || isStarted}
                            className={`w-full py-4 rounded-lg font-bold text-lg transition shadow-lg ${selectedSeats.length > 0 && !isStarted ? 'bg-primary text-white hover:bg-blue-900' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                            {isStarted ? 'Match Started - Booking Closed' : (isAuthenticated ? 'Proceed to Payment' : 'Login to Book')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;
