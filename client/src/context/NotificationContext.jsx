import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            generateNotifications();
            // Refresh notifications every 5 minutes
            const interval = setInterval(generateNotifications, 5 * 60 * 1000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated]);

    const generateNotifications = async () => {
        try {
            // Fetch user's bookings to generate notifications
            const res = await api.get('/bookings/my');
            const bookings = res.data;

            const newNotifications = [];
            const now = new Date();

            bookings.forEach(booking => {
                const match = booking.match;
                if (!match) return;

                const matchDate = new Date(match.date);
                // Combine date and time
                const [hours, minutes] = match.time.split(':');
                matchDate.setHours(parseInt(hours), parseInt(minutes));

                // Notification: Match Cancelled
                if (match.status === 'cancelled') {
                    newNotifications.push({
                        id: `cancel-${match._id}`,
                        type: 'cancellation',
                        title: '⚠️ Match Cancelled',
                        message: `${match.homeTeam} vs ${match.awayTeam} has been cancelled.`,
                        time: match.updatedAt || matchDate, // Fallback to match date if updated not available
                        read: false,
                        link: '/my-bookings'
                    });
                }

                // Notification: Match Rescheduled
                if (match.rescheduledFrom) {
                    newNotifications.push({
                        id: `resched-${match._id}`,
                        type: 'reschedule',
                        title: '↻ Match Rescheduled',
                        message: `${match.homeTeam} vs ${match.awayTeam} has been rescheduled to ${new Date(match.date).toLocaleDateString()}.`,
                        time: match.updatedAt || new Date(),
                        read: false,
                        link: '/my-bookings'
                    });
                }

                // Notification: Match Starting Soon (within 24 hours)
                const timeDiff = matchDate - now;
                const hoursDiff = timeDiff / (1000 * 60 * 60);

                if (hoursDiff > 0 && hoursDiff <= 24) {
                    newNotifications.push({
                        id: `reminder-${match._id}`,
                        type: 'reminder',
                        title: '⏰ Match Starting Soon',
                        message: `${match.homeTeam} vs ${match.awayTeam} starts in ${Math.round(hoursDiff)} hours.`,
                        time: new Date(),
                        read: false,
                        link: `/matches/${match._id}`
                    });
                }

                // Notification: Booking Confirmed (New bookings - simple logic for now based on creation time if available, or just always show for active bookings as a "status")
                // For this MVP, let's just show confirmation if booking is active and made recently (e.g., last 3 days)
                // Assuming createdAt is available in booking object. If not, we skip.
                if (booking.createdAt && booking.bookingStatus === 'active') {
                    const bookingDate = new Date(booking.createdAt);
                    const daysSinceBooking = (now - bookingDate) / (1000 * 60 * 60 * 24);

                    if (daysSinceBooking <= 3) {
                        newNotifications.push({
                            id: `confirm-${booking._id}`,
                            type: 'confirmation',
                            title: '✓ Booking Confirmed',
                            message: `Your booking for ${match.homeTeam} vs ${match.awayTeam} is confirmed.`,
                            time: booking.createdAt,
                            read: false,
                            link: `/my-bookings`
                        });
                    }
                }
            });

            // Sort by time (newest first)
            newNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));

            // In a real app, we'd persist "read" status in local storage or backend
            // For MVP, we'll just set them. To avoid resetting "read" status on every refresh, 
            // we could merge with existing state, but for simplicity:
            setNotifications(prev => {
                // simple merge to keep read status if ID matches
                const merged = newNotifications.map(newNotif => {
                    const existing = prev.find(p => p.id === newNotif.id);
                    return existing ? { ...newNotif, read: existing.read } : newNotif;
                });

                const unread = merged.filter(n => !n.read).length;
                setUnreadCount(unread);
                return merged;
            });

        } catch (err) {
            console.error("Error generating notifications:", err);
        }
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
