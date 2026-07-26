import { BadgeCheck, MapPin, MessageCircle, ShieldCheck, TriangleAlert, UserCheck } from "lucide-react";
import PublicEditorialPage from "@/components/PublicEditorialPage";

export default function SafetyCenterPage() {
  return <PublicEditorialPage eyebrow="Safety center" title="Recover with care, not urgency." copy="Practical guidance for owners, finders, and community members at every stage of a return." sections={[
    { title: "Keep contact private", copy: "Use protected platform messaging until both people are comfortable with the recovery plan.", icon: MessageCircle },
    { title: "Verify ownership", copy: "Ask for details that were not published in the listing before handing over an item.", icon: UserCheck },
    { title: "Meet in public", copy: "Choose a staffed, well-lit public place and tell someone where you are going.", icon: MapPin },
    { title: "Avoid advance payments", copy: "Do not send money before the item and the other person have been verified.", icon: TriangleAlert },
    { title: "Protect sensitive data", copy: "Never share passwords, OTPs, identity numbers, payment PINs, or account recovery codes.", icon: ShieldCheck },
    { title: "Report suspicious activity", copy: "Use the report action so moderation staff can review unsafe posts, comments, or accounts.", icon: BadgeCheck },
  ]} />;
}
