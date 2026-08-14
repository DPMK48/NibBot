"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Mic,
  Languages,
  Shield,
  Zap,
  Brain,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice Note Recording",
    description:
      "Speak naturally in English or Hausa. Our AI transcribes and understands your voice notes instantly.",
  },
  {
    icon: Languages,
    title: "Bilingual Support",
    description:
      "Full support for English and Hausa. Switch languages anytime and the entire experience adapts.",
  },
  {
    icon: Brain,
    title: "Smart Clarification",
    description:
      "If your message is vague, NibBot asks smart follow-up questions until it has complete data.",
  },
  {
    icon: Zap,
    title: "Instant Calculations",
    description:
      "Profit, sales totals, and purchase summaries calculated in real-time. No waiting, no confusion.",
  },
  {
    icon: Shield,
    title: "Secure Cloud Storage",
    description:
      "All your business records are stored safely in the cloud. Never lose your data to a torn notebook.",
  },
  {
    icon: Smartphone,
    title: "No App Download",
    description:
      "Everything runs inside WhatsApp. No storage space needed. No updates to install. It just works.",
  },
];

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-24 bg-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">
            Built for You
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Everything You Need
          </h2>
          <p className="mt-4 text-white/50 max-w-2xl mx-auto">
            Powerful features designed specifically for SMEs and retailers who
            need simplicity without sacrificing capability.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-gold/30 hover:bg-white/[0.07] transition-all duration-300 text-center"
            >
              <div className="w-11 h-11 bg-gold/10 rounded-xl flex items-center justify-center mb-5 mx-auto group-hover:bg-gold/20 transition-colors">
                <feature.icon className="w-5 h-5 text-gold" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
