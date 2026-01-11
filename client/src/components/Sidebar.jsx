import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const links = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/stadiums', label: 'Stadium Management', icon: '🏟️' },
        { path: '/admin/matches', label: 'Event Management', icon: '⚽' },
        { path: '/admin/bookings', label: 'Booking Management', icon: '🎫' },
        { path: '/admin/users', label: 'User Management', icon: '👥' },
        { path: '/admin/payments', label: 'Payment Management', icon: '💳' },
        { path: '/admin/reports', label: 'Report Analysis', icon: '📈' },
        { path: '/admin/profile', label: 'Profile', icon: '🅿️' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/')
    };

    return (
        <div className="bg-admin-dark text-admin-text w-full h-full flex flex-col shadow-xl">
            <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">A</div>
                    <div>
                        <h2 className="text-lg font-bold leading-none">Online Stadium</h2>
                        <p className="text-xs text-gray-400">Management System</p>
                    </div>
                </div>
            </div>

            <nav className="flex-grow p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {links.map(link => (
                        <li key={link.path}>
                            <Link
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname === link.path
                                        ? 'bg-primary text-white shadow-lg translate-x-1'
                                        : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl">{link.icon}</span>
                                <span className="font-medium text-sm">{link.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-700">
                <div className="mb-4 px-4">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Admin Profile</p>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                        <span>Welcome Admin</span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold transition shadow-md"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
