const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user.controller");
const passControllers = require("../controllers/password.forgot");
const token = require("../middleware/tokenAccusse");
const tokenAccusse = require("../middleware/tokenAccusse");
router.get("/", tokenAccusse,userControllers.getAllUsers);
router.post("/updateUser/:id",userControllers.updateUser);

router.post("/login",userControllers.Login);

router.post("/register", userControllers.Register);
router.post("/logout", token ,userControllers.logout);
router.post("/verifyEmail", userControllers.verifyEmail);
router.post("/forgotpassword", passControllers.sendForgotPassword);
router.post("/reset-password/:userId/:token", passControllers.resetPassword);
console.log("user router",router.name);

module.exports = router;
