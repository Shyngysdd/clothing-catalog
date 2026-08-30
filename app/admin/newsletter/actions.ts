"use server";

import { Resend } from "resend";
import { getAppUrl } from "@/lib/email-verification";
import { prisma } from "@/lib/prisma";

export type NewsletterState = { status: "idle" | "success" | "error"; message?: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

export async function sendNewsletterCampaign(_: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!subject || !body) return { status: "error", message: "Заполните тему и текст письма." };
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return { status: "error", message: "Настройте RESEND_API_KEY и RESEND_FROM_EMAIL в переменных окружения." };

  const subscribers = await prisma.subscriber.findMany({ select: { email: true, unsubscribeToken: true } });
  if (!subscribers.length) return { status: "error", message: "Подписчиков пока нет." };
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = getAppUrl();

  try {
    for (let index = 0; index < subscribers.length; index += 100) {
      const batch = subscribers.slice(index, index + 100).map((subscriber) => {
        const unsubscribeUrl = `${appUrl}/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribeToken)}`;
        return { from: process.env.RESEND_FROM_EMAIL!, to: [subscriber.email], subject, html: `<div style="font-family:Arial,sans-serif;line-height:1.6">${escapeHtml(body).replace(/\n/g, "<br />")}<p style="margin-top:28px;font-size:12px"><a href="${unsubscribeUrl}">Отписаться от рассылки</a></p></div>` };
      });
      const { error } = await resend.batch.send(batch);
      if (error) throw new Error(error.message);
    }
    return { status: "success", message: `Рассылка отправлена: ${subscribers.length} получателей.` };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? `Не удалось отправить рассылку: ${error.message}` : "Не удалось отправить рассылку." };
  }
}
