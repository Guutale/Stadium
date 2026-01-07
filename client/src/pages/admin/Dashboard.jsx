import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalStadiums: 0,
        totalMatches: 0,
        ticketsSold: 0, 
        totalRevenue: 0,
        totalUsers: 0 
    });
    const [revenueData, setRevenueData] = useState([]);
    const [audienceData, setAudienceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, revenueRes] = await Promise.all([
                api.get('/reports/stats'),
                api.get('/reports/revenue')
            ]);

            setStats(statsRes.data);
            setRevenueData(revenueRes.data);

            // Mock Audience Data for Pie Chart
            setAudienceData([
                { name: 'VIP Ticket', value: 400 },
                { name: 'Regular Ticket', value: 300 },
                { name: 'Concert', value: 300 },
            ]);

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white">Loading Dashboard...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Welcome Admin</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <KPICard title="Total Users" value={stats.totalUsers} color="bg-blue-600" />
                <KPICard title="Total Booking" value={stats.totalBookings} color="bg-green-600" />
                <KPICard title="Total Revenue" value={`$${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : 0}`} color="bg-orange-500" />
                <KPICard title="Ticket Sold" value={stats.ticketsSold} color="bg-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Sales & Revenue Chart - Lines/Bars */}
                <div className="lg:col-span-2 bg-admin-card p-6 rounded-xl shadow-lg border border-gray-700">
                    <h3 className="text-white font-bold mb-4">Daily Sales & Revenue</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="_id" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                                <Legend />
                                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Audience Overview - Pie */}
                <div className="bg-admin-card p-6 rounded-xl shadow-lg border border-gray-700">
                    <h3 className="text-white font-bold mb-4">Audience Overview</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={audienceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {audienceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Bookings Table Snippet */}
            <div className="bg-admin-card rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-white font-bold">Top Events</h3>
                    <button className="text-sm text-gray-400 hover:text-white">See all</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-400">
                        <thead className="bg-gray-800 text-gray-200 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Transaction</th>
                                <th className="px-6 py-3">Event</th>
                                <th className="px-6 py-3">Stadium</th>
                                <th className="px-6 py-3">Ticket Sold</th>
                                <th className="px-6 py-3">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            <tr className="hover:bg-gray-800 transition">
                                <td className="px-6 py-4">TR-12334</td>
                                <td className="px-6 py-4">Sports</td>
                                <td className="px-6 py-4">Camp Nou</td>
                                <td className="px-6 py-4">45,000</td>
                                <td className="px-6 py-4">$300,000</td>
                            </tr>
                            <tr className="hover:bg-gray-800 transition">
                                <td className="px-6 py-4">TR-1345</td>
                                <td className="px-6 py-4">Sports</td>
                                <td className="px-6 py-4">Bernabeu</td>
                                <td className="px-6 py-4">32,000</td>
                                <td className="px-6 py-4">$250,000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, color }) => (
    <div className={`${color} p-6 rounded-xl shadow-lg text-white`}>
        <h3 className="text-sm font-medium opacity-90 mb-1">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
    </div>
);

export default AdminDashboard;
