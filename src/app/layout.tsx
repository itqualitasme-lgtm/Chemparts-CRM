import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RouteProgress from "@/components/RouteProgress";
import "./globals.css";
import "./overrides.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chemparts Middle East — Analytical instruments, lab supplies & services",
  description:
    "Chemparts Middle East FZC — an authorized partner supplying, installing and servicing analytical instruments, laboratory consumables and OEM spare parts across the Gulf since 2003.",
  robots: { index: false, follow: false }, // noindex until public launch
};

// The whole app is a fixed light design. Emitting the color-scheme meta tag
// (alongside the CSS color-scheme) stops browser auto-dark from inverting
// white button text to invisible navy-on-navy.
export const viewport: Viewport = {
  colorScheme: "light",
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <RouteProgress />
        {children}
      </body>
    </html>
  );
}
