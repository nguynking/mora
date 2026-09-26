import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mora",
  description: "Trò chuyện cùng đồng đội và AI.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
