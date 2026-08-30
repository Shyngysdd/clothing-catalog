import { Resend } from "resend";

const EXPIRY_MS = 24 * 60 * 60 * 1000;

export function createVerificationData() {
  return { verificationToken: crypto.randomUUID(), verificationTokenExpiry: new Date(Date.now() + EXPIRY_MS), verificationEmailSentAt: new Date() };
}

export function getAppUrl() {
  const configuredUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function sendVerificationEmail(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;
  const verifyUrl = `${getAppUrl()}/account/verify?token=${encodeURIComponent(token)}`;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Подтвердите email для Billion.co",
    html: `<p>Здравствуйте!</p><p>Подтвердите ваш email для личного кабинета Billion.co:</p><p><a href="${verifyUrl}">Подтвердить email</a></p><p>Ссылка действует 24 часа.</p>`,
  });
  if (error) throw new Error(error.message);
  return true;
}
