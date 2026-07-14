import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "./minimal-system.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Khoya Paya - QR Based Lost & Found Platform",
    template: "%s | Khoya Paya",
  },
  description: "Register your valuable items, generate smart QR codes, and let honest finders contact you safely without exposing your private details.",
  applicationName: "Khoya Paya",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "Khoya Paya",
    title: "Khoya Paya - QR Based Lost & Found Platform",
    description: "Register valuable items, generate smart QR codes, and recover lost items safely.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Khoya Paya - QR Based Lost & Found Platform",
    description: "QR based lost and found platform for safe item recovery.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
