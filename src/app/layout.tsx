import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { TempoInit } from "@/components/tempo-init";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatJurnal : AI Pencarian Jurnal Akademik",
  description: "ChatJurnal adalah platform yang menggabungkan kecerdasan buatan dengan database jurnal akademik untuk memberikan jawaban yang akurat dan terperinci terhadap pertanyaan Anda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>ChatJurnal : AI Pencarian Jurnal Akademik</title>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}