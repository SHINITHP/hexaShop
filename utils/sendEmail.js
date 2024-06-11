const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const mailSender = async (emailAddress,title,body) => {
    try {
        //create a Transported to send emails
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            auth:{
                user:process.env.SMTP_MAIL,
                pass:process.env.SMPT_PASSWORD
            }
        })

        //SEND EMAIL TO USER
        let info = await transporter.sendMail({
            from:process.env.SMTP_MAIL,
            to:emailAddress,
            subject:title,
            html:body
        })

        console.log("email information : ",info);
        return info;
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = mailSender;