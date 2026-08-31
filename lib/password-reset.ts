import { Resend } from "resend";
import { getAppUrl } from "@/lib/email-verification";

const EXPIRY_MS = 24 * 60 * 60 * 1000;

export function createPasswordResetData() {
  return {
    passwordResetToken: crypto.randomUUID(),
    passwordResetTokenExpiry: new Date(Date.now() + EXPIRY_MS),
    passwordResetEmailSentAt: new Date(),
  };
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const resetUrl = `${getAppUrl()}/account/reset-password?token=${encodeURIComponent(token)}`;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Сброс пароля для Billion.co",
    html: `<p>Здравствуйте!</p><p>Чтобы задать новый пароль для личного кабинета Billion.co, перейдите по ссылке:</p><p><a href="${resetUrl}">Сбросить пароль</a></p><p>Ссылка действует 24 часа. Если вы не запрашивали сброс, просто проигнорируйте это письмо.</p>`,
  });
  if (error) throw new Error(error.message);
  return true;
}
