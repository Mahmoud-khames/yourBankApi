const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");

const genratJwtEndCookie = async (res, paload) => {
  const token = await jwt.sign(paload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("access_token", token, {
    httpOnly: true,
     secure:   process.env.NODE_ENV === "production",
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
};

module.exports = genratJwtEndCookie;
