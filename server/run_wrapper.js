
const { spawn } = require('child_process');

console.log("Starting server process...");
const child = spawn('node', ['server.js'], { stdio: 'pipe' });

child.stdout.on('data', (data) => {
    process.stdout.write(`[STDOUT] ${data}`);
});

child.stderr.on('data', (data) => {
    process.stdout.write(`[STDERR] ${data}`);
});

child.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
});
