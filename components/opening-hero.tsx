"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { pageEntranceStart } from "@/lib/intro-timing";

const ease = [0.16, 1, 0.3, 1] as const;
const heroEntranceStart = pageEntranceStart + 0.3;

export function OpeningHero() {
  return (
    <section
      className="relative left-1/2 grid w-[100dvw] max-w-[100dvw] -translate-x-1/2 overflow-hidden border-y border-[#c4ab81]/50 bg-[#102d4b] text-[#f7f2e9] lg:min-h-[640px] lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)]"
      aria-labelledby="opening-hero-heading"
    >
      <div className="relative z-10 order-2 flex min-w-0 flex-col justify-between gap-14 px-6 py-9 sm:px-10 sm:py-12 lg:order-1 lg:px-[clamp(2.5rem,5vw,7rem)] lg:py-14">
        <motion.div
          className="flex items-center gap-4 text-[#d4b78a]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: heroEntranceStart + 0.05, duration: 0.65, ease }}
        >
          <span className="h-px w-10 bg-current" aria-hidden="true" />
          <p className="m-0 [font-family:var(--font-brand)] text-sm font-extrabold uppercase tracking-[0.2em] sm:text-base">
            The textile edit / 01
          </p>
        </motion.div>

        <div className="max-w-[38rem]">
          <h2
            id="opening-hero-heading"
            className="m-0 [font-family:var(--font-editorial)] text-[clamp(3.3rem,7vw,8.5rem)] font-medium leading-[0.77] tracking-[-0.055em] text-[#f7f2e9]"
          >
            <span className="block overflow-hidden pb-[0.15em]">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ delay: heroEntranceStart + 0.14, duration: 0.8, ease }}
              >
                The beauty of
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.17em]">
              <motion.em
                className="block font-normal text-[#d4b78a]"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ delay: heroEntranceStart + 0.3, duration: 0.8, ease }}
              >
                everyday rituals.
              </motion.em>
            </span>
          </h2>
          <motion.p
            className="m-0 mt-4 max-w-[29rem] [font-family:var(--font-display)] text-sm leading-7 text-[#e0e8ed]/82 sm:text-base"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: heroEntranceStart + 0.4, duration: 0.7, ease }}
          >
            Rich color, considered details, and a softer touch for the spaces you return to every day.
          </motion.p>
        </div>

        <motion.div
          className="flex flex-wrap items-end justify-between gap-5 border-t border-[#d4b78a]/35 pt-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: heroEntranceStart + 0.5, duration: 0.7, ease }}
        >
          <a
            href="#product-wall"
            className="group inline-flex items-center gap-3 [font-family:var(--font-brand)] text-sm font-extrabold uppercase tracking-[0.16em] text-[#f7f2e9] no-underline outline-none transition-colors hover:text-[#d4b78a] focus-visible:ring-2 focus-visible:ring-[#d4b78a] sm:text-base"
          >
            Explore collection
            <span className="text-xl leading-none transition-transform group-hover:translate-x-1" aria-hidden="true">↗</span>
          </a>
          <span className="[font-family:var(--font-brand)] text-xs font-extrabold uppercase tracking-[0.17em] text-[#d4b78a]">
            MM Textile / Egypt
          </span>
        </motion.div>
      </div>

      <motion.div
        className="relative order-1 min-h-0 aspect-[4/3] overflow-hidden bg-[#c6aa8d] will-change-transform lg:order-2 lg:aspect-auto"
        initial={{ opacity: 0, scale: 1.035 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: heroEntranceStart, duration: 0.95, ease }}
      >
        <Image
          src="/uploads/products/royal-border-bath-towel-variant-2-c621a342-df77-40dd-bcee-e74d0c120605.webp"
          alt="Navy, magenta, and burgundy Royal Border bath towels displayed together"
          fill
          preload
          sizes="(min-width: 1024px) 57vw, 100vw"
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#142b40]/55 to-transparent" />
        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-[#fffaf3] sm:inset-x-8 sm:bottom-8">
          <div>
            <p className="m-0 [font-family:var(--font-brand)] text-xs font-extrabold uppercase tracking-[0.18em]">The signature</p>
            <p className="m-0 mt-1 [font-family:var(--font-editorial)] text-3xl font-medium italic leading-none sm:text-4xl">Royal Border</p>
          </div>
          <span className="[font-family:var(--font-brand)] text-sm font-extrabold uppercase tracking-[0.14em]">Bath towel</span>
        </div>
      </motion.div>
    </section>
  );
}
