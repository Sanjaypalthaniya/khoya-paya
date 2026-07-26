import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import PublicEditorialPage from "@/components/PublicEditorialPage";

export default function SuccessStoriesPage() {
  return <PublicEditorialPage eyebrow="Success stories" title="Recovery stories belong to the people in them." copy="Verified stories will appear only with participant consent. Until then, these are the principles used to publish them responsibly." sections={[
    { title: "Consent before publication", copy: "Owners and finders control whether their experience becomes a public story.", icon: HeartHandshake },
    { title: "Private details removed", copy: "Contact information, verification answers, and sensitive locations are never part of a public story.", icon: ShieldCheck },
    { title: "No invented outcomes", copy: "Khoya Paya does not publish fabricated testimonials, recovery totals, or community metrics.", icon: Sparkles },
  ]} />;
}
