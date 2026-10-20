import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";

const serif = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", style: ["normal", "italic"] });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const deva = Noto_Serif_Devanagari({ subsets: ["devanagari"], variable: "--font-devanagari", weight: ["600"] });

export const metadata: Metadata = {
  title: "ऊर्जा Compressor – Photo, signature & PDF size reducer",
  description: "Resize and compress photos, signatures and PDFs to the required size. Files never leave your device.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${deva.variable}`}>
      <head>
        {/* AdSense script: uncomment and set your publisher id after approval
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous" /> */}
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
