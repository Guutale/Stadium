import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const BookingSuccess = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await api.get(`/bookings/${id}`);
                setBooking(res.data);
                if (res.data.paymentStatus !== 'paid') {
                    setError('This booking has not been paid yet.');
                }
            } catch (err) {
                console.error("Error fetching booking:", err);
                setError('Failed to load booking.');
            }
        };
        fetchBooking();
    }, [id]);

    if (error) {
        return (
            <div className="text-center mt-20">
                <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
                <Link to="/stadiums" className="text-blue-500 hover:underline">Return to Stadiums</Link>
            </div>
        );
    }

    if (!booking) return <div className="text-center mt-20">Loading...</div>;

    return (
        <div className="flex justify-center items-center min-h-[70vh] py-12">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg border border-green-100 text-center">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🎉</span>
                    </div>
                    <h2 className="text-3xl font-bold text-green-700 mb-2">Payment Successful 🎉</h2>
                    <p className="text-gray-600 mb-6">
                        Your payment has been confirmed and your booking is now completed.
                        <br />
                        Your e-ticket has been generated and sent to your email.
                    </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-8 text-left border border-blue-100">
                    <h3 className="font-bold text-blue-800 mb-2">✉ Email Sent</h3>
                    <p className="text-sm text-gray-700"><strong>Subject:</strong> Your Ticket is Ready!</p>
                    <p className="text-sm text-gray-600 mt-1">
                        Thank you! Your payment was successful. Your ticket is attached. Enjoy the match!
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.print()}
                        className="w-full bg-secondary text-primary py-3 rounded-lg font-bold hover:bg-yellow-400 transition"
                    >
                        Download / Print Ticket
                    </button>

                    <Link
                        to="/my-bookings"
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition block"
                    >
                        View My Bookings
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccess;
