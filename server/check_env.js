
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
    console.log("Error loading .env:", result.error.message);
} else {
    console.log(".env loaded successfully");
}

console.log("STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
