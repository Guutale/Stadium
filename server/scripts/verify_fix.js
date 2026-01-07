const http = require('http');

const data = JSON.stringify({
    email: 'test_verification@gmail.com',
    password: 'password123'
});

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing Registration Config:', options);

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('BODY:', body);
        if (res.statusCode === 201) {
            console.log('✅ VERIFICATION PASSED: User registered successfully.');
        } else if (res.statusCode === 409) {
            console.log('⚠️ INFO: User already exists (Verification technically passed if 409 returned correctly)');
        } else {
            console.log('❌ VERIFICATION FAILED');
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
