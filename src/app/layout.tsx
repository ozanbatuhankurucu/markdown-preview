import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
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
  title: "Markdown Preview — Live Editor & Renderer",
  description:
    "A fast, beautiful markdown editor with live preview. Supports GitHub Flavored Markdown, syntax highlighting, tables, task lists, and more. Paste your markdown and see it rendered instantly.",
  keywords: [
    "markdown",
    "preview",
    "editor",
    "live preview",
    "GFM",
    "GitHub Flavored Markdown",
    "syntax highlighting",
    "markdown renderer",
  ],
  authors: [{ name: "Markdown Preview App" }],
  openGraph: {
    title: "Markdown Preview — Live Editor & Renderer",
    description:
      "Paste markdown on the left, see beautiful rendered output on the right. Supports GFM, syntax highlighting, dark mode, and more.",
    type: "website",
    locale: "en_US",
    siteName: "Markdown Preview",
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown Preview — Live Editor & Renderer",
    description:
      "A fast, beautiful markdown editor with live preview. Supports GFM, syntax highlighting, dark mode, and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Markdown Preview",
              description:
                "A fast, beautiful markdown editor with live preview supporting GitHub Flavored Markdown.",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
