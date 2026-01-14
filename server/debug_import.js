
const tryRequire = (path) => {
    try {
        require(path);
        console.log(`✅ Success: ${path}`);
    } catch (e) {
        console.log(`❌ Failed: ${path}`);
        console.log(e.message);
        if (e.code === 'MODULE_NOT_FOUND') {
            console.log(e.stack);
        }
    }
};

console.log('Testing dependencies...');
tryRequire('dotenv');
tryRequire('express');
tryRequire('mongoose');
tryRequire('cors');
tryRequire('nodemailer');
tryRequire('pdfkit');
tryRequire('qrcode');

console.log('Testing models...');
tryRequire('./models/User');

console.log('Testing controllers...');
tryRequire('./controllers/bookingController');

console.log('Testing routes...');
tryRequire('./routes/auth');
tryRequire('./routes/stadiums');
tryRequire('./routes/matches');
tryRequire('./routes/bookings');
tryRequire('./routes/payments');
tryRequire('./routes/reports');
tryRequire('./routes/auditLogs');
tryRequire('./routes/systemSettings');
