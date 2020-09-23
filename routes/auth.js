const express = require("express");
const router = express.Router();
const {
  signUp,
  signIn,
  activateAccount,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");
const { userSignupValidator } = require("../validators/auth");
const { userSigninValidator } = require("../validators/auth");
const { runValidation } = require("../validators/index");

router.post("/signup", userSignupValidator, runValidation, signUp);
router.post("/signin", userSigninValidator, runValidation, signIn);
router.post("/account-activation", activateAccount);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);
module.exports = router;
