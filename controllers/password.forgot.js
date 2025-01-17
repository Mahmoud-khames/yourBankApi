const User = require("../models/userModels");
const bcrypt = require("bcrypt");
const httpStatusText = require("../utils/httpStatus");
const asyncWrapper = require("../middleware/asyncWrapper");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const appError = require("../utils/appError");
const Emalis = require("../nodemailer/emalis");
const validator = require("validator");
const sendForgotPassword = asyncWrapper(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
     const error = appError.create(
       "User not found",
       400,
       httpStatusText.FAIL
     );
     return next(error);
  }

  const secret = process.env.JWT_SECRET + user.password;
  const token = await jwt.sign({ _id: user._id, email: user.email }, secret, {
    expiresIn: "10m",
  });
  const link = `http://localhost:3000/reset-password/${user._id}/${token}`;

await Emalis.sendPasswordResetEmail(user.email, link , user.fristName);
res.status(200).json({
  success: true,
  Status: httpStatusText.SUCCESS,
  message: "Email sent successfully",
  user: {
    ...user._doc,
    password: undefined,
  },
});

});

// const getResetPasswordLink = asyncWrapper(async (req, res) => {
//   const user = await User.findById(req.params.userId);
//   if (!user) {
//     return res.status(404).json({ error: "User not found" });
//   }
//   const secrit = process.env.JWT_SECRET + user.password;
//   try {
//     jwt.verify(req.params.token, secrit);
//     res.render("reset-password", {
//       email: user.email,
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       massage: "invalid link",
//     });
//   }
// });


const resetPassword = asyncWrapper(async (req, res , next) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const secrit = process.env.JWT_SECRET + user.password;
  try {
    jwt.verify(req.params.token, secrit);
    req.body.password = await bcrypt.hash(req.body.password, 10);
    user.password = req.body.password;
    if (!validator.isStrongPassword(user.password)) {
      const error = appError.create(
        "Please enter a strong password",
        400,
        httpStatusText.ERROR
      );  
      return next(error);  
    }
    await user.save();
    await Emalis.passwordSuccess(user.email);
    res.json({
      Status: httpStatusText.SUCCESS,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    const err = appError.create(
      "invalid link",
      400,
      httpStatusText.ERROR
    );
    return next(err);
    }
});

module.exports = {
  sendForgotPassword,
 
  resetPassword,
};
