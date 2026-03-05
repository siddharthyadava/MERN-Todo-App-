const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const crypto = require("crypto");
const { sendResetPasswordEmail} = require ("../Utils/sendEmail")

const normalizeEmail = (email = "") => email.trim().toLowerCase();

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
        message: "If this email is registered, a password reset link has been sent",
      });
    }

    // Create token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL?.startsWith("http")
      ? process.env.CLIENT_URL
      : `https://${process.env.CLIENT_URL}`;
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    console.log("Password reset link:", resetUrl);
    try {
      await sendResetPasswordEmail(user.email, resetUrl);
    } catch (mailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw new Error(`Failed to send reset password email: ${mailError.message}`);
    }

    return res.status(200).send({
      success: true,
      message: "If this email is registered, a password reset link has been sent",
    });
  } catch (error) {
    console.log("Forgot password error:", error.message || error);
    res.status(500).send({
      success: false,
      message: "Unable to send reset password email. Please try again.",
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

module.exports = { registerController, loginControler, forgotPasswordController, resetPasswordController };
