import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Calendar, Clock, MapPin, Download, Printer, ShieldCheck } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Ticket = ({ booking, match, onClose }) => {
    const ticketRef = useRef();

    const handleDownload = async () => {
        const element = ticketRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher resolution
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`ticket-${match.homeTeam}-vs-${match.awayTeam}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to download ticket. Please try again.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!booking || !match) return null;

    // Check if match has started
    const matchDate = new Date(match.date);
    const [hours, minutes] = match.time.split(':');
    matchDate.setHours(parseInt(hours), parseInt(minutes));
    const isStarted = new Date() >= matchDate;

    // Status text logic
    const getStatusDisplay = () => {
        if (booking.bookingStatus === 'cancelled') return { text: 'CANCELLED', color: 'bg-red-600' };
        if (booking.bookingStatus === 'rescheduled') return { text: 'RESCHEDULED', color: 'bg-purple-600' };
        if (booking.bookingStatus === 'refunded') return { text: 'REFUNDED', color: 'bg-gray-600' };
        if (isStarted) return { text: 'STARTED', color: 'bg-orange-500' };
        return { text: 'CONFIRMED', color: 'bg-green-600' };
    };

    const status = getStatusDisplay();

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-2xl">
                {/* Actions Bar */}
                <div className="flex justify-end gap-3 mb-4 print:hidden">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition"
                    >
                        <Download size={18} /> Download
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition"
                    >
                        <Printer size={18} /> Print
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition"
                    >
                        Close
                    </button>
                </div>

                {/* Ticket Content */}
                <div ref={ticketRef} className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="bg-primary text-white p-8 relative overflow-hidden">
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold font-heading mb-2">Stadium<span className="text-secondary">Manager</span></h1>
                                <p className="opacity-80 text-sm tracking-widest uppercase">Official Digital Ticket</p>
                            </div>
                            <div className={`${status.color} px-4 py-2 rounded-lg font-bold text-sm tracking-wider shadow-lg`}>
                                {status.text}
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-800 rounded-full opacity-50 blur-2xl"></div>
                    </div>

                    {/* Match Info */}
                    <div className="p-8 border-b-2 border-dashed border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-primary mb-1">{match.homeTeam}</h2>
                                <p className="text-sm text-gray-500 font-bold uppercase">Home Team</p>
                            </div>
                            <div className="text-xl font-bold text-secondary bg-primary px-4 py-2 rounded-full">VS</div>
                            <div className="flex-1 text-center md:text-right">
                                <h2 className="text-3xl font-bold text-primary mb-1">{match.awayTeam}</h2>
                                <p className="text-sm text-gray-500 font-bold uppercase">Away Team</p>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="p-8 bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <div>
                                <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm font-bold uppercase">
                                    <Calendar size={14} /> Date
                                </div>
                                <p className="font-bold text-lg">{new Date(match.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm font-bold uppercase">
                                    <Clock size={14} /> Time
                                </div>
                                <p className="font-bold text-lg">{match.time}</p>
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm font-bold uppercase">
                                    <MapPin size={14} /> Stadium
                                </div>
                                <p className="font-bold text-lg truncate">{match.stadium?.name || "Stadium Info Unavailable"}</p>
                            </div>
                        </div>

                        {/* Seat & Booking Info */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 grid md:grid-cols-2 gap-6 items-center">
                            <div>
                                <div className="mb-4">
                                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Row & Seats</p>
                                    <p className="text-2xl font-bold text-primary">{booking.seats.join(', ')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Booking Reference</p>
                                    <p className="font-mono bg-gray-100 px-2 py-1 rounded inline-block text-sm">{booking._id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-lg">
                                <QRCodeCanvas
                                    value={JSON.stringify({
                                        bookingId: booking._id,
                                        matchId: match._id,
                                        seats: booking.seats,
                                        user: booking.user
                                    })}
                                    size={120}
                                    level={"H"}
                                />
                                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide">Scan for Entry</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-100 p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                        <ShieldCheck size={14} className="text-green-600" />
                        <span>This is a verified digital ticket. Valid for one-time entry only.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ticket;
