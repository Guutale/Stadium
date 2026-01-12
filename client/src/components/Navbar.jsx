import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { Bell, User, LogOut, Ticket } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useContext(AuthContext);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        setShowNotifications(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <nav className="bg-primary text-white shadow-md relative z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold font-heading flex items-center gap-2">
                    <span>🏟️</span> Stadium<span className="text-secondary">Manager</span>
                </Link>
                <div className="flex space-x-6 items-center">
                    <Link to="/" className="hover:text-secondary transition font-medium">Home</Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/stadiums" className="hover:text-secondary transition font-medium">Stadiums</Link>
                            {user && user.role === 'admin' && (
                                <Link to="/admin/dashboard" className="bg-secondary text-primary px-3 py-1 rounded font-bold hover:bg-yellow-400 transition">
                                    Admin Dashboard
                                </Link>
                            )}

                            {/* Notification Bell */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-1 hover:text-secondary transition"
                                >
                                    <Bell size={24} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-3 w-80 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 overflow-hidden transform origin-top-right transition-all">
                                        <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                                            <h3 className="font-bold text-gray-700">Notifications</h3>
                                            {notifications.length > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs text-primary hover:text-secondary font-semibold"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-gray-400">
                                                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map(notification => (
                                                    <div
                                                        key={notification.id}
                                                        onClick={() => handleNotificationClick(notification)}
                                                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition relative ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                                    >
                                                        {!notification.read && (
                                                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                                        )}
                                                        <div className="pl-2">
                                                            <p className="font-bold text-sm mb-1 text-gray-800">{notification.title}</p>
                                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{notification.message}</p>
                                                            <p className="text-[10px] text-gray-400">
                                                                {new Date(notification.time).toLocaleString(undefined, {
                                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="bg-gray-50 p-2 text-center border-t">
                                            <Link
                                                to="/my-bookings"
                                                className="text-xs font-bold text-primary hover:text-secondary block py-1"
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                View All Bookings
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link to="/profile" title="My Profile" className="hover:text-secondary transition p-1">
                                <User size={24} />
                            </Link>
                            <Link to="/my-bookings" title="My Bookings" className="hover:text-secondary transition p-1">
                                <Ticket size={24} />
                            </Link>
                            <button onClick={onLogout} title="Logout" className="hover:text-red-400 transition p-1 ml-2">
                                <LogOut size={24} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-secondary transition font-medium">Login</Link>
                            <Link to="/register" className="bg-white text-primary px-4 py-2 rounded font-bold hover:bg-gray-100 transition shadow-lg">
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
