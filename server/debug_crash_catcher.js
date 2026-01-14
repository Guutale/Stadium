
try {
    console.log("Attempting to require server.js...");
    require('./server.js');
} catch (err) {
    console.log("CAUGHT ERROR:");
    console.log(JSON.stringify({
        message: err.message,
        code: err.code,
        stack: err.stack
    }, null, 2));
}
