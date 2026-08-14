"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageCircle, CheckCircle, Loader2, ArrowRight } from "lucide-react";

export default function ShareStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [form, setForm] = useState({
    name: "",
    phone: "",
    businessType: "",
    language: "English",
    story: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.story) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        form.language === "Hausa" ? "Barka NibBot" : "Hello NibBot"
      )}`
    : "#";

  return (
    <section id="share-story" className="py-24 bg-charcoal relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gold/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">
              Join Our Community
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
              Share Your NibBot Story
            </h2>
            <p className="mt-4 text-white/50 leading-relaxed max-w-md">
              How has NibBot transformed your business bookkeeping? Share your real testimony
              and experience to inspire other business owners in our community.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-gold" />
                </div>
                <p className="text-sm text-white/60">
                  Inspire other SMEs and retailers.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-gold" />
                </div>
                <p className="text-sm text-white/60">
                  Get featured in our Real Stories showcase section.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-gold" />
                </div>
                <p className="text-sm text-white/60">
                  Direct links to NibBot WhatsApp are always live.
                </p>
              </div>
            </div>

            <div className="mt-10">
              <a
                href={whatsappHref}
                target={whatsappNumber ? "_blank" : undefined}
                rel={whatsappNumber ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Start Chatting on WhatsApp
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
              {status === "success" ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Thank you for sharing!
                  </h3>
                  <p className="text-sm text-white/50 mb-6">
                    Your experience helps inspire other business owners to manage their bookkeeping easily.
                  </p>
                  <a
                    href={whatsappHref}
                    target={whatsappNumber ? "_blank" : undefined}
                    rel={whatsappNumber ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 text-sm w-full"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Open NibBot on WhatsApp
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g. Mama Ngozi"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      WhatsApp Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="e.g. +234 801 234 5678"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Business Type
                      </label>
                      <div className="relative">
                        <select
                          value={form.businessType}
                          onChange={(e) =>
                            setForm({ ...form, businessType: e.target.value })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors appearance-none"
                        >
                          <option value="" className="bg-charcoal">
                            Select...
                          </option>
                          <option value="provision_store" className="bg-charcoal">
                            Provision Store
                          </option>
                          <option value="food_stall" className="bg-charcoal">
                            Food Stall
                          </option>
                          <option value="fabric" className="bg-charcoal">
                            Fabric/Clothing
                          </option>
                          <option value="vegetables" className="bg-charcoal">
                            Vegetables/Fruits
                          </option>
                          <option value="other" className="bg-charcoal">
                            Other
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/50">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Preferred Language
                      </label>
                      <div className="relative">
                        <select
                          value={form.language}
                          onChange={(e) =>
                            setForm({ ...form, language: e.target.value })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors appearance-none"
                        >
                          <option value="English" className="bg-charcoal">
                            English
                          </option>
                          <option value="Hausa" className="bg-charcoal">
                            Hausa
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/50">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Your Story / Testimony
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.story}
                      onChange={(e) =>
                        setForm({ ...form, story: e.target.value })
                      }
                      placeholder="e.g. Since using NibBot, I don't need a notebook. I know my profits every day in Hausa!"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-gold/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        Submit Story
                      </>
                    )}
                  </button>

                  {status === "error" && (
                    <p className="text-xs text-red-400 text-center">
                      Something went wrong. Please try again.
                    </p>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
