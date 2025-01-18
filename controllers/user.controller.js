const Users = require("../models/userModels");
const bcrypt = require("bcrypt");
const httpStatusText = require("../utils/httpStatus");
const genratJwtAndCookie = require("../utils/genratJwtAndCookie");
const asyncWrapper = require("../middleware/asyncWrapper");
const emalis = require("../nodemailer/emalis");
const appError = require("../utils/appError");
const validator = require("validator");
const getAllUsers = async (req, res) => {
  const users = await Users.find({}, { " __v": false, password: false });
  res.status(200).json({ Status: httpStatusText.SUCCESS, data: { users } });
};

const updateUser = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  const user = await Users.findById({ _id: id });
  if (!user) {
    const error = appError.create("user not found", 404, httpStatusText.ERROR);
    return next(error);
  }
  const { fristName, lastName, email } = req.body;
  if (email !== user.email) {
    user.isVerified = true;
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    user.fristName = fristName;
    user.lastName = lastName;
    user.email = email;
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await emalis.sendVerificationEmail(
      user.email,
      verificationToken,
      user.fristName
    );
  
  } else {
    user.isVerified = false; 
    user.fristName = fristName;
    user.lastName = lastName;
    user.email = email;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
  }

  console.log(req.body);

  await user.save();
  return res.status(200).json({ Status: httpStatusText.SUCCESS, data: user  });
});
const deleteUser = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  const user = await Users.findById({ _id: id });
  if (!user) {
    const error = appError.create("user not found", 404, httpStatusText.ERROR);
    return next(error);
  }
  await user.deleteOne();
  return res.status(200).json({ Status: httpStatusText.SUCCESS, data: "user is delete"  });
});
const Register = asyncWrapper(async (req, res, next) => {
  const { fristName, lastName, email, password } = req.body;
  const findUser = await Users.findOne({ email });
  if (findUser) {
    const error = appError.create(
      "user already exist",
      500,
      httpStatusText.ERROR
    );
    return next(error);
  }
  // Check if email is valid
  if (!validator.isEmail(email)) {
    const error = appError.create(
      "Please enter a valid email",
      400,
      httpStatusText.ERROR
    );
    return next(error);
  }
  // Check if password is strong
  if (!validator.isStrongPassword(password)) {
    const error = appError.create(
      "Please enter a strong password",
      400,
      httpStatusText.ERROR
    );
    return next(error);
  }
  //   hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const newUser = new Users({
    fristName,
    lastName,
    email,
    verificationToken,
    password: hashedPassword,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  await genratJwtAndCookie(res, {
    email: newUser.email,
    id: newUser._id,
  });
  await emalis.sendVerificationEmail(
    newUser.email,
    verificationToken,
    newUser.fristName
  );

  await newUser.save();

  return res
    .status(200)
    .json({ Status: httpStatusText.SUCCESS, data: newUser });
});
const verifyEmail = asyncWrapper(async (req, res) => {
  const { code } = req.body;
  try {
    const user = await Users.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await emalis.WelocomeMassege(user.email, user.fristName);

    res.status(200).json({
      success: true,
      Status: httpStatusText.SUCCESS,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({
      success: false,
      Status: httpStatusText.ERROR,
      message: "Error verifying email",
    });
  }
});
const Login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = appError.create(
      "please provide email and password",
      400,
      httpStatusText.ERROR
    );
    next(error);
  }
  const user = await Users.findOne({ email });

  if (!user) {
    const error = appError.create(
      "user not found please register",
      400,
      httpStatusText.ERROR
    );
    next(error);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  const token = await genratJwtAndCookie(res, {
    email: user.email,
    id: user._id,
  });

  if (isMatch && user) {
    return res.status(200).json({
      Status: httpStatusText.SUCCESS,
      data: { user, token },
    });
  } else {
    const error = appError.create(
      "invalid email or password",
      400,
      httpStatusText.ERROR
    );
    next(error);
  }
});
const logout = async (req, res) => {
  res.clearCookie("access_token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};
module.exports = {
  getAllUsers,
  Login,
  Register,
  updateUser,
  logout,
  verifyEmail,
  deleteUser,
};
