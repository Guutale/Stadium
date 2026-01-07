import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            alert('User created successfully!');
            setUsers([res.data.user, ...users]);
            setShowForm(false);
            setFormData({ username: '', email: '', password: '', role: 'user' });
            fetchUsers(); // Refresh the list
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/auth/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition"
                >
                    {showForm ? 'Cancel' : '+ Add User'}
                </button>
            </div>

            {showForm && (
                <div className="bg-admin-card p-6 rounded-xl shadow-lg mb-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Add New User</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required />
                        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required />
                        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required minLength="6" />
                        <select name="role" value={formData.role} onChange={handleChange} className="p-3 bg-gray-800 border border-gray-600 rounded text-white focus:ring-2 focus:ring-admin-accent">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" className="col-span-1 md:col-span-2 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">Create User</button>
                    </form>
                </div>
            )}

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by Username, Email or Role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent"
                />
            </div>

            <div className="bg-admin-card rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-800 text-gray-200 uppercase text-sm">
                        <tr>
                            <th className="p-4 border-b border-gray-700 font-bold">Username</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Email</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Role</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Joined Date</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {users
                            .filter(user =>
                                (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (user.role || '').toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(user => (
                                <tr key={user._id} className="hover:bg-gray-800 transition border-b border-gray-700 last:border-0">
                                    <td className="p-4 font-medium text-white">{user.username}</td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-900 text-purple-300' : 'bg-gray-700 text-gray-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        {user.role !== 'admin' && (
                                            <button onClick={() => handleDelete(user._id)} className="text-red-400 hover:text-red-300 font-bold">Delete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
