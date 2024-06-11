const mongoose = require('mongoose');
const mailSender = require('../utils/sendEmail');

const otpSchema = new mongoose.Schema({
    emailAddress: {
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default: Date.now,
        expires:60*2  // The document will be automatically deleted after 2 minutes of its creation time
    }
})

async function sendVerificationEmail(emailAddress, otp) {
    try {
      const mailResponse = await mailSender(
        emailAddress,
        "Verification Email",
        `<h1>Please confirm your OTP</h1>
         <p>Here is your OTP code: ${otp}</p>`
      );
      console.log("Email sent successfully: ", mailResponse);
    } catch (error) {
      console.log("Error occurred while sending email: ", error);
      throw error;
    }
  }
  otpSchema.pre("save", async function (next) {
    console.log("New document saved to the database");
    // Only send an email when a new document is created
    if (this.isNew) {
      await sendVerificationEmail(this.emailAddress, this.otp);
    }
    next();
  });
  module.exports = mongoose.model("OTP", otpSchema);