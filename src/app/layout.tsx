import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RouteProgress from "@/components/RouteProgress";
import { SITE_URL, SITE_NAME, organizationJsonLd } from "@/lib/seo";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Analytical Instruments & Lab Supplies in UAE, Qatar & the Gulf | Chemparts",
    template: "%s | Chemparts Middle East",
  },
  description:
    "Chemparts Middle East FZC — authorized distributor of analytical instruments, OEM spare parts and laboratory consumables across the UAE, Dubai, Qatar and the Gulf. Authorized partner for Hitachi, Tanaka, Oxford Instruments, Scavini and Biolab. Same working-day quotes.",
  keywords: [
    "analytical instruments UAE", "lab equipment Dubai", "Hitachi UAE", "Tanaka UAE",
    "Oxford Instruments Gulf", "flash point tester", "XRF analyzer", "lab consumables Qatar",
    "OEM spare parts", "authorized distributor Gulf", "Chemparts",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "Analytical Instruments & Lab Supplies in the UAE, Qatar & Gulf | Chemparts",
    description:
      "Authorized distributor of analytical instruments, OEM spares and lab consumables across the Gulf since 2003.",
  },
  robots: { index: true, follow: true },
  // Stop the Dark Reader extension (which ignores CSS color-scheme) from
  // inverting the fixed light design — e.g. white button text → invisible.
  other: { "darkreader-lock": "1" },
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
        <RouteProgress />
        {children}
      </body>
    </html>
  );
}
