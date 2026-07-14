type SMSPayload = {
  to?: string | null;
  message: string;
};

export async function sendSMSNotification({ to, message }: SMSPayload) {
  if (!to || process.env.SMS_PROVIDER !== "twilio") return { skipped: true };
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_SMS_FROM) {
    return { skipped: true };
  }

  const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const body = new URLSearchParams({
    From: process.env.TWILIO_SMS_FROM,
    To: to,
    Body: message,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) throw new Error(`SMS notification failed: ${response.status}`);
  return response.json();
}
