const SendMail = require("./nodemailer.config");
const httpStatusText = require("../utils/httpStatus");
const appError = require("../utils/appError");
const emailTamplate = require("./emailTempaltes");

const sendVerificationEmail = async (email, verificationCode , name) => {
  try {
    const mailOptions = {
      email: email,
      subject: "Email Verification",
      message: emailTamplate.VERIFICATION_EMAIL_TEMPLATE.replace(
        "{name}",
        name  
      ).replace(  
        "{verificationCode}", 
        verificationCode
      ),
    };

    await SendMail(mailOptions);
  } catch (err) {
    console.log(err);
    const error = appError.create(err.message, 400, httpStatusText.FAIL);
    return next(error);
  }
};
const WelocomeMassege = async (email, name) => {
  try {
    const mailOptions = {
      email: email,
      subject: "Welcome To Your Bank",
      message: emailTamplate.WELCOME_EMAIL_TEMPLATE.replace(
        "{name}",
        name
      ),
    };

    await SendMail(mailOptions);
  } catch (err) {
    console.log(err);
    const error = appError.create(err.message, 400, httpStatusText.FAIL);
    return next(error);
  }
};

const  sendPasswordResetEmail = async (email, resetURL ,name)  => {
  try {
    const mailOptions = {
      email: email,
      subject: "Password Reset",
      message: emailTamplate.PASSWORD_RESET_REQUEST_TEMPLATE.replace(
        "{name}",
        name  
      ).replace(  
        "{resetURL}", 
        resetURL
      ),
    };

    await SendMail(mailOptions);
  } catch (err) {
    console.log(err);
    const error = appError.create(err.message, 400, httpStatusText.FAIL);
    return next(error);
  }
};

const passwordSuccess  = async (email) => {
  try {
    const mailOptions = {
      email: email,
      subject: "Password Reset",
      message: emailTamplate.PASSWORD_RESET_SUCCESS_TEMPLATE,
    };

    await SendMail(mailOptions);    
  } catch (err) {
    console.log(err);
    const error = appError.create(err.message, 400, httpStatusText.FAIL);
    return next(error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  passwordSuccess,
  WelocomeMassege
};

