const express = require("express");
const {
  registerController,
  loginControler,
  forgotPasswordController,
  verifyResetOtpController,
  resetPasswordController,
} = require("../controllers/userController");

//router object
const router = express.Router();

//routes
// REGIOSTER || POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginControler);

// FORGOT PASSWORD // POST
router.post("/forgot-password", forgotPasswordController);

// VERIFY RESET OTP // POST
router.post("/verify-reset-otp", verifyResetOtpController);

// RESET PASSWORD // POST
router.post("/reset-password/:token", resetPasswordController);

//export
module.exports = router;
