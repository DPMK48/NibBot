"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MessageCircle, Mic, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Open WhatsApp",
    description:
      "Click the button to start a chat with NibBot. No app download, no sign-up forms. Just WhatsApp — the app you already use every day.",
    color: "bg-gold",
  },
  {
    number: "02",
    icon: Mic,
    title: "Speak or Type",
    description:
      "Send a voice note or text message describing what you sold or bought. In English, Hausa, or Pidgin. Our AI understands you naturally.",
    color: "bg-charcoal",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "See Your Profit",
    description:
      "Get instant calculations. Know your total sales, purchases, and profit for the day — clearly formatted and easy to understand.",
    color: "bg-gold",
  },
];

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative group"
    >
      <div className="bg-white rounded-2xl p-8 border border-border hover:border-gold/30 transition-all duration-300 hover:shadow-lg h-full">
        <div className="flex items-start justify-between mb-6">
          <div
            className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center`}
          >
            <step.icon className="w-6 h-6 text-white" />
          </div>
          <span className="text-4xl font-bold text-black/5 group-hover:text-gold/10 transition-colors">
            {step.number}
          </span>
        </div>
        <h3 className="text-xl font-bold text-charcoal mb-3">{step.title}</h3>
        <p className="text-muted leading-relaxed text-sm">{step.description}</p>
      </div>

      {/* Connector line */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-[2px] bg-border">
          <div className="absolute right-0 -top-[3px] w-2 h-2 bg-gold rounded-full" />
        </div>
      )}
    </motion.div>
  );
}

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-24 bg-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">
            Simple Process
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-charcoal">
            How NibBot Works
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto">
            Three simple steps. No training needed. If you can use WhatsApp, you
            can use NibBot.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
