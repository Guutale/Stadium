import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-primary text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold font-heading">
                    Stadium<span className="text-secondary">Manager</span>
                </Link>
                <div className="flex space-x-6 items-center">
                    <Link to="/" className="hover:text-secondary transition">Home</Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/stadiums" className="hover:text-secondary transition">Stadiums</Link>
                            {user && user.role === 'admin' && (
                                <Link to="/admin/dashboard" className="bg-secondary text-primary px-3 py-1 rounded font-bold hover:bg-yellow-400 transition">
                                    Admin Dashboard
                                </Link>
                            )}
                            <Link to="/my-bookings" className="hover:text-secondary transition">My Bookings</Link>
                            <button onClick={onLogout} className="text-white hover:text-red-400 transition">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-secondary transition">Login</Link>
                            <Link to="/register" className="bg-white text-primary px-4 py-2 rounded font-bold hover:bg-gray-100 transition">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
