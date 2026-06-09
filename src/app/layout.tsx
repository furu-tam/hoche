import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Học Hè — Ôn luyện Toán",
  description: "10 câu trắc nghiệm Toán mỗi ngày theo lớp học cho học sinh tiểu học",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={nunito.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
