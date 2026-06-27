"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, MessageCircle, Star } from "lucide-react";

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello NibBot")}`
    : "#";

  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">
            Pricing Plans
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-charcoal">
            Simple, Affordable Pricing
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto">
            Choose the plan that fits your business needs. Start recording your sales with no risk today.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Card 1: Free Trial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-offwhite rounded-3xl p-8 border border-border flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative"
          >
            <div>
              <div className="text-gold font-bold uppercase tracking-widest text-xs mb-2">
                Get Started
              </div>
              <h3 className="text-2xl font-bold text-charcoal">Free Trial</h3>
              <p className="text-sm text-muted mt-3">
                Experience smart, hassle-free bookkeeping on WhatsApp today. No credit card required.
              </p>

              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-black text-charcoal">₦0</span>
                <span className="text-muted text-sm ml-2">/ first month</span>
              </div>

              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-sm text-charcoal">
                  <div className="w-5 h-5 bg-gold/10 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span>Bilingual (English & Hausa)</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-charcoal">
                  <div className="w-5 h-5 bg-gold/10 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span>Bilingual Voice note recording</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-charcoal">
                  <div className="w-5 h-5 bg-gold/10 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span>Text transaction recording</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-charcoal">
                  <div className="w-5 h-5 bg-gold/10 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span>Daily Profit Calculator</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a
                href={whatsappHref}
                target={whatsappNumber ? "_blank" : undefined}
                rel={whatsappNumber ? "noopener noreferrer" : undefined}
                className="w-full inline-flex items-center justify-center gap-2 bg-charcoal hover:bg-charcoal/90 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Start Free Trial
              </a>
            </div>
          </motion.div>

          {/* Card 2: Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-charcoal text-white rounded-3xl p-8 border-2 border-gold flex flex-col justify-between hover:shadow-2xl shadow-xl transition-all duration-300 relative overflow-hidden"
          >
            {/* Best Value Badge */}
            <div className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-current" />
              Best Value
            </div>

            <div>
              <div className="text-gold font-bold uppercase tracking-widest text-xs mb-2">
                Grow Your Business
              </div>
              <h3 className="text-2xl font-bold">Premium Plan</h3>
              <p className="text-sm text-white/70 mt-3">
                Unlock full features after trial to keep managing your business with the assistant.
              </p>

              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-black text-white">₦1,000</span>
                <span className="text-white/60 text-sm ml-2">/ subsequent month</span>
              </div>

              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-sm text-white/90">
                  <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span>Everything in Free Trial</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/90">
                  <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span>Unlimited Voice & Text recordings</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/90">
                  <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span>Bilingual AI Business Insights</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/90">
                  <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span>Interactive Dashboard access</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a
                href={whatsappHref}
                target={whatsappNumber ? "_blank" : undefined}
                rel={whatsappNumber ? "noopener noreferrer" : undefined}
                className="w-full inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold py-3.5 rounded-xl transition-all duration-300 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Subscribe Now
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
