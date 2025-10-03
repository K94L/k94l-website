import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/session-provider";
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
  metadataBase: new URL("https://k94l.com"),
  title: "K94L Holding",
  description: "K94L Holding is a private investment company focusing primarily on startups.",
  icons: { icon: "/k94l-red.png" },
  openGraph: {
    title: "K94L Holding",
    description: "K94L Holding is a private investment company focusing primarily on startups.",
    url: "https://k94l.com",
    siteName: "K94L Holding",
    images: [
      { url: "/meta-image.jpeg", width: 1200, height: 630, alt: "K94L Holding" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
