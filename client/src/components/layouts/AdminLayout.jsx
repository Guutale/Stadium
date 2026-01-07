import React from 'react';
import Sidebar from '../Sidebar';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { isAuthenticated, user, loading } = useAuth(); // used the hook

    if (loading) return <div className="text-center mt-20 text-white">Loading Admin...</div>;

    if (!isAuthenticated) return <Navigate to="/login" />;

    // STRICT check for admin
    if (!user || user.role !== 'admin') return <Navigate to="/" />;

    return (
        <div className="flex min-h-screen bg-admin-bg">
            {/* Sidebar */}
            <div className="hidden md:block w-64 fixed h-full z-10">
                <Sidebar />
            </div>

            {/* Mobile Header/Toggle placeholder - can be added inside Sidebar or here */}
            {/* For now assuming Sidebar handles mobile visibility or we just show it fixed on Desktop */}

            {/* Main Content */}
            <main className="flex-grow md:ml-64 p-8 overflow-x-hidden min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
