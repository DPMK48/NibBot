"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Mic, Send, MessageCircle, CheckCheck } from "lucide-react";

type Message = {
  id: number;
  text: string;
  sender: "bot" | "user";
  type?: "text" | "voice" | "summary";
};

const demoMessages: Message[] = [
  {
    id: 1,
    text: "Welcome to nibBot 👋\n\nYour smart business assistant.\n\nPlease select your language:\n1. English\n2. Hausa",
    sender: "bot",
  },
  { id: 2, text: "1", sender: "user" },
  {
    id: 3,
    text: "What is the name of your business? (For example: Mama Ngozi Store)",
    sender: "bot",
  },
  { id: 4, text: "Ngozi Provisions", sender: "user" },
  {
    id: 5,
    text: "What type of business is it? (For example: Provisions, Food, Fabrics, Fruits, or write your own)",
    sender: "bot",
  },
  { id: 6, text: "Provisions", sender: "user" },
  {
    id: 7,
    text: "What would you like to do today?\n\n1. Record Sales\n2. Record Purchases\n3. View Today's Summary\n4. View Insights",
    sender: "bot",
  },
  { id: 8, text: "1", sender: "user" },
  {
    id: 9,
    text: "Please type what you sold today, or send a voice note.\n\nExample:\n\"I sold 5 bags of rice at 35,000 each and 10 sachets of milk at 200 each.\"",
    sender: "bot",
  },
  { id: 10, text: "🎙️ Voice note (0:08)", sender: "user", type: "voice" },
  {
    id: 11,
    text: "Here is what I recorded:\n\nProduct: Rice\nQuantity: 5 bags\nPrice: ₦35,000 each\nTotal: ₦175,000\nType: SALE\n\nIs this correct?\n1. Yes, Save it\n2. No, Let me redo it",
    sender: "bot",
  },
  { id: 12, text: "1", sender: "user" },
  {
    id: 13,
    text: "Saved! Your record has been saved.\n\nWhat would you like to do next?\n\n1. Record Sales\n2. Record Purchases\n3. View Today's Summary\n4. View Insights",
    sender: "bot",
  },
  { id: 14, text: "3", sender: "user" },
  {
    id: 15,
    text: "Today's Business Summary\n\nTotal Sales:     ₦225,000\nTotal Purchases: ₦84,000\nYour Profit:     ₦141,000\n\nTransactions recorded: 4\nTop product today: Rice\n\nKeep it up!",
    sender: "bot",
    type: "summary",
  },
];

export default function Demo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [visibleCount, setVisibleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInView && !isPlaying) {
      const timer = setTimeout(() => {
        setIsPlaying(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isInView, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    if (visibleCount >= demoMessages.length) return;

    const delay =
      demoMessages[visibleCount].sender === "user" ? 1200 : 2500;
    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, visibleCount]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visibleCount]);

  const reset = () => {
    setVisibleCount(0);
    setIsPlaying(true);
  };

  return (
    <section id="demo" className="py-24 bg-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">
            Live Preview
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-charcoal">
            See NibBot in Action
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto">
            Watch a real conversation between a business owner and NibBot.
            This is exactly what your experience will look like.
          </p>
        </motion.div>

        <div className="max-w-md mx-auto">
          {/* Phone mockup */}
          <div className="bg-[#0a0a0a] rounded-[36px] p-3 shadow-2xl border border-white/10">
            <div className="bg-[#0a0a0a] rounded-[28px] overflow-hidden">
              {/* Header */}
              <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 border-b border-white/5">
                <div className="w-9 h-9 bg-gold rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">NibBot</p>
                  <p className="text-[10px] text-green-400">online</p>
                </div>
                <button
                  onClick={reset}
                  className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors"
                >
                  Replay
                </button>
              </div>

              {/* Messages */}
              <div ref={chatContainerRef} className="px-4 py-4 space-y-3 h-[420px] overflow-y-auto scrollbar-hide">
                <AnimatePresence>
                  {demoMessages.slice(0, visibleCount).map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] p-3.5 ${
                          msg.sender === "user"
                            ? msg.type === "voice"
                              ? "bg-gold/20 border border-gold/30 chat-bubble-right"
                              : "bg-gold/20 border border-gold/30 chat-bubble-right"
                            : msg.type === "summary"
                            ? "bg-white/10 border border-gold/20 chat-bubble-left"
                            : "bg-[#1a1a1a] chat-bubble-left"
                        }`}
                      >
                        {msg.type === "voice" && msg.sender === "user" ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gold/30 rounded-full flex items-center justify-center">
                              <Mic className="w-4 h-4 text-gold" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-end gap-1 h-5">
                                {[3, 5, 2, 6, 4, 7, 3, 5].map((h, i) => (
                                  <motion.div
                                    key={i}
                                    animate={{ height: [h * 2, h * 3, h * 2] }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 0.6,
                                      delay: i * 0.05,
                                    }}
                                    className="w-1 bg-gold rounded-full"
                                    style={{ height: h * 2 }}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] text-white/40">
                              0:08
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-white/85 whitespace-pre-line leading-relaxed">
                            {msg.text}
                          </p>
                        )}
                        <div
                          className={`flex items-center gap-1 mt-1.5 ${
                            msg.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <span className="text-[9px] text-white/25">
                            {(() => {
                              const idx = demoMessages.findIndex((m) => m.id === msg.id);
                              const min = 5 + idx;
                              const minStr = min < 10 ? `0${min}` : `${min}`;
                              return `10:${minStr} AM`;
                            })()}
                          </span>
                          {msg.sender === "user" && (
                            <CheckCheck className="w-3 h-3 text-gold/60" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Input */}
              <div className="bg-[#1a1a1a] px-3 py-2.5 flex items-center gap-2 border-t border-white/5">
                <div className="flex-1 bg-[#0a0a0a] rounded-full px-4 py-2.5 text-xs text-white/30 flex items-center">
                  Type a message...
                </div>
                <div className="w-9 h-9 bg-gold rounded-full flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <div className="w-9 h-9 bg-gold/20 rounded-full flex items-center justify-center">
                  <Send className="w-4 h-4 text-gold" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
