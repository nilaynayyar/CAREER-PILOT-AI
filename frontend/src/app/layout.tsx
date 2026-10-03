import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerPilot AI — Career Intelligence Platform",
  description:
    "CareerPilot AI combines machine learning trained on the AMEO 2015 dataset, O*NET occupational knowledge, and agentic AI to help engineering students understand their employment outlook and discover their next career path.",
  keywords: [
    "career guidance", "machine learning", "salary prediction", "AMEO 2015",
    "O*NET", "skill gap analysis", "learning roadmap", "engineering careers",
  ],
  authors: [{ name: "CareerPilot AI" }],
  robots: "index, follow",
  openGraph: {
    title: "CareerPilot AI",
    description: "Understand your employment outlook. Discover your next career path.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080b12",
};

type LayoutProps = { children: React.ReactNode };

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
