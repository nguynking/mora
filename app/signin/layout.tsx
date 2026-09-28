import type { Metadata } from "next";

export const metadata: Metadata = { title: "Đăng nhập · Mora" };

export default function SignInLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
