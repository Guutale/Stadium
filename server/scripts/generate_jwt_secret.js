const crypto = require('crypto');

// Generate a secure random JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('🔐 GENERATED SECURE JWT SECRET:\n');
console.log('═══════════════════════════════════════════════════════════════');
console.log(jwtSecret);
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('⚠️  IMPORTANT: Copy this value and update your .env file:\n');
console.log(`JWT_SECRET=${jwtSecret}\n`);
console.log('⚠️  Keep this secret safe and never commit it to version control!\n');
