import React, { useState } from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const CheckoutForm = ({ bookingId, amount }) => {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [isCardComplete, setIsCardComplete] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isCardComplete) {
            setError('Please enter complete card details.');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // FAKE PAYMENT CALL (Simulation)
            const res = await api.post('/payments/simulate', {
                bookingId,
                amount
            });

            if (res.data.success) {
                // alert('Payment Successful (NO MONEY CHARGED)'); // Alert removed for success page redirection
                navigate(`/payment/success/${bookingId}`);
            } else {
                setError('Payment Failed');
            }

        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || 'Server Error. Try again.';
            setError(errorMessage);
        }

        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            <div className={`p-4 border rounded-lg bg-white shadow-inner ${error ? 'border-red-300' : 'border-gray-300'}`}>
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': { color: '#aab7c4' },
                            },
                            invalid: { color: '#9e2146' },
                        },
                    }}
                    onChange={(e) => {
                        setIsCardComplete(e.complete);
                        if (e.error) {
                            setError(e.error.message);
                        } else {
                            setError(null);
                        }
                    }}
                />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <h4 className="font-bold text-blue-800 text-sm mb-1">✔️ Secure Checkout</h4>
                <p className="text-xs text-blue-600">No real payment will be deducted • Instant ticket delivery</p>
            </div>

            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}

            <button
                type="submit"
                disabled={processing || !isCardComplete}
                className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg transform transition hover:scale-[1.02] ${processing || !isCardComplete ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-900'
                    }`}
            >
                {processing ? 'Processing Payment...' : 'Confirm Payment'}
            </button>
        </form>
    );
};

export default CheckoutForm;
