import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const headingFont = localFont({
  src: [
    {
      path: "../../fonts/space-grotesk-latin.woff2",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../../fonts/space-grotesk-latin-ext.woff2",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = localFont({
  src: [
    {
      path: "../../fonts/dm-sans-latin.woff2",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../../fonts/dm-sans-latin-ext.woff2",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Career Ops Web",
  description: "Web frontend foundation for the Career Ops application workflow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
