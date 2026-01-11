import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { User, Mail, Shield, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

const UserProfile = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({
        username: '',
        email: ''
    });
    const [passData, setPassData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Status & Feedback States
    const [loading, setLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', content: '' }); // type: 'success' | 'error'
    const [passMsg, setPassMsg] = useState({ type: '', content: '' });

    // Initialize data from Auth Context
    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', content: '' });

        try {
            const res = await api.put('/auth/update-profile', profileData);
            setMsg({ type: 'success', content: res.data.message });
        } catch (err) {
            setMsg({ type: 'error', content: err.response?.data?.message || 'Update failed' });
        }
        setLoading(false);
    };

    const handlePassChange = async (e) => {
        e.preventDefault();

        if (passData.newPassword !== passData.confirmPassword) {
            setPassMsg({ type: 'error', content: 'New passwords do not match' });
            return;
        }

        setPassLoading(true);
        setPassMsg({ type: '', content: '' });

        try {
            await api.put('/auth/change-password', {
                currentPassword: passData.currentPassword,
                newPassword: passData.newPassword,
                confirmPassword: passData.confirmPassword
            });
            setPassMsg({ type: 'success', content: 'Password changed successfully' });
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPassMsg({ type: 'error', content: err.response?.data?.message || 'Password change failed' });
        }
        setPassLoading(false);
    };

    if (authLoading) return <div className="text-center mt-20">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-primary mb-8 font-heading">My Profile</h1>

            <div className="grid md:grid-cols-2 gap-8">

                {/* Profile Information & Edit */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <User className="text-secondary" size={32} />
                        <h2 className="text-2xl font-bold text-gray-800">Profile Details</h2>
                    </div>

                    {msg.content && (
                        <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {msg.content}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={profileData.username}
                                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-secondary"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-secondary"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="flex items-center gap-2 text-gray-500 mb-4">
                                <Shield size={16} /> Role: <span className="font-bold uppercase text-primary">{user?.role}</span>
                            </p>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2"
                            >
                                <Save size={20} />
                                {loading ? 'Saving...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <Lock className="text-secondary" size={32} />
                        <h2 className="text-2xl font-bold text-gray-800">Security</h2>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-800">
                        For security reasons, your password is masked. You can change it below.
                    </div>

                    {passMsg.content && (
                        <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${passMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {passMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {passMsg.content}
                        </div>
                    )}

                    <form onSubmit={handlePassChange} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Current Password</label>
                            <input
                                type="password"
                                value={passData.currentPassword}
                                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-secondary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-bold mb-2">New Password ((Min 6 chars)</label>
                            <input
                                type="password"
                                value={passData.newPassword}
                                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-secondary"
                                minLength={6}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={passData.confirmPassword}
                                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-secondary"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={passLoading}
                            className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-black transition mt-4"
                        >
                            {passLoading ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default UserProfile;
