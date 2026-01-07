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
    const navigate = useNavigate();
    const [method, setMethod] = useState('card');
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [evcPin, setEvcPin] = useState('');
    const [processing, setProcessing] = useState(false);

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

    const handleEVCPayment = async () => {
        if (!evcPin || evcPin.length < 4) {
            alert('Please enter a valid 4-digit PIN');
            return;
        }

        setProcessing(true);
        try {
            const response = await api.post('/payments/evc', {
                bookingId: id,
                pin: evcPin
            });

            if (response.data.success) {
                alert(`✅ Payment Successful!\nTransaction ID: ${response.data.transactionId}\n\nYour booking is confirmed!`);
                navigate('/my-bookings');
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-center mt-20">Loading Payment Details...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
    if (!booking) return <div className="text-center mt-20">Booking not found</div>;

    const amount = booking.totalAmount;

    return (
        <div className="flex justify-center items-center min-h-[60vh] py-12">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-bold mb-2 text-center text-primary">Checkout</h2>
                <p className="text-center text-gray-500 mb-6">Order #{booking._id.slice(-6).toUpperCase()}</p>

                <div className="bg-blue-50 p-4 rounded-lg mb-8 text-center">
                    <p className="text-sm text-gray-600">Total to Pay</p>
                    <p className="text-4xl font-bold text-primary">${amount.toFixed(2)}</p>
                </div>

                <div className="flex justify-center flex-wrap gap-4 mb-8">
                    <button
                        onClick={() => setMethod('card')}
                        className={`px-4 py-2 rounded-lg font-bold transition ${method === 'card' ? 'bg-primary text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}
                    >
                        Card (Stripe)
                    </button>
                    <button
                        onClick={() => setMethod('mobile_money')}
                        className={`px-4 py-2 rounded-lg font-bold transition ${method === 'mobile_money' ? 'bg-primary text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}
                    >
                        Mobile Money
                    </button>
                    <button
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to cancel this booking?')) {
                                try {
                                    await api.post(`/bookings/${id}/cancel`);
                                    setError('Booking Cancelled');
                                    window.location.href = '/stadiums';
                                } catch (e) {
                                    console.error(e);
                                    alert('Failed to cancel');
                                }
                            }
                        }}
                        className="px-4 py-2 rounded-lg font-bold bg-red-100 text-red-600 hover:bg-red-200 transition"
                    >
                        Cancel
                    </button>
                </div>

                {method === 'card' ? (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm bookingId={id} amount={amount} />
                    </Elements>
                ) : (
                    <div className="text-center py-6">
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-4">
                            <h3 className="text-xl font-bold text-green-700 mb-4">EVC Plus Payment</h3>
                            <p className="text-sm text-gray-600 mb-4">Enter your PIN to complete payment</p>
                            <p className="text-xs text-gray-500 mb-3">💡 Demo Mode: Use any 4-digit PIN</p>
                            <input
                                type="password"
                                placeholder="Enter your EVC PIN"
                                value={evcPin}
                                onChange={(e) => setEvcPin(e.target.value)}
                                className="w-full p-3 mb-4 border rounded focus:ring-2 focus:ring-green-500 text-center text-lg tracking-widest"
                                maxLength="4"
                                disabled={processing}
                            />
                            <button
                                onClick={handleEVCPayment}
                                disabled={processing}
                                className={`w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;
