const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();



const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
 const SendMail = async (options) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };
    await transporter.sendMail(mailOptions);
  };
  module.exports = SendMail;