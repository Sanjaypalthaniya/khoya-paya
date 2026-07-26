import Link from "next/link";
import {
  Bell,
  BookOpen,
  FilePlus2,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CommunityFeed from "@/components/community/CommunityFeed";
import { getCurrentUser } from "@/lib/auth";

export default async function CommunityPage({searchParams}:{searchParams:Promise<{q?:string}>}) {
  const user = await getCurrentUser();
  const query = (await searchParams).q?.slice(0, 100) ?? "";
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "KP";

  return (
    <main className="social-feed-page">
      <Navbar />
      <div className="social-feed-topbar">
        <div>
          <span><Users size={17} /> Community Feed</span>
          <form action="/community" role="search"><label><Search size={18} /><input name="q" defaultValue={query} type="search" placeholder="Search lost and found posts" aria-label="Search community feed" /></label></form>
          <Link href={user ? "/dashboard/notifications" : "/login"} aria-label="Notifications"><Bell size={19} /></Link>
        </div>
      </div>

      <div className="social-feed-layout">
        <aside className="social-feed-left" aria-label="Feed navigation">
          <div className="social-profile-card">
            <span>{initials}</span>
            <div><strong>{user?.name || "Community member"}</strong><small>{user ? "View your recovery workspace" : "Sign in to join the community"}</small></div>
          </div>
          <nav>
            <Link className="active" href="/community"><Users size={19} /> Feed</Link>
            <Link href="/lost-items"><Search size={19} /> Search lost items</Link>
            <Link href="/report-found-item"><FilePlus2 size={19} /> Report found item</Link>
            <Link href="/dashboard/messages"><MessageCircle size={19} /> Messages</Link>
            <Link href="/dashboard/community-posts"><BookOpen size={19} /> My posts</Link>
          </nav>
          <div className="social-sidebar-note">
            <ShieldCheck size={21} />
            <strong>Privacy comes first</strong>
            <p>Personal contact details remain hidden during recovery.</p>
          </div>
        </aside>

        <section className="social-feed-center" aria-label="Community posts">
          <CommunityFeed initials={initials} initialSearch={query} />
        </section>

        <aside className="social-feed-right" aria-label="Community information">
          <section>
            <span className="social-panel-icon"><Sparkles size={20} /></span>
            <h2>Help your community</h2>
            <p>Small, accurate details can reconnect someone with an important belonging.</p>
            <Link href="/report-found-item">Report a found item</Link>
          </section>
          <section>
            <h2>Recovery safety</h2>
            <ul>
              <li><ShieldCheck size={17} /> Verify ownership privately</li>
              <li><MapPin size={17} /> Meet only in a public place</li>
              <li><MessageCircle size={17} /> Keep chats on the platform</li>
            </ul>
            <Link className="social-text-link" href="/safety-center">Open Safety Center</Link>
          </section>
        </aside>
      </div>
      <Footer />
    </main>
  );
}
