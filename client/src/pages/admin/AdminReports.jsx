import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Download, Filter, FileText, DollarSign, Users, Calendar } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminReports = () => {
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [detailedData, setDetailedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const query = dateRange.start && dateRange.end ? `?startDate=${dateRange.start}&endDate=${dateRange.end}` : '';

            const [statsRes, revRes, detailedRes] = await Promise.all([
                api.get(`/reports/stats${query}`),
                api.get(`/reports/revenue${query}`),
                api.get(`/reports/detailed${query}`)
            ]);

            setStats(statsRes.data);
            setRevenueData(revRes.data);
            setDetailedData(detailedRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching reports:", err);
            setLoading(false);
        }
    };

    const handleExport = (type) => {
        if (!detailedData) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        let filename = "report.csv";

        if (type === 'bookings') {
            csvContent += "Date,Count\n";
            detailedData.bookingTrends.forEach(row => {
                csvContent += `${row._id},${row.count}\n`;
            });
            filename = "booking_trends.csv";
        } else if (type === 'revenue') {
            csvContent += "Date,Amount\n";
            revenueData.forEach(row => {
                csvContent += `${row._id},${row.total}\n`;
            });
            filename = "revenue_report.csv";
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Reports...</div>;

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white">Report Analysis Dashboard</h1>

                <div className="flex items-center gap-4 bg-gray-800 p-2 rounded-lg border border-gray-700">
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="bg-gray-700 text-white px-3 py-1 rounded text-sm focus:outline-none"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="bg-gray-700 text-white px-3 py-1 rounded text-sm focus:outline-none"
                    />
                    <button onClick={() => setDateRange({ start: '', end: '' })} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">Clear</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-700 overflow-x-auto">
                {['overview', 'bookings', 'payments', 'users'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-4 capitalize font-bold transition whitespace-nowrap cursor-pointer ${activeTab === tab ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Content */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard title="Total Revenue" value={`$${stats?.totalRevenue?.toLocaleString()}`} icon={<DollarSign />} color="text-green-400" />
                        <KPICard title="Tickets Sold" value={stats?.ticketsSold?.toLocaleString()} icon={<FileText />} color="text-blue-400" />
                        <KPICard title="Total Bookings" value={stats?.totalBookings?.toLocaleString()} icon={<Calendar />} color="text-purple-400" />
                        <KPICard title="Total Users" value={stats?.totalUsers?.toLocaleString()} icon={<Users />} color="text-orange-400" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Revenue Chart */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Revenue Trend (Last 7 Days)</h3>
                                <button onClick={() => handleExport('revenue')} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white flex items-center gap-2 cursor-pointer">
                                    <Download size={14} /> CSV
                                </button>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                        <XAxis dataKey="_id" stroke="#aaa" />
                                        <YAxis stroke="#aaa" />
                                        <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
                                        <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Booking Status Pie */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h3 className="text-xl font-bold text-white mb-6">Booking Status Breakdown</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={detailedData?.bookingStatus}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="_id"
                                            label
                                        >
                                            {detailedData?.bookingStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-white">Daily Booking Trends</h3>
                        <button onClick={() => handleExport('bookings')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 cursor-pointer">
                            <Download size={18} /> Export Data
                        </button>
                    </div>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={detailedData?.bookingTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="_id" stroke="#aaa" />
                                <YAxis stroke="#aaa" />
                                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
                                <Bar dataKey="count" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-8">Revenue by Payment Method</h3>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={detailedData?.paymentMethodRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="_id" stroke="#aaa" />
                                <YAxis stroke="#aaa" />
                                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="total" fill="#10B981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-8">New User Registrations (Monthly)</h3>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={detailedData?.userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="_id" stroke="#aaa" />
                                <YAxis stroke="#aaa" />
                                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
                                <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

const KPICard = ({ title, value, icon, color }) => (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow flex items-center gap-4">
        <div className={`p-3 rounded-full bg-opacity-20 ${color.replace('text', 'bg')}`}>
            <span className={color}>{icon}</span>
        </div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <h4 className="text-2xl font-bold text-white">{value}</h4>
        </div>
    </div>
);

export default AdminReports;
