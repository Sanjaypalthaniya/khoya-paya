import type { ReactNode } from "react";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  copy: string;
  children: ReactNode;
};

export default function AuthLayout({ eyebrow, title, copy, children }: AuthLayoutProps) {
  return (
    <section className="auth-page">
      <div className="qr-pattern-layer" />
      <div className="container position-relative">
        <div className="auth-shell">
          <div className="auth-visual">
            <span className="hero-badge">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{copy}</p>
            <div className="phone-mockup auth-phone">
              <div className="phone-speaker" />
              <div className="app-screen">
                <div className="app-header"><span>Khoya Paya</span><b>Private</b></div>
                <div className="qr-box"><div className="qr-grid" /></div>
                <div className="mini-list"><span>Finder message</span><strong>Hidden contact</strong></div>
                <div className="mini-list"><span>Recovery status</span><strong>Secure</strong></div>
              </div>
            </div>
          </div>
          <div className="auth-card">{children}</div>
        </div>
      </div>
    </section>
  );
}
