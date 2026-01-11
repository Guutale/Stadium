import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import api from '../utils/api';

// Replace with your actual publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const Payment = () => {
    const { id } = useParams(); // Booking ID
    // const navigate = useNavigate(); // Not using navigate here anymore, redirected in CheckoutForm or cancellation
    // const [method, setMethod] = useState('card'); // Only card now
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const [evcPin, setEvcPin] = useState(''); // Removed
    // const [processing, setProcessing] = useState(false); // Removed (handled in form)

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await api.get(`/bookings/${id}`);
                setBooking(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load booking details');
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);



    if (loading) return <div className="text-center mt-20">Loading Payment Details...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
    if (!booking) return <div className="text-center mt-20">Booking not found</div>;

    const amount = booking.totalAmount;

    return (
        <div className="flex justify-center items-center min-h-[70vh] py-12">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg border border-gray-100">
                <h2 className="text-3xl font-bold mb-2 text-center text-primary">Checkout & Secure Payment</h2>
                <p className="text-center text-gray-500 mb-8">Order #{booking._id.slice(-6).toUpperCase()}</p>

                <div className="bg-blue-50 p-6 rounded-lg mb-8 text-center border border-blue-100">
                    <p className="text-sm text-gray-600 uppercase tracking-widest mb-1">Total to Pay</p>
                    <p className="text-4xl font-bold text-primary">${amount.toFixed(2)}</p>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Payment Method</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Enter your card details to complete your booking.<br />
                        <span className="text-xs text-gray-500">No real money will be charged — this payment is simulation only.</span>
                    </p>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">💳</span>
                            <span className="font-bold text-gray-700">Card Details</span>
                        </div>
                        {/* Stripe Element Container is inside CheckoutForm */}
                        <Elements stripe={stripePromise}>
                            <CheckoutForm bookingId={id} amount={amount} />
                        </Elements>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <button
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to cancel this booking?')) {
                                try {
                                    await api.post(`/bookings/${id}/cancel`);
                                    window.location.href = '/stadiums';
                                } catch (e) {
                                    console.error(e);
                                    alert('Failed to cancel');
                                }
                            }
                        }}
                        className="text-red-500 text-sm hover:underline"
                    >
                        Cancel Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Payment;
