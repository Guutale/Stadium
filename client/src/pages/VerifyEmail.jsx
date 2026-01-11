import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { dispatch } = useContext(AuthContext); // Access dispatch directly maybe? Or just login.
    // Actually AuthContext usually exposes login(), but here we receive a token.
    // Let's update the context manually if successful, or asked to login.

    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                const res = await api.get(`/auth/verify-email/${token}`);
                if (res.data.success) {
                    setStatus('success');
                    setMessage(res.data.message);

                    // Optional: store token and auto-login
                    if (res.data.token) {
                        localStorage.setItem('token', res.data.token);
                        // We might need to reload or dispatch to context to update state.
                        // For simplicity, we can ask user to login or reload page if we want auto-login.
                        // Let's reload to trigger AuthProvider loadUser
                        window.location.href = '/';
                    }
                } else {
                    setStatus('error');
                    setMessage(res.data.message || 'Verification failed.');
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">

                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-800">Verifying...</h2>
                        <p className="text-gray-600 mt-2">Please wait while we verify your email address.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
                        <p className="text-gray-600 mt-2 mb-6">{message}</p>
                        <Link to="/login" className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-900 transition">
                            Go to Dashboard
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="text-red-500 w-16 h-16 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
                        <p className="text-red-600 mt-2 mb-6">{message}</p>
                        <Link to="/login" className="text-gray-600 font-bold hover:underline">
                            Return to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
