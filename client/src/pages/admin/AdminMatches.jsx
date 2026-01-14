import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const AdminMatches = () => {
    const [matches, setMatches] = useState([]);
    const [stadiums, setStadiums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        stadium: '',
        homeTeam: '',
        awayTeam: '',
        date: '',
        time: '',
        vipPrice: '',
        regularPrice: '',
        description: '',
        competitionType: '',
        matchRules: '',
        isFinal: false
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Cancellation & Reschedule State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [rescheduleData, setRescheduleData] = useState({ newDate: '', newTime: '', newStadium: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [matchesRes, stadiumsRes] = await Promise.all([
                api.get('/matches'),
                api.get('/stadiums')
            ]);
            setMatches(matchesRes.data);
            setStadiums(stadiumsRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this match?')) {
            try {
                await api.delete(`/matches/${id}`);
                setMatches(matches.filter(m => m._id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete');
            }
        }
    };

    const handleEdit = (match) => {
        setFormData({
            _id: match._id,
            stadium: match.stadium?._id || match.stadium,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            date: new Date(match.date).toISOString().split('T')[0],
            time: match.time,
            vipPrice: match.vipPrice || '',
            regularPrice: match.regularPrice || '',
            description: match.description || '',
            competitionType: match.competitionType || '',
            matchRules: match.matchRules || '',
            isFinal: match.isFinal || false
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setFormData({ stadium: '', homeTeam: '', awayTeam: '', date: '', time: '', vipPrice: '', regularPrice: '', description: '', competitionType: '', matchRules: '', isFinal: false });
    };

    const handleChange = e => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (!formData.vipPrice || !formData.regularPrice) {
                alert('Please enter both VIP and Regular prices');
                return;
            }

            if (formData._id) {
                const res = await api.put(`/matches/${formData._id}`, formData);
                const updatedMatch = { ...res.data, stadium: stadiums.find(s => s._id === res.data.stadium) || res.data.stadium };
                setMatches(matches.map(m => m._id === formData._id ? updatedMatch : m));
            } else {
                const res = await api.post('/matches', formData);
                const newMatch = { ...res.data, stadium: stadiums.find(s => s._id === res.data.stadium) };
                setMatches([newMatch, ...matches]);
            }
            handleCancel();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Failed to save event';
            alert(`Error: ${msg}`);
        }
    };

    // Cancel Match
    const openCancelModal = (match) => {
        setSelectedMatch(match);
        setCancelReason('');
        setShowCancelModal(true);
    };

    const handleCancelMatch = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a cancellation reason');
            return;
        }

        try {
            const res = await api.post(`/matches/${selectedMatch._id}/cancel`, {
                cancellationReason: cancelReason
            });

            alert(`Match cancelled successfully!\nAffected bookings: ${res.data.affectedBookings}\nNotifications sent: ${res.data.notificationsSent}`);

            // Update match in list
            setMatches(matches.map(m => m._id === selectedMatch._id ? res.data.match : m));
            setShowCancelModal(false);
            setSelectedMatch(null);
            setCancelReason('');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to cancel match');
        }
    };

    // Reschedule Match
    const openRescheduleModal = (match) => {
        setSelectedMatch(match);
        setRescheduleData({ newDate: '', newTime: '', newStadium: match.stadium?._id || '' });
        setShowRescheduleModal(true);
    };

    const handleRescheduleMatch = async () => {
        if (!rescheduleData.newDate || !rescheduleData.newTime) {
            alert('Please provide new date and time');
            return;
        }

        try {
            const res = await api.post(`/matches/${selectedMatch._id}/reschedule`, rescheduleData);

            alert(`Match rescheduled successfully!\nTransferred bookings: ${res.data.transferredBookings}\nNotifications sent: ${res.data.notificationsSent}`);

            // Update old match and add new match to list
            setMatches([res.data.newMatch, ...matches.map(m => m._id === selectedMatch._id ? res.data.oldMatch : m)]);
            setShowRescheduleModal(false);
            setSelectedMatch(null);
            setRescheduleData({ newDate: '', newTime: '', newStadium: '' });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to reschedule match');
        }
    };

    // Process Refund
    const handleProcessRefund = async (match) => {
        // Removed isFinal check to allow refunds for all cancelled matches

        if (match.status !== 'cancelled') {
            alert('Match must be cancelled first');
            return;
        }

        if (match.rescheduledTo) {
            alert('This match has been rescheduled. Refunds are not applicable.');
            return;
        }

        if (window.confirm(`Process refunds for all bookings of this final match?\n\n${match.homeTeam} vs ${match.awayTeam}`)) {
            try {
                const res = await api.post(`/matches/${match._id}/refund`);
                alert(`Refunds processed successfully!\nRefunds issued: ${res.data.refundsProcessed}\nNotifications sent: ${res.data.notificationsSent}`);
                fetchData(); // Refresh data
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || 'Failed to process refunds');
            }
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Event Management</h1>
                <button
                    onClick={() => {
                        if (showForm) handleCancel();
                        else setShowForm(true);
                    }}
                    className="bg-admin-accent text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition shadow-lg"
                >
                    {showForm ? 'Cancel' : 'Add New Event'}
                </button>
            </div>

            {showForm && (
                <div className="bg-admin-card p-6 rounded-xl shadow-lg mb-8 border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 text-white">{formData._id ? 'Edit Match Event' : 'Add New Match Event'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="stadium" value={formData.stadium} onChange={handleChange} className="p-3 bg-gray-800 border border-gray-600 rounded text-white focus:ring-2 focus:ring-admin-accent" required>
                            <option value="">Select Stadium</option>
                            {stadiums.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <input name="homeTeam" value={formData.homeTeam} onChange={handleChange} placeholder="Home Team" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required />
                        <input name="awayTeam" value={formData.awayTeam} onChange={handleChange} placeholder="Away Team" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required />
                        <input name="date" type="date" value={formData.date} onChange={handleChange} className="p-3 bg-gray-800 border border-gray-600 rounded text-white focus:ring-2 focus:ring-admin-accent" required />
                        <input name="time" type="time" value={formData.time} onChange={handleChange} className="p-3 bg-gray-800 border border-gray-600 rounded text-white focus:ring-2 focus:ring-admin-accent" required />

                        <input name="vipPrice" type="number" value={formData.vipPrice} onChange={handleChange} placeholder="VIP Price ($)" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required />
                        <input name="regularPrice" type="number" value={formData.regularPrice} onChange={handleChange} placeholder="Regular Price ($)" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required />

                        <input name="competitionType" value={formData.competitionType} onChange={handleChange} placeholder="Competition / League Name" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required />

                        <input name="description" value={formData.description} onChange={handleChange} placeholder="Description (e.g. Finals)" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" />

                        <textarea
                            name="matchRules"
                            value={formData.matchRules}
                            onChange={handleChange}
                            placeholder="Match Rules & Conditions (e.g. No refunds, Age limits...)"
                            className="col-span-1 md:col-span-2 p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent"
                            rows="4"
                        />



                        <button type="submit" className="col-span-1 md:col-span-2 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">{formData._id ? 'Update Event' : 'Save Event'}</button>
                    </form>
                </div>
            )}

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by Team or Stadium..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent"
                />
            </div>

            <div className="bg-admin-card rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-800 text-gray-200 uppercase text-sm">
                            <tr>
                                <th className="p-4 border-b border-gray-700 font-bold">Event</th>
                                <th className="p-4 border-b border-gray-700 font-bold">Stadium</th>
                                <th className="p-4 border-b border-gray-700 font-bold">Date & Time</th>
                                <th className="p-4 border-b border-gray-700 font-bold">Prices</th>
                                <th className="p-4 border-b border-gray-700 font-bold">Status</th>
                                <th className="p-4 border-b border-gray-700 font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            {matches
                                .filter(match =>
                                    match.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    match.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (match.stadium?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map(match => (
                                    <tr key={match._id} className="hover:bg-gray-800 transition border-b border-gray-700 last:border-0">
                                        <td className="p-4">
                                            <div className="font-bold text-white">
                                                {match.homeTeam} <span className="text-secondary font-normal">vs</span> {match.awayTeam}
                                            </div>
                                            {match.rescheduledFrom && (
                                                <span className="inline-block mt-1 ml-2 px-2 py-0.5 bg-purple-900 text-purple-300 rounded text-xs font-bold">
                                                    ↻ RESCHEDULED
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">{match.stadium?.name || 'Unknown'}</td>
                                        <td className="p-4">
                                            <div>{new Date(match.date).toLocaleDateString()}</div>
                                            <div className="text-sm text-gray-400">{match.time}</div>
                                            {match.minutesUntilClosure > 0 && match.minutesUntilClosure <= 30 && match.status === 'upcoming' && (
                                                <div className="text-xs text-yellow-400 mt-1">⏰ Closes in {match.minutesUntilClosure}min</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="text-yellow-400">VIP: ${match.vipPrice}</div>
                                            <div className="text-gray-400">Reg: ${match.regularPrice}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${match.status === 'cancelled' ? 'bg-red-900 text-red-200 border-red-700' :
                                                match.status === 'completed' ? 'bg-green-900 text-green-200 border-green-700' :
                                                    match.status === 'ongoing' || match.matchStarted ? 'bg-orange-900 text-orange-200 border-orange-700' :
                                                        match.bookingClosed && match.status === 'upcoming' ? 'bg-yellow-900 text-yellow-200 border-yellow-700' :
                                                            'bg-blue-900 text-blue-200 border-blue-700'
                                                }`}>
                                                {match.status === 'ongoing' || match.matchStarted ? 'STARTED' :
                                                    match.bookingClosed && match.status === 'upcoming' ? 'CLOSING SOON' :
                                                        match.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {match.isRefunded ? (
                                                    <span className="text-gray-400 font-bold text-sm italic py-1 px-4 border border-gray-600 rounded bg-gray-900">Refunded</span>
                                                ) : (
                                                    <>
                                                        {/* Logic for Action Buttons */}
                                                        {match.status === 'completed' ? (
                                                            <span className="text-gray-500 font-bold text-sm italic py-1 px-4 border border-gray-700 rounded bg-gray-900">Ended</span>
                                                        ) : (
                                                            <>
                                                                {match.status !== 'ongoing' && match.status !== 'completed' && match.status !== 'cancelled' && (
                                                                    <>
                                                                        <button onClick={() => handleEdit(match)} className="text-blue-400 hover:text-blue-300 font-bold text-sm">Edit</button>
                                                                        <button onClick={() => handleDelete(match._id)} className="text-red-400 hover:text-red-300 font-bold text-sm">Delete</button>
                                                                    </>
                                                                )}

                                                                <a href={`/admin/matches/${match._id}/seats`} className="text-yellow-400 hover:text-yellow-300 font-bold text-sm">Seats</a>

                                                                {/* Cancellation & Reschedule Actions */}
                                                                {match.status === 'upcoming' && (
                                                                    <button
                                                                        onClick={() => openCancelModal(match)}
                                                                        className="text-orange-400 hover:text-orange-300 font-bold text-sm"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                )}

                                                                {/* ONGOING: Show Actions (Seats + Cancel only) */}
                                                                {(match.status === 'ongoing' || match.matchStarted) && (
                                                                    <button
                                                                        onClick={() => openCancelModal(match)}
                                                                        className="text-orange-400 hover:text-orange-300 font-bold text-sm"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                )}

                                                                {match.status === 'cancelled' && !match.rescheduledTo && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => openRescheduleModal(match)}
                                                                            className="text-purple-400 hover:text-purple-300 font-bold text-sm"
                                                                        >
                                                                            Reschedule
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleProcessRefund(match)}
                                                                            className="text-green-400 hover:text-green-300 font-bold text-sm"
                                                                        >
                                                                            Refund
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cancel Match Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-admin-card border border-gray-700 rounded-xl p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Cancel Match</h2>
                        <p className="text-gray-300 mb-4">
                            <span className="font-bold text-white">{selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}</span>
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                            All paid bookings will be marked as cancelled. Users will be notified that their booking remains valid for a rescheduled match.
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Cancellation reason (required)"
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent mb-4"
                            rows="3"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelMatch}
                                className="flex-1 bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 transition"
                            >
                                Confirm Cancellation
                            </button>
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setSelectedMatch(null);
                                    setCancelReason('');
                                }}
                                className="flex-1 bg-gray-700 text-white py-2 rounded font-bold hover:bg-gray-600 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Match Modal */}
            {showRescheduleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-admin-card border border-gray-700 rounded-xl p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Reschedule Match</h2>
                        <p className="text-gray-300 mb-4">
                            <span className="font-bold text-white">{selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}</span>
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                            All cancelled bookings will be automatically transferred to the new match date. Users will NOT need to pay again.
                        </p>

                        <div className="space-y-3 mb-4">
                            <input
                                type="date"
                                value={rescheduleData.newDate}
                                onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white focus:ring-2 focus:ring-admin-accent"
                                required
                            />
                            <input
                                type="time"
                                value={rescheduleData.newTime}
                                onChange={(e) => setRescheduleData({ ...rescheduleData, newTime: e.target.value })}
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white focus:ring-2 focus:ring-admin-accent"
                                required
                            />
                            <select
                                value={rescheduleData.newStadium}
                                onChange={(e) => setRescheduleData({ ...rescheduleData, newStadium: e.target.value })}
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white focus:ring-2 focus:ring-admin-accent"
                            >
                                <option value="">Keep Same Stadium</option>
                                {stadiums.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleRescheduleMatch}
                                className="flex-1 bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700 transition"
                            >
                                Confirm Reschedule
                            </button>
                            <button
                                onClick={() => {
                                    setShowRescheduleModal(false);
                                    setSelectedMatch(null);
                                    setRescheduleData({ newDate: '', newTime: '', newStadium: '' });
                                }}
                                className="flex-1 bg-gray-700 text-white py-2 rounded font-bold hover:bg-gray-600 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMatches;
