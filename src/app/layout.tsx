import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zephyre - Nonton Anime Online Gratis",
  description:
    "Website streaming anime terlengkap dengan subtitle Indonesia. Nonton anime ongoing, completed, dan terbaru dengan kualitas HD.",
  keywords:
    "anime, streaming, nonton anime, anime subtitle indonesia, anime online",
  authors: [{ name: "Zepyhre Team" }],
  creator: "Zepyhre",
  publisher: "Zepyhre",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://zepyhre.vercel.app"),
  openGraph: {
    title: "Zephyre - Nonton Anime Online Gratis",
    description: "Website streaming anime terlengkap dengan subtitle Indonesia",
    url: "https://zepyhre.vercel.app",
    siteName: "Zephyre",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zepyhre - Nonton Anime Online",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zephyre - Nonton Anime Online Gratis",
    description: "Website streaming anime terlengkap dengan subtitle Indonesia",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${inter.className} bg-dark-900 text-white min-h-screen`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
