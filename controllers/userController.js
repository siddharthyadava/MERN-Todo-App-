const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const crypto = require("crypto");
const { sendResetPasswordOtpEmail } = require("../Utils/sendEmail");

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const generateSixDigitOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// REGISTER
const registerController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    //validation
    if (!username || !normalizedEmail || !password) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }
    // check exisiting suer
    const existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "user already exist",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // save user
    const newUser = new userModel({
      username,
      email: normalizedEmail,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).send({
      success: true,
      message: "User Register Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Register API",
      error,
    });
  }
};

//LOGIN
const loginControler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    //find user
    const user = await userModel.findOne({ email: normalizedEmail });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Invalid Email Or Password",
      });
    }
    // match passowrd
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid Credentials",
      });
    }
    //token
    const token = await JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "login api",
      error,
    });
  }
};

//FORGOT PASSWORD
const forgotPasswordController = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);

    if (!normalizedEmail) {
      return res.status(400).send({
        success: false,
        message: "Please provide email",
      });
    }

    const user = await userModel.findOne({ email: normalizedEmail });

    // Do not reveal if user exists or not
    if (!user) {
      return res.status(200).send({
        success: true,
        message: "If this email is registered, a 6-digit OTP has been sent",
      });
    }

    const otp = generateSixDigitOtp();
    const otpHash = hashOtp(otp);

    user.resetPasswordToken = otpHash;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    try {
      await sendResetPasswordOtpEmail(user.email, otp);
    } catch (mailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw new Error(`Failed to send reset password OTP email: ${mailError.message}`);
    }

    return res.status(200).send({
      success: true,
      message: "If this email is registered, a 6-digit OTP has been sent",
    });
  } catch (error) {
    console.log("Forgot password error:", error.message || error);
    res.status(500).send({
      success: false,
      message: "Unable to send reset password OTP. Please try again.",
    });
  }
};

// VERIFY RESET OTP
const verifyResetOtpController = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const otp = `${req.body?.otp || ""}`.trim();

    if (!normalizedEmail || !otp) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and OTP",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).send({
        success: false,
        message: "Please provide a valid 6-digit OTP",
      });
    }

    const user = await userModel.findOne({
      email: normalizedEmail,
      resetPasswordToken: hashOtp(otp),
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    return res.status(200).send({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.log("Verify reset OTP error:", error.message || error);
    res.status(500).send({
      success: false,
      message: "Unable to verify OTP. Please try again.",
    });
  }
};

// RESET PASSWORD
const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).send({
        success: false,
        message: "Please provide new password",
      });
    }

    if (password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // token not expired
    });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in reset password API",
      error,
    });
  }
};

module.exports = {
  registerController,
  loginControler,
  forgotPasswordController,
  verifyResetOtpController,
  resetPasswordController,
};
