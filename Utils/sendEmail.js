const transporter = require("../config/email");

const sendResetPasswordEmail = async (to, resetUrl) => {
  await transporter.sendMail({
    from: `"Todo App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Password",
    html: `
      <h3>Password Reset</h3>
      <p>Click the link below:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  });
};

module.exports = { sendResetPasswordEmail };
