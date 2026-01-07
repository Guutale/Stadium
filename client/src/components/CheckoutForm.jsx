import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const CheckoutForm = ({ bookingId, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        try {
            // 1. Create PaymentIntent on Backend
            const { data: { clientSecret } } = await api.post('/payments/create-payment-intent', {
                amount: amount * 100 // Convert to cents
            });

            // 2. Confirm Card Payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                }
            });

            if (result.error) {
                setError(result.error.message);
                setProcessing(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // 3. Record success in backend
                    await api.post('/payments', {
                        bookingId,
                        amount,
                        method: 'card',
                        transactionId: result.paymentIntent.id
                    });

                    alert('Payment Successful!');
                    navigate('/my-bookings');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border rounded-lg bg-gray-50">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                }} />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
                type="submit"
                disabled={!stripe || processing}
                className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg transform transition hover:scale-[1.02] ${processing ? 'bg-gray-400' : 'bg-primary hover:bg-blue-900'}`}
            >
                {processing ? 'Processing...' : `Pay $${amount}`}
            </button>
        </form>
    );
};

export default CheckoutForm;
