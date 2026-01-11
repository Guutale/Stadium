const PDFDocument = require('pdfkit');
const fs = require('fs');
const QRCode = require('qrcode');
const path = require('path');

const generateTicket = async (booking) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });

            // Define output path
            const filename = `ticket-${booking._id}.pdf`;
            const ticketsDir = path.join(__dirname, '../tickets');

            if (!fs.existsSync(ticketsDir)) {
                fs.mkdirSync(ticketsDir);
            }

            const filePath = path.join(ticketsDir, filename);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // --- Header ---
            doc.fontSize(25).font('Helvetica-Bold').text('ONLINE STADIUM TICKET', { align: 'center' });
            doc.moveDown();

            // --- Match Details ---
            doc.fontSize(18).font('Helvetica').text(booking.match.teams.home + ' VS ' + booking.match.teams.away, { align: 'center' });
            doc.moveDown(0.5);

            doc.fontSize(14).text(`Date: ${new Date(booking.match.date).toLocaleDateString()}`, { align: 'center' });
            doc.text(`Time: ${booking.match.time}`, { align: 'center' });
            doc.text(`Stadium: ${booking.match.stadium.name}`, { align: 'center' });
            doc.text(`Location: ${booking.match.stadium.location}`, { align: 'center' });

            doc.moveDown();
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // --- Booking Details ---
            doc.fontSize(12).text('Booking ID: ' + booking._id);
            doc.text('Customer: ' + booking.user.username);
            doc.text('Email: ' + booking.user.email);

            doc.moveDown();
            doc.font('Helvetica-Bold').text('Seats:', { underline: true });
            doc.font('Helvetica').text(booking.seats.join(', '));

            doc.moveDown();
            doc.font('Helvetica-Bold').text(`Total Price: $${booking.totalAmount}`);

            // --- QR Code ---
            // Generate QR Code as Data URL
            const qrData = JSON.stringify({
                id: booking._id,
                match: booking.match._id,
                seats: booking.seats
            });

            const qrImage = await QRCode.toDataURL(qrData);

            // Add QR Code image to PDF
            doc.image(qrImage, 200, 450, { width: 150 });
            doc.text('Scan at the gate', 200, 610, { align: 'center', width: 150 });

            // --- Footer ---
            doc.fontSize(10).text('Thank you for booking with Online Stadium.', 50, 700, { align: 'center', width: 500 });

            doc.end();

            stream.on('finish', () => {
                resolve(filePath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateTicket };
