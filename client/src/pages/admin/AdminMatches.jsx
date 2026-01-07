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
        description: ''
    });
    const [searchQuery, setSearchQuery] = useState('');

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
            description: match.description || ''
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setFormData({ stadium: '', homeTeam: '', awayTeam: '', date: '', time: '', vipPrice: '', regularPrice: '', description: '' });
    };

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            // Basic validation
            if (!formData.vipPrice || !formData.regularPrice) {
                alert('Please enter both VIP and Regular prices');
                return;
            }

            if (formData._id) {
                // Update
                const res = await api.put(`/matches/${formData._id}`, formData);
                const updatedMatch = { ...res.data, stadium: stadiums.find(s => s._id === res.data.stadium) || res.data.stadium };
                setMatches(matches.map(m => m._id === formData._id ? updatedMatch : m));
            } else {
                // Create
                const res = await api.post('/matches', formData);
                const newMatch = { ...res.data, stadium: stadiums.find(s => s._id === res.data.stadium) };
                setMatches([newMatch, ...matches]);
            }
            handleCancel();
        } catch (err) {
            console.error(err);
            // Improve error message
            const msg = err.response?.data?.message || err.message || 'Failed to save event';
            alert(`Error: ${msg}`);
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

                        <input name="description" value={formData.description} onChange={handleChange} placeholder="Description (e.g. Finals)" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent md:col-span-2" />
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
                                    <td className="p-4 font-bold text-white">
                                        {match.homeTeam} <span className="text-secondary font-normal">vs</span> {match.awayTeam}
                                    </td>
                                    <td className="p-4">{match.stadium?.name || 'Unknown'}</td>
                                    <td className="p-4">
                                        {new Date(match.date).toLocaleDateString()} at {match.time}
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className="text-yellow-400">VIP: ${match.vipPrice}</div>
                                        <div className="text-gray-400">Reg: ${match.regularPrice}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs font-bold uppercase border border-blue-700">{match.status}</span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => handleEdit(match)} className="text-blue-400 hover:text-blue-300 font-bold">Edit</button>
                                        <button onClick={() => handleDelete(match._id)} className="text-red-400 hover:text-red-300 font-bold">Delete</button>
                                        <a href={`/admin/matches/${match._id}/seats`} className="text-yellow-400 hover:text-yellow-300 font-bold self-center">Seats</a>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminMatches;
