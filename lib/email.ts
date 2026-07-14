import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type FinderMessageEmailPayload = {
  ownerEmail: string;
  ownerName: string;
  itemName: string;
  category: string;
  finderName?: string | null;
  finderPhone?: string | null;
  finderEmail?: string | null;
  finderMessage: string;
  finderLocation?: string | null;
};

function getTransporter() {
  const port = Number(process.env.SMTP_PORT ?? 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function field(label: string, value?: string | null) {
  return `<p style="margin:8px 0;color:#23343f;"><strong>${label}:</strong> ${escapeHtml(value || "Not shared")}</p>`;
}

export async function sendEmail(payload: EmailPayload) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM) {
    throw new Error("SMTP is not configured.");
  }

  return getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}

export async function sendFinderMessageEmail(payload: FinderMessageEmailPayload) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/messages`;
  const subject = "New finder message for your item on Khoya Paya";
  const privacyNote = "Your contact details were not shown publicly. The finder contacted you through Khoya Paya.";

  const html = `
    <div style="margin:0;padding:24px;background:#eef8f5;font-family:Arial,sans-serif;color:#23343f;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #d8ebe5;">
        <div style="background:#073b4c;color:#ffffff;padding:24px;">
          <p style="margin:0 0 6px;color:#9ee6d4;font-size:13px;letter-spacing:.08em;text-transform:uppercase;">Khoya Paya Alert</p>
          <h1 style="margin:0;font-size:24px;line-height:1.25;">Someone sent a finder message</h1>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;">Hi ${escapeHtml(payload.ownerName)},</p>
          <p style="margin:0 0 18px;">A finder submitted a message for <strong>${escapeHtml(payload.itemName)}</strong>.</p>
          ${field("Item", payload.itemName)}
          ${field("Category", payload.category)}
          ${field("Finder name", payload.finderName)}
          ${field("Finder phone", payload.finderPhone)}
          ${field("Finder email", payload.finderEmail)}
          ${field("Finder location", payload.finderLocation)}
          <div style="margin:18px 0;padding:16px;border-radius:12px;background:#f6fbf9;border:1px solid #d8ebe5;">
            <p style="margin:0 0 6px;"><strong>Finder message</strong></p>
            <p style="margin:0;white-space:pre-line;">${escapeHtml(payload.finderMessage)}</p>
          </div>
          <a href="${dashboardUrl}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;">Open Dashboard Messages</a>
          <p style="margin:20px 0 0;color:#61737b;font-size:13px;">${privacyNote}</p>
        </div>
      </div>
    </div>
  `;

  const text = [
    `Hi ${payload.ownerName},`,
    "",
    `A finder submitted a message for ${payload.itemName}.`,
    `Item: ${payload.itemName}`,
    `Category: ${payload.category}`,
    `Finder name: ${payload.finderName || "Not shared"}`,
    `Finder phone: ${payload.finderPhone || "Not shared"}`,
    `Finder email: ${payload.finderEmail || "Not shared"}`,
    `Finder location: ${payload.finderLocation || "Not shared"}`,
    "",
    "Finder message:",
    payload.finderMessage,
    "",
    `Dashboard messages: ${dashboardUrl}`,
    privacyNote,
  ].join("\n");

  return sendEmail({ to: payload.ownerEmail, subject, html, text });
}

export async function sendFinderChatLinkEmail(input: { finderEmail: string; finderName?: string | null; itemName: string; chatUrl: string }) {
  const greeting = input.finderName ? `Hi ${input.finderName},` : "Hello,";
  return sendEmail({
    to: input.finderEmail,
    subject: "Owner replied to your Khoya Paya message",
    html: `<div style="font-family:Arial,sans-serif;padding:24px"><p>${escapeHtml(greeting)}</p><p>The owner of <strong>${escapeHtml(input.itemName)}</strong> replied through Khoya Paya.</p><p><a href="${escapeHtml(input.chatUrl)}">Open secure chat</a></p><p>Owner contact details remain protected.</p></div>`,
    text: `${greeting}\n\nThe owner of ${input.itemName} replied through Khoya Paya.\nOpen secure chat: ${input.chatUrl}\n\nOwner contact details remain protected.`,
  });
}

export async function sendOwnerChatReplyEmail(input: { ownerEmail: string; ownerName: string; itemName: string; dashboardUrl: string }) {
  return sendEmail({
    to: input.ownerEmail,
    subject: `New chat reply for ${input.itemName}`,
    html: `<div style="font-family:Arial,sans-serif;padding:24px"><p>Hi ${escapeHtml(input.ownerName)},</p><p>A finder replied in your secure chat about <strong>${escapeHtml(input.itemName)}</strong>.</p><p><a href="${escapeHtml(input.dashboardUrl)}">Open conversation</a></p></div>`,
    text: `Hi ${input.ownerName},\n\nA finder replied in your secure chat about ${input.itemName}.\nOpen conversation: ${input.dashboardUrl}`,
  });
}
