import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp-link";

export default function WhatsAppButton({ phone }: { phone?: string | null }) {
  const href = buildWhatsAppLink(phone);
  return href ? <a className="btn btn-secondary-kp btn-sm-pill" href={href} rel="noreferrer" target="_blank"><MessageCircle size={16} /> Chat on WhatsApp</a> : null;
}
