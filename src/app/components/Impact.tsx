"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Users, Receipt, TrendingUp, Store } from "lucide-react";

function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  isInView,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  isInView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Impact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const [data, setData] = useState({
    waitlistCount: 0,
    transactionCount: 0,
    totalSales: 0,
    totalPurchases: 0,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((json) => {
        setData({
          waitlistCount: json.waitlistCount || 0,
          transactionCount: json.transactionCount || 0,
          totalSales: Number(json.totalSales || 0),
          totalPurchases: Number(json.totalPurchases || 0),
        });
      })
      .catch((err) => console.error("Error loading stats", err));
  }, []);

  const stats = [
    {
      icon: Users,
      target: data.waitlistCount,
      prefix: "",
      suffix: "+",
      label: "Stories Shared",
    },
    {
      icon: Receipt,
      target: data.transactionCount,
      prefix: "",
      suffix: "+",
      label: "Transactions Recorded",
    },
    {
      icon: TrendingUp,
      target: data.totalSales,
      prefix: "₦",
      suffix: "",
      label: "Total Sales Tracked",
    },
    {
      icon: Store,
      target: Math.max(0, data.totalSales - data.totalPurchases),
      prefix: "₦",
      suffix: "",
      label: "Net Business Profit",
    },
  ];

  return (
    <section id="impact" className="py-24 bg-charcoal relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">
            Our Impact
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Numbers That Matter
          </h2>
          <p className="mt-4 text-white/50 max-w-2xl mx-auto">
            Every number represents a business owner who now knows her daily
            profit for the first time.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:border-gold/20 transition-colors"
            >
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-gold" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-white mb-2">
                <AnimatedCounter
                  target={stat.target}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  isInView={isInView}
                />
              </p>
              <p className="text-sm text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

