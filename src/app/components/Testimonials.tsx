"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  name: string;
  business: string;
  quote: string;
  translation?: string;
  language: string;
}

const staticTestimonials: Testimonial[] = [
  {
    name: "Mama Ngozi",
    business: "Provision Store, Kano",
    quote:
      "Before NibBot, I never knew if I was making profit or just spending my capital. Now I send one voice note at night and I know exactly how much I gained. It has changed how I run my shop.",
    language: "English",
  },
  {
    name: "Hajiya Amina",
    business: "Fabric Seller, Kaduna",
    quote:
      "Ina iya amfani da Hausa. Ba bukatar na karanta Ingilishi ba. NibBot ya taimaka mini sosai wajen sanin ribar da na samu kowace rana.",
    translation:
      "I can use Hausa. I don't need to read English. NibBot has really helped me know the profit I make every day.",
    language: "Hausa",
  },
  {
    name: "Aunty Bose",
    business: "Food Stall, Lagos",
    quote:
      "I don't know how to use those big accounting apps. But WhatsApp? I use it every day. NibBot is like having an accountant in my phone that understands me.",
    language: "English",
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const [dynamicTestimonials, setDynamicTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    async function loadStories() {
      try {
        const res = await fetch("/api/stories");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped: Testimonial[] = json.data.map((item: any) => {
              // Capitalize business type for display
              let businessDisplay = "Business Owner";
              if (item.businessType) {
                businessDisplay = item.businessType
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c: string) => c.toUpperCase());
              }
              return {
                name: item.name,
                business: businessDisplay,
                quote: item.story || "",
                language: item.language || "English",
              };
            });
            setDynamicTestimonials(mapped);
          }
        }
      } catch (error) {
        console.error("Failed to load user stories:", error);
      }
    }
    loadStories();
  }, []);

  const allTestimonials = [...staticTestimonials, ...dynamicTestimonials];

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8;
      const target = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollContainerRef.current.scrollTo({
        left: target,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-24 bg-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">
            Real Stories
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-charcoal">
            From Business Owners Like You
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto">
            These are real business owners who have transformed how they track
            their finances with NibBot.
          </p>
        </motion.div>

        <div className="relative px-2 sm:px-12">
          {/* Left Arrow Button */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gold hover:text-white text-charcoal border border-border w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
            aria-label="Previous stories"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-8 pt-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {allTestimonials.map((t, index) => (
              <motion.div
                key={`${t.name}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: Math.min(index * 0.15, 1) }}
                className="min-w-[280px] sm:min-w-[340px] md:min-w-[380px] max-w-[400px] bg-white rounded-2xl p-8 border border-border hover:border-gold/20 hover:shadow-xl transition-all duration-300 flex flex-col shrink-0 snap-start"
              >
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center mb-5">
                  <Quote className="w-4 h-4 text-gold" />
                </div>
                <p className="text-sm text-charcoal leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                {t.translation && (
                  <p className="mt-3 text-xs text-muted italic border-l-2 border-gold/30 pl-3">
                    {t.translation}
                  </p>
                )}
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="font-semibold text-charcoal text-sm">{t.name}</p>
                  <p className="text-xs text-muted mt-0.5">{t.business}</p>
                  {t.language === "Hausa" && (
                    <span className="inline-block mt-2 text-[10px] bg-gold/10 text-gold-dark px-2 py-0.5 rounded-full font-medium">
                      Hausa
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gold hover:text-white text-charcoal border border-border w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
            aria-label="Next stories"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
