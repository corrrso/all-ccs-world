import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Global Carbon Capture & Storage — Every CCS Facility",
  description:
    "An interactive map of carbon capture and storage (CCS) facilities worldwide — active, active but underperforming, and in construction or planning.",
  openGraph: {
    title: "Global Carbon Capture & Storage — Every CCS Facility",
    description:
      "An interactive map of carbon capture and storage facilities worldwide.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Carbon Capture & Storage — Every CCS Facility",
    description:
      "An interactive map of carbon capture and storage facilities worldwide.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col bg-black text-white">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
