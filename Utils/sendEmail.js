const { sendEmail } = require("../config/email");

const sendResetPasswordEmail = async (to, resetUrl) => {
  await sendEmail({
    to,
    subject: "Reset Your Password",
    html: `
      <h3>Password Reset</h3>
      <p>Click the link below:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
    text: `Password Reset\nClick the link below:\n${resetUrl}`,
  });
};

module.exports = { sendResetPasswordEmail };
