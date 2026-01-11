import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { User, Mail, Lock, Shield, Save, AlertCircle, CheckCircle, Edit2, X } from 'lucide-react';

const AdminProfile = () => {
  const { user, loading: authLoading } = useAuth();

  // Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: ''
  });

  // Password State
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Feedback State
  const [loading, setLoading] = useState(false); // For profile save
  const [passLoading, setPassLoading] = useState(false); // For password change
  const [msg, setMsg] = useState({ type: '', content: '' });
  const [passMsg, setPassMsg] = useState({ type: '', content: '' });

  // Initialize
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // Handlers
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', content: '' });

    try {
      const res = await api.put('/auth/update-profile', profileData);
      setMsg({ type: 'success', content: res.data.message });
      setIsEditing(false);
    } catch (err) {
      setMsg({ type: 'error', content: err.response?.data?.message || 'Update failed' });
    }
    setLoading(false);
  };

  const handlePassChange = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', content: '' });

    if (passData.newPassword !== passData.confirmPassword) {
      setPassMsg({ type: 'error', content: 'New passwords do not match' });
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassMsg({ type: 'error', content: 'Password must be at least 6 characters' });
      return;
    }

    setPassLoading(true);

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

  if (authLoading || !user) return <div className="text-white text-center mt-10">Loading Profile...</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Profile</h1>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Profile Card */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8 h-fit">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-3xl font-bold text-white shadow-inner border-2 border-gray-600">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-blue-900 text-blue-200 text-xs px-2 py-0.5 rounded uppercase font-bold border border-blue-700">
                    {user.role}
                  </span>
                  <span className="text-gray-400 text-sm">
                    Member since {new Date(user.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-700 rounded-lg"
                title="Edit Profile"
              >
                <Edit2 size={20} />
              </button>
            )}
          </div>

          {msg.content && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
              {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {msg.content}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isEditing ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-gray-900/50 border-transparent text-gray-300'}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isEditing ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'bg-gray-900/50 border-transparent text-gray-300'}`}
                    required
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
                >
                  {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setMsg({ type: '', content: '' }); }}
                  className="px-4 py-2.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-blue-500" size={28} />
            <h2 className="text-2xl font-bold text-white">Security</h2>
          </div>

          <div className="bg-blue-900/20 text-blue-300 p-4 rounded-lg mb-6 text-sm border border-blue-900/50">
            Passwords are encrypted and never shown. Use this form to securely update your password.
          </div>

          {passMsg.content && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${passMsg.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
              {passMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {passMsg.content}
            </div>
          )}

          <form onSubmit={handlePassChange} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                  type="password"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                  type="password"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Min 6 characters"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                  type="password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="Re-enter new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition shadow-lg"
            >
              {passLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
