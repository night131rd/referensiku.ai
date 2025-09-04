import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./search-results.css"; // Import CSS kustom untuk hasil pencarian
import Script from "next/script";
import { TempoInit } from "@/components/tempo-init";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import FloatingSupportButton from "@/components/floating-support-button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JurnalGPT : AI Pencarian Jurnal Akademik",
  description: "JurnalGPT adalah platform yang menggabungkan kecerdasan buatan dengan database jurnal akademik untuk memberikan jawaban yang akurat dan terperinci terhadap pertanyaan Anda.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>JurnalGPT : AI Pencarian Jurnal Akademik</title>
      </head>
      <body>
        {children}
        <Analytics />
        <FloatingSupportButton />
      </body>
    </html>
  );
}