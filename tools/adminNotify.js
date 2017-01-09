const nodemailer = require('nodemailer');

exports.sendEmail = (subject, message) => {
    const transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
            user: process.env.MAILGUN_USER,
            pass: process.env.MAILGUN_PASSWORD
        }
    });
    const mailOptions = {
        to: 'info@raddamaten.se',
        from: '"Räddamaten" <notify@raddamaten.se>', 
        subject: subject,
        text: message
    };
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.log('Error when notifying admin '+err.message)
        } else {
            console.log('Successfully sent notfification to admin.')
        }
    });
};