const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../../.env' });

const transporter = nodemailer.createTransport({
    host: process.env.SMTP2GO_HOST,
    port: process.env.SMTP2GO_PORT,
    auth: {
        user: process.env.SMTP2GO_USER,
        pass: process.env.SMTP2GO_PASS
    }
});

const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        const mailOptions = {
            from: `"InnovationBridge AI" <${process.env.FROM_EMAIL}>`,
            to: userEmail,
            subject: 'Welcome to InnovationBridge AI!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome aboard, ${userName}! 🚀</h2>
                    <p>We are thrilled to have you join India's premier AI-powered innovation platform.</p>
                    <p>Whether you are here to upload the next big idea, fund a project, or acquire new technology, you are now part of our global network.</p>
                    <br>
                    <p>Best Regards,<br>The InnovationBridge AI Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent successfully to ${userEmail}`);
    } catch (error) {
        console.error("Error sending email via SMTP2GO:", error);
    }
};

module.exports = { sendWelcomeEmail };