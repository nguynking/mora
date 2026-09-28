import type { Metadata, Viewport } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";

// Display serif for titles and art captions. Self-hosted at build time; covers Vietnamese.
const serif = Newsreader({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mora",
  description: "Trò chuyện cùng đồng đội và AI.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ece8e0" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1c19" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={serif.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
