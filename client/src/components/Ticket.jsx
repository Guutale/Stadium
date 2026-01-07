import React from 'react';

const Ticket = ({ booking, onClose }) => {
    if (!booking) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 printable-modal">
            <div className="bg-white text-black p-8 rounded-xl max-w-md w-full shadow-2xl relative printable-content">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold text-xl no-print">&times;</button>

                <div className="text-center border-b-2 border-dashed border-gray-300 pb-6 mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Mogadishu Stadium</h2>
                    <p className="text-sm text-gray-600">Official Event Ticket</p>
                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-1 text-center">{booking.match?.homeTeam || 'Home'} vs {booking.match?.awayTeam || 'Away'}</h3>
                    <p className="text-gray-500 text-center text-sm">{new Date(booking.match?.date || booking.bookingDate).toLocaleDateString()} | {booking.match?.time || 'TBA'}</p>
                    <p className="text-center font-bold mt-2">{booking.match?.stadium?.name || 'Main Stadium'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                        <p className="text-gray-500 text-xs uppercase">Guest</p>
                        <p className="font-bold">{booking.user?.username || booking.user?.email || 'Guest'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase">Seats</p>
                        <p className="font-bold">{booking.seats && booking.seats.length > 0 ? booking.seats.join(', ') : 'General Admission'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase">Amount Paid</p>
                        <p className="font-bold">${booking.totalAmount}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase">Status</p>
                        <p className="font-bold uppercase">{booking.paymentStatus}</p>
                    </div>
                </div>

                <div className="text-center border-t-2 border-dashed border-gray-300 pt-6">
                    <div className="mb-4">
                        {/* Mock Barcode */}
                        <div className="h-12 bg-black mx-auto w-3/4 opacity-80" style={{ background: 'repeating-linear-gradient(90deg, black, black 2px, white 2px, white 4px)' }}></div>
                        <p className="text-xs mt-1 text-gray-500">{booking._id}</p>
                    </div>

                    <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition no-print">
                        Print / Download
                    </button>
                    <p className="text-xs text-gray-400 mt-4 no-print">Press Print to save as PDF</p>
                </div>
            </div>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-content, .printable-content * {
                        visibility: visible;
                    }
                    .printable-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        box-shadow: none;
                        border: 2px solid #000;
                    }
                    .no-print {
                        display: none;
                    }
                    .printable-modal {
                        background: white;
                        position: absolute;
                    }
                }
            `}</style>
        </div>
    );
};

export default Ticket;
