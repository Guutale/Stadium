import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await login(formData);
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Login failed';
            setError(msg);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
                <h2 className="text-3xl font-bold mb-6 text-center text-primary">Welcome Back</h2>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-gray-700 mb-1 font-semibold">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1 font-semibold">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button type="submit" className="bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-900 transition mt-2 shadow-lg">
                        Login
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-600">
                    Don't have an account? <Link to="/register" className="text-secondary font-bold hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
