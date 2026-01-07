const dotenv = require('dotenv');
const path = require('path');

console.log('🔍 ENVIRONMENT VARIABLE DIAGNOSTIC TEST\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Current working directory
console.log('📂 Current working directory:');
console.log(`   ${process.cwd()}\n`);

// Test 2: .env file location
const envPath = path.join(__dirname, '.env');
console.log('📄 .env file path:');
console.log(`   ${envPath}`);

// Check if file exists
const fs = require('fs');
const exists = fs.existsSync(envPath);
console.log(`   File exists: ${exists ? '✅ YES' : '❌ NO'}\n`);

if (exists) {
    // Show file contents
    const contents = fs.readFileSync(envPath, 'utf8');
    console.log('📝 .env file contents:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(contents);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Test 3: Load environment variables
console.log('🔐 Loading environment variables with dotenv.config()...');
const result = dotenv.config();

if (result.error) {
    console.log(`   ❌ ERROR: ${result.error.message}\n`);
} else {
    console.log('   ✅ SUCCESS\n');
}

// Test 4: Check critical environment variables
console.log('🔑 Critical environment variables:');
console.log(`   PORT: ${process.env.PORT || '❌ NOT SET'}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI || '❌ NOT SET'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET || '❌ NOT SET'}`);
console.log('');

// Test 5: Check if JWT_SECRET changes
console.log('⚠️  WARNING CHECK:');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key_here') {
    console.log('   🚨 JWT_SECRET is using default/weak value!');
    console.log('   This might cause token validation issues.');
} else {
    console.log('   ✅ JWT_SECRET is set to a custom value');
}
console.log('');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
