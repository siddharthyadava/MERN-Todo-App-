const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_SENDERS_API_URL = "https://api.brevo.com/v3/senders";
const SENDER_VALIDATION_TTL_MS = 5 * 60 * 1000;

let senderValidationCache = {
  email: null,
  validatedAt: 0,
};

const createBrevoHeaders = () => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  "api-key": process.env.BREVO_API_KEY,
});

const normalizeRecipients = (to) => {
  if (!to) return [];

  if (Array.isArray(to)) {
    return to.map((recipient) => {
      if (typeof recipient === "string") return { email: recipient };
      return recipient;
    });
  }

  if (typeof to === "string") return [{ email: to }];
  return [to];
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is missing in environment variables");
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;
  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL or EMAIL_USER is required");
  }
  await validateBrevoSender(senderEmail);

  const recipients = normalizeRecipients(to);
  if (!recipients.length) {
    throw new Error("At least one recipient email is required");
  }

  const payload = {
    sender: {
      email: senderEmail,
      name: process.env.BREVO_SENDER_NAME || "Todo App",
    },
    to: recipients,
    subject,
    htmlContent: html,
    textContent: text,
  };

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: createBrevoHeaders(),
    body: JSON.stringify(payload),
  });

  const rawResponse = await response.text();
  if (!response.ok) {
    throw new Error(
      `Brevo email request failed (${response.status}): ${rawResponse || response.statusText}`
    );
  }

  if (!rawResponse) return null;

  try {
    return JSON.parse(rawResponse);
  } catch (error) {
    return rawResponse;
  }
};

const validateBrevoSender = async (senderEmail) => {
  const normalizedSenderEmail = senderEmail.toLowerCase();
  const now = Date.now();

  if (
    senderValidationCache.email === normalizedSenderEmail &&
    now - senderValidationCache.validatedAt < SENDER_VALIDATION_TTL_MS
  ) {
    return;
  }

  const response = await fetch(BREVO_SENDERS_API_URL, {
    method: "GET",
    headers: createBrevoHeaders(),
  });

  const rawResponse = await response.text();
  if (!response.ok) {
    throw new Error(
      `Failed to validate Brevo sender (${response.status}): ${rawResponse || response.statusText}`
    );
  }

  const parsedResponse = rawResponse ? JSON.parse(rawResponse) : {};
  const senderList = parsedResponse.senders || [];
  const matchedSender = senderList.find(
    (sender) => sender.email?.toLowerCase() === normalizedSenderEmail
  );

  if (!matchedSender || matchedSender.active !== true) {
    throw new Error(
      `Brevo sender ${senderEmail} is not active/verified. Verify this sender in Brevo first.`
    );
  }

  senderValidationCache = {
    email: normalizedSenderEmail,
    validatedAt: now,
  };
};

module.exports = { sendEmail };
