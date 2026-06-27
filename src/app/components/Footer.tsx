"use client";

import { MessageCircle, Heart } from "lucide-react";

function getWhatsAppHref() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return number
    ? `https://wa.me/${number}?text=${encodeURIComponent("Hello NibBot")}`
    : "#waitlist";
}

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Nib<span className="text-gold">Bot</span>
              </span>
            </a>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              A bilingual WhatsApp AI assistant helping small business women in
              Nigeria know their daily profit — in English or Hausa.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#how-it-works"
                  className="text-sm text-white/40 hover:text-gold transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-sm text-white/40 hover:text-gold transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#demo"
                  className="text-sm text-white/40 hover:text-gold transition-colors"
                >
                  Live Demo
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="text-sm text-gold hover:underline transition-colors font-medium"
                >
                  Go to Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#impact"
                  className="text-sm text-white/40 hover:text-gold transition-colors"
                >
                  Our Impact
                </a>
              </li>
              <li>
                <a
                  href="#waitlist"
                  className="text-sm text-white/40 hover:text-gold transition-colors"
                >
                  Share Story
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={getWhatsAppHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/40 hover:text-gold transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <span className="text-sm text-white/40">
                  hello@nibbot.ng
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} NibBot. All rights reserved.
          </p>
          <p className="text-xs text-white/30 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-gold" /> for Nigerian
            business women
          </p>
        </div>
      </div>
    </footer>
  );
}
