import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NibBot — Your Smart Business Assistant on WhatsApp",
  description:
    "NibBot is a bilingual WhatsApp AI assistant that helps SMEs and retailers in Nigeria record daily sales and purchases through voice or text, and instantly know their profit — in English or Hausa.",
  keywords: [
    "NibBot",
    "WhatsApp bookkeeping",
    "small business Nigeria",
    "profit calculator",
    "AI assistant",
    "Hausa business",
    "voice bookkeeping",
  ],
  openGraph: {
    title: "NibBot — Your Smart Business Assistant on WhatsApp",
    description:
      "Record sales & purchases via voice or text on WhatsApp. Know your daily profit instantly — in English or Hausa.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#fafafa] text-[#0a0a0a] antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  var hash = window.location.hash;
  if (hash) {
    var target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView();
      return;
    }
  }
  window.scrollTo(0, 0);
})();`,
          }}
        />
      </body>
    </html>
  );
}
