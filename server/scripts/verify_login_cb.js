const http = require('http');

const data = JSON.stringify({
    email: 'cb@gmail.com',
    password: '123456'
});

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('BODY:', body);
        if (res.statusCode === 200) {
            console.log('✅ LOGIN VERIFICATION PASSED');
        } else {
            console.log('❌ LOGIN VERIFICATION FAILED');
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
