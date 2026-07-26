import { BookOpen, FileSearch, MapPinned } from "lucide-react";
import PublicEditorialPage from "@/components/PublicEditorialPage";

export default function JournalPage() {
  return <PublicEditorialPage eyebrow="Journal" title="Useful guidance for difficult moments." copy="Short, practical recovery guides grounded in privacy, clear information, and safe returns." sections={[
    { title: "The first 30 minutes after losing something", copy: "A calm sequence for retracing steps, securing accounts, and creating a useful report.", icon: MapPinned, href: "/journal/first-30-minutes", linkLabel: "Read the guide" },
    { title: "Write a report people can recognise", copy: "Share identifying public details without revealing the secret information needed for verification.", icon: FileSearch, href: "/journal/write-a-useful-report", linkLabel: "Read the guide" },
    { title: "What to do when you find a wallet", copy: "Protect the owner’s identity, avoid risky contact, and choose a safe return path.", icon: BookOpen, href: "/journal/found-a-wallet", linkLabel: "Read the guide" },
  ]} />;
}
