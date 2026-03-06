const { sendEmail } = require("../config/email");

const sendResetPasswordOtpEmail = async (to, otp) => {
  await sendEmail({
    to,
    subject: "Your Password Reset OTP",
    html: `
      <h3>Password Reset OTP</h3>
      <p>Use this OTP to reset your password:</p>
      <h2 style="letter-spacing: 4px;">${otp}</h2>
      <p>This OTP will expire in 10 minutes.</p>
    `,
    text: `Password Reset OTP\nYour OTP is: ${otp}\nThis OTP will expire in 10 minutes.`,
  });
};

module.exports = { sendResetPasswordOtpEmail };
