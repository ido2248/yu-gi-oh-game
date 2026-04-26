import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "יוגי-או — מדריך למתחילים",
  description: "למד לשחק יוגי-או עם מדריך אינטראקטיבי בעברית",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full dark`}>
      <body className="min-h-full bg-gray-950 text-gray-100 font-heebo antialiased">
        {children}
      </body>
    </html>
  );
}
