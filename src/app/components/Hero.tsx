"use client";

import { motion } from "framer-motion";
import { MessageCircle, Mic, TrendingUp, ArrowRight } from "lucide-react";

function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const href = number
    ? `https://wa.me/${number}?text=${encodeURIComponent("Hello NibBot")}`
    : "#waitlist";

  return (
    <a
      href={href}
      target={number ? "_blank" : undefined}
      rel={number ? "noopener noreferrer" : undefined}
      className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 text-base animate-pulse-gold"
    >
      <MessageCircle className="w-5 h-5" />
      Start on WhatsApp
    </a>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0a0a0a] overflow-hidden flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Know Your{" "}
              <span className="text-gold">Daily Profit</span>
              <br />
              Without a Calculator
            </h1>

            <p className="mt-6 text-lg text-white/60 max-w-lg leading-relaxed">
              NibBot is a bilingual AI assistant on WhatsApp. Record your sales
              and purchases by voice or text — in English or Hausa — and instantly
              see how much you made today.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <WhatsAppButton />
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium px-8 py-4 rounded-full transition-all duration-300 text-base"
              >
                See How It Works
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-gold" />
                <span>Voice Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gold" />
                <span>Text Messages</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold" />
                <span>Instant Profit</span>
              </div>
            </div>
          </motion.div>

          {/* Right - Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto w-[320px]">
              {/* Phone frame */}
              <div className="bg-[#1a1a1a] rounded-[40px] p-3 shadow-2xl border border-white/10">
                <div className="bg-[#0a0a0a] rounded-[32px] overflow-hidden">
                  {/* Notch */}
                  <div className="h-7 bg-[#1a1a1a] flex justify-center items-end pb-1">
                    <div className="w-24 h-5 bg-black rounded-full" />
                  </div>

                  {/* Chat header */}
                  <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 border-b border-white/5">
                    <div className="w-9 h-9 bg-gold rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">NibBot</p>
                      <p className="text-[10px] text-green-400">online</p>
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div className="px-4 py-4 space-y-3 h-[380px] overflow-hidden">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-[#1a1a1a] chat-bubble-left p-3 max-w-[85%]"
                    >
                      <p className="text-xs text-white/80">
                        🌟 Welcome to NibBot! Your smart business assistant.
                      </p>
                      <p className="text-[10px] text-white/30 mt-1.5">10:02 AM</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="bg-[#1a1a1a] chat-bubble-left p-3 max-w-[85%]"
                    >
                      <p className="text-xs text-white/80">
                        Please select your language:
                        <br />
                        1️⃣ English
                        <br />
                        2️⃣ Hausa
                      </p>
                      <p className="text-[10px] text-white/30 mt-1.5">10:02 AM</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 }}
                      className="bg-gold/20 chat-bubble-right p-3 max-w-[70%] ml-auto border border-gold/30"
                    >
                      <p className="text-xs text-white">1</p>
                      <p className="text-[10px] text-white/30 mt-1.5 text-right">
                        10:03 AM ✓✓
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 }}
                      className="bg-[#1a1a1a] chat-bubble-left p-3 max-w-[85%]"
                    >
                      <p className="text-xs text-white/80">
                        Hello! 👋 What would you like to do today?
                        <br />
                        <br />
                        1️⃣ Record Sales
                        <br />
                        2️⃣ Record Purchases
                        <br />
                        3️⃣ View Today&apos;s Summary
                        <br />
                        4️⃣ View Insights
                      </p>
                      <p className="text-[10px] text-white/30 mt-1.5">10:03 AM</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.7 }}
                      className="bg-gold/20 chat-bubble-right p-3 max-w-[70%] ml-auto border border-gold/30"
                    >
                      <p className="text-xs text-white">🎙️ Voice note</p>
                      <p className="text-[10px] text-white/30 mt-1.5 text-right">
                        10:05 AM ✓✓
                      </p>
                    </motion.div>
                  </div>

                  {/* Input bar */}
                  <div className="bg-[#1a1a1a] px-3 py-2 flex items-center gap-2 border-t border-white/5">
                    <div className="flex-1 bg-[#0a0a0a] rounded-full px-4 py-2 text-xs text-white/30">
                      Type a message...
                    </div>
                    <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                      <Mic className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stat card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="absolute -right-8 top-24 bg-white rounded-2xl shadow-xl p-4 border border-border"
              >
                <p className="text-[10px] text-muted uppercase tracking-wide font-semibold">
                  Today&apos;s Profit
                </p>
                <p className="text-xl font-bold text-charcoal mt-1">₦14,500</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
