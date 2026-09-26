import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mora · Không gian làm việc chung",
  description: "Đội nhóm và trợ lý AI, cùng một cuộc trò chuyện.",
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
