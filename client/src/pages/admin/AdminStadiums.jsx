import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const AdminStadiums = () => {
    const [stadiums, setStadiums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: '',
        description: '',
        vipPrice: '',
        regularPrice: '',
        imageUrl: ''
    });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStadiums();
    }, []);

    const fetchStadiums = async () => {
        try {
            const res = await api.get('/stadiums');
            setStadiums(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this stadium?')) {
            try {
                await api.delete(`/stadiums/${id}`);
                setStadiums(stadiums.filter(s => s._id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete');
            }
        }
    };

    const handleEdit = (stadium) => {
        setFormData({
            _id: stadium._id,
            name: stadium.name,
            location: stadium.location,
            capacity: stadium.capacity,
            description: stadium.description,
            vipPrice: stadium.vipPrice || '',
            regularPrice: stadium.regularPrice || '',
            imageUrl: stadium.images && stadium.images.length > 0 ? stadium.images[0] : ''
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setFormData({ name: '', location: '', capacity: '', description: '', vipPrice: '', regularPrice: '', imageUrl: '' });
    };

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                images: formData.imageUrl ? [formData.imageUrl] : []
            };

            if (formData._id) {
                // Update existing
                const res = await api.put(`/stadiums/${formData._id}`, dataToSend);
                setStadiums(stadiums.map(s => s._id === formData._id ? res.data : s));
            } else {
                // Create new
                const res = await api.post('/stadiums', dataToSend);
                setStadiums([res.data, ...stadiums]);
            }
            handleCancel();
        } catch (err) {
            console.error(err);
            alert(`Failed to ${formData._id ? 'update' : 'add'} stadium`);
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Stadium Management</h1>
                <button
                    onClick={() => {
                        if (showForm) handleCancel();
                        else setShowForm(true);
                    }}
                    className="bg-admin-accent text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition shadow-lg"
                >
                    {showForm ? 'Cancel' : 'Add New Stadium'}
                </button>
            </div>

            {showForm && (
                <div className="bg-admin-card p-6 rounded-xl shadow-lg mb-8 border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 text-white">{formData._id ? 'Edit Stadium' : 'Add New Stadium'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Stadium Name" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required />
                        <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required />
                        <input name="capacity" type="number" value={formData.capacity} onChange={handleChange} placeholder="Capacity" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required />
                        <input name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" />
                        <input name="vipPrice" type="number" value={formData.vipPrice} onChange={handleChange} placeholder="VIP Base Price" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required />
                        <input name="regularPrice" type="number" value={formData.regularPrice} onChange={handleChange} placeholder="Regular Base Price" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent" required />
                        <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Stadium Image URL" className="p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent md:col-span-2" />
                        <button type="submit" className="col-span-1 md:col-span-2 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">{formData._id ? 'Update Stadium' : 'Save Stadium'}</button>
                    </form>
                </div>
            )}

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by Stadium Name or Location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-admin-accent"
                />
            </div>

            <div className="bg-admin-card rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-800 text-gray-200 uppercase text-sm">
                        <tr>
                            <th className="p-4 border-b border-gray-700 font-bold">Name</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Location</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Capacity</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Status</th>
                            <th className="p-4 border-b border-gray-700 font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {stadiums
                            .filter(stadium =>
                                stadium.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                stadium.location.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(stadium => (
                                <tr key={stadium._id} className="hover:bg-gray-800 transition border-b border-gray-700 last:border-0">
                                    <td className="p-4 font-medium text-white">{stadium.name}</td>
                                    <td className="p-4">{stadium.location}</td>
                                    <td className="p-4">{stadium.capacity.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${stadium.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                            {stadium.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        {/* Mock Actions as per requirements: Available, Selected, Booked (This is for seat map, here just generic Edit/Delete) */}
                                        <button onClick={() => handleEdit(stadium)} className="text-blue-400 hover:text-blue-300 font-bold">Edit</button>
                                        <button onClick={() => handleDelete(stadium._id)} className="text-red-400 hover:text-red-300 font-bold">Delete</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminStadiums;
