import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import Ticket from '../../components/Ticket';

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        // Fetch all bookings as "payments" source or specific payment endpoint
        fetchPayments();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payment record? This will assume refund/cancellation.')) return;
        try {
            await api.delete(`/bookings/${id}`);
            setPayments(payments.filter(p => p._id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete');
        }
    };

    const fetchPayments = async () => {
        try {
            const res = await api.get('/bookings'); // Re-using bookings for now as they hold payment status
            // Filter only non-pending or all? Requirement says Payment Management.
            // Let's show all but highlight payment info
            setPayments(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Payment Management</h1>
                {/* Summary Cards specific to Payments */}
                <div className="flex gap-4">
                    <div className="bg-green-900 text-green-300 px-4 py-2 rounded-lg text-sm font-bold">
                        Total Collected: ${payments.filter(p => p.paymentStatus === 'paid').reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by Transaction ID or User Email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent"
                />
                <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent"
                />
            </div>

            <div className="bg-admin-card rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-800 text-gray-200 uppercase text-sm">
                        <tr>
                            <th className="p-4 border-b border-gray-700 font-bold">Transaction ID</th>
                            <th className="p-4 border-b border-gray-700 font-bold">User</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Amount</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Date</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Method</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Status</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {payments
                            .filter(payment => {
                                const matchesSearch = (payment._id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (payment.stripePaymentIntentId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (payment.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
                                const matchesDate = !searchDate || new Date(payment.bookingDate).toISOString().split('T')[0] === searchDate;
                                return matchesSearch && matchesDate;
                            })
                            .map(payment => (
                                <tr key={payment._id} className="hover:bg-gray-800 transition border-b border-gray-700 last:border-0">
                                    <td className="p-4 font-mono text-xs">{payment.stripePaymentIntentId || payment._id.substring(0, 8)}</td>
                                    <td className="p-4">{payment.user?.email}</td>
                                    <td className="p-4 text-green-400 font-bold">${payment.totalAmount}</td>
                                    <td className="p-4">{new Date(payment.bookingDate).toLocaleDateString()}</td>
                                    <td className="p-4">Stripe / Card</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${payment.paymentStatus === 'paid' ? 'bg-green-900 text-green-300' :
                                            payment.paymentStatus === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                                            }`}>
                                            {payment.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => setSelectedTicket(payment)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-500 transition">Ticket</button>
                                        <button onClick={() => handleDelete(payment._id)} className="text-red-400 hover:text-red-300 font-bold text-xs ml-2 transition">Delete</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            {
                selectedTicket && (
                    <Ticket booking={selectedTicket} onClose={() => setSelectedTicket(null)} />
                )
            }
        </div >
    );
};

export default AdminPayments;
