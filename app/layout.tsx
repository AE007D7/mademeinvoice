import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const APP_URL = "https://mademeinvoice.com";
const TITLE = "Made Me Invoice — Free Invoice Generator | Print & Send in Seconds";
const DESCRIPTION =
  "Create professional invoices online in seconds. Print-ready PDFs, instant email delivery, custom branding, multi-currency & global tax support. Free for freelancers and small businesses.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: "%s | Made Me Invoice",
  },
  description: DESCRIPTION,
  keywords: [
    "invoice generator",
    "free invoice maker",
    "online invoicing",
    "print invoice",
    "send invoice online",
    "fast invoice creator",
    "professional invoice",
    "freelancer invoice",
    "invoice PDF",
    "invoice template",
    "small business invoicing",
    "invoice for freelancers",
    "create invoice online",
    "invoice ready to print",
    "invoice ready to send",
  ],
  authors: [{ name: "Made Me Invoice" }],
  creator: "Made Me Invoice",
  publisher: "Made Me Invoice",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "Made Me Invoice",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-18137575324" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-18137575324');
        `}</Script>
      </body>
    </html>
  );
}
