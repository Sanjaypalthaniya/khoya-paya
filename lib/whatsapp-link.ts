const OWNER_INTRO = "Hi, I am the owner of the item you found on Khoya Paya. Thank you for contacting me.";

export function normalizeWhatsAppNumber(phone?: string | null) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.startsWith("0") && digits.length === 11) digits = `91${digits.slice(1)}`;
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

export function buildWhatsAppLink(phone?: string | null, message = OWNER_INTRO) {
  const number = normalizeWhatsAppNumber(phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}
