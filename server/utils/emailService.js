const nodemailer = require('nodemailer');

// For development, we will just log the email to the console.
// If you have real SMTP credentials (e.g. Gmail, SendGrid), you can configure them here.
const sendEmail = async (options) => {

    // 1. Create Transporter (Mock for now, or use Ethereal)
    // const transporter = nodemailer.createTransport({
    //     host: process.env.SMTP_HOST,
    //     port: process.env.SMTP_PORT,
    //     auth: {
    //         user: process.env.SMTP_EMAIL,
    //         pass: process.env.SMTP_PASSWORD
    //     }
    // });

    // Since we don't have env vars set up for a real provider in this context,
    // we will simulate the email sending.

    console.log("=======================================================");
    console.log("📧 EMAIL SERVICE SIMULATION");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);

    if (options.attachments && options.attachments.length > 0) {
        console.log("📎 Attachments:");
        options.attachments.forEach(att => {
            console.log(`   - ${att.path}`);
        });
    }

    console.log("=======================================================");

    // In a real app, you would await transporter.sendMail(message);
    return true;
};

module.exports = sendEmail;
