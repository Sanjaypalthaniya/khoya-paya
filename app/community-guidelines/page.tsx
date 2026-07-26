import { Flag, HeartHandshake, LockKeyhole, MessageCircle } from "lucide-react";
import PublicEditorialPage from "@/components/PublicEditorialPage";

export default function CommunityGuidelinesPage() {
  return <PublicEditorialPage eyebrow="Community guidelines" title="Useful help. Respectful communication. Safer recovery." copy="These standards apply to posts, comments, claims, profiles, and finder conversations." sections={[
    { title: "Share useful information", copy: "Keep reports accurate, relevant, and focused on returning belongings safely.", icon: HeartHandshake },
    { title: "Protect private details", copy: "Do not publish phone numbers, email addresses, home addresses, credentials, or ownership answers.", icon: LockKeyhole },
    { title: "Communicate respectfully", copy: "Harassment, threats, impersonation, scams, and discriminatory content are not allowed.", icon: MessageCircle },
    { title: "Report concerns", copy: "Use reporting tools for suspicious content rather than escalating a public confrontation.", icon: Flag },
  ]} />;
}
