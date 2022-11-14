const nodemailer = require("nodemailer");

const emailHelper = async (option) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        // secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // generated ethereal user
            pass: process.env.SMTP_PASS, // generated ethereal password
        },
    });
    console.log(transporter);
    const message = {
        from: 'Tshirtstore', // sender address
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        text: option.message, // plain text body
        // html: "<a>Hello world?</a>", // html body
    }
    console.log(message);
    // send mail with defined transport object
    await transporter.sendMail(message);
}

module.exports = emailHelper