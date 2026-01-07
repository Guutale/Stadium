import React from 'react';

const SeatMap = ({ bookedSeats, selectedSeats, onSeatSelect, vipPrice, regularPrice }) => {
    const rows = 10;
    const cols = 15;
    const seats = [];

    // Generate seats
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const rowLabel = String.fromCharCode(65 + r);
            const seatId = `${rowLabel}${c + 1}`;
            seats.push({ id: seatId, row: rowLabel });
        }
    }

    const getSeatStatus = (seatId) => {
        if (bookedSeats.includes(seatId)) return 'booked';
        if (selectedSeats.includes(seatId)) return 'selected';
        return 'available';
    };

    const isVip = (row) => row === 'A' || row === 'B';

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold mb-4 text-center">Select Seats</h3>
            <div className="mb-4 flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-yellow-400 rounded ring-2 ring-yellow-200"></span> VIP (${vipPrice})</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-gray-200 rounded"></span> Regular (${regularPrice})</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-500 rounded"></span> Selected</div>
                <div className="flex items-center gap-2"><span className="w-4 h-4 bg-red-500 rounded"></span> Booked</div>
            </div>

            <div className="flex justify-center mb-6">
                <div className="w-2/3 h-12 bg-gray-800 rounded-t-xl flex items-center justify-center text-white font-bold">
                    FIELD
                </div>
            </div>

            <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1 md:gap-2 max-w-3xl mx-auto">
                {seats.map(seat => {
                    const status = getSeatStatus(seat.id);
                    const isBooked = status === 'booked';
                    const isSelected = status === 'selected';
                    const vip = isVip(seat.row);

                    return (
                        <button
                            key={seat.id}
                            disabled={isBooked}
                            onClick={() => onSeatSelect(seat.id)}
                            className={`
                                w-6 h-6 md:w-8 md:h-8 rounded text-[10px] md:text-xs font-bold flex items-center justify-center transition
                                ${isBooked ? 'bg-red-500 text-white cursor-not-allowed' : ''}
                                ${isSelected ? 'bg-green-500 text-white transform scale-110' : ''}
                                ${status === 'available' && vip ? 'bg-yellow-400 hover:bg-yellow-500 ring-2 ring-yellow-200' : ''}
                                ${status === 'available' && !vip ? 'bg-gray-200 hover:bg-gray-300' : ''}
                            `}
                            title={`${seat.id} - $${vip ? vipPrice : regularPrice}`}
                        >
                            {seat.id}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 text-center text-gray-500 text-sm">
                <p>Rows A-B are VIP. Rows C-J are Regular.</p>
            </div>
        </div>
    );
};

export default SeatMap;
