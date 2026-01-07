import React from 'react';

const AdminReports = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Report Analysis</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-admin-card p-6 rounded-xl shadow-lg border border-gray-700">
                    <h3 className="text-white font-bold mb-4">Export Reports</h3>
                    <p className="text-gray-400 mb-4">Download data for offline analysis.</p>
                    <div className="flex gap-4">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold">Export Bookings (CSV)</button>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold">Export Revenue (PDF)</button>
                    </div>
                </div>

                <div className="bg-admin-card p-6 rounded-xl shadow-lg border border-gray-700">
                    <h3 className="text-white font-bold mb-4">System Health</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm text-gray-400 mb-1">
                                <span>Server Status</span>
                                <span className="text-green-400">Online</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-green-500 w-full h-full"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm text-gray-400 mb-1">
                                <span>Database Connection</span>
                                <span className="text-green-400">Stable</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-green-500 w-full h-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
