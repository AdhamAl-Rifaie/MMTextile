"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const headlineWords = ["Royal", "Border", "Bath", "Towel"];
const detailItems = ["Egyptian cotton", "Refined border weave", "Hospitality finish"];

export function OpeningHero() {
  return (
    <section
      className="relative left-1/2 min-h-[520px] w-[100dvw] max-w-[100dvw] -translate-x-1/2 overflow-hidden border-y border-[#f1c85b]/45 bg-black md:min-h-[680px]"
      aria-label="Royal border bath towel"
    >
      <Image
        src="/uploads/products/royal-border-bath-towel-variant-2-c621a342-df77-40dd-bcee-e74d0c120605.webp"
        alt="Royal border bath towel in MM Textile collection"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.58)_36%,rgba(0,0,0,0.12)_70%),radial-gradient(circle_at_72%_28%,rgba(241,200,91,0.18),transparent_30rem)]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-[#f1c85b]" />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-[#f1c85b]" />

      <div className="relative z-10 mx-auto grid min-h-[520px] w-full max-w-[1840px] content-between px-4 py-6 sm:px-6 md:min-h-[680px] md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[#f1c85b]">
          <motion.p
            className="m-0 text-[0.72rem] font-black uppercase tracking-normal sm:text-[0.82rem]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.65, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Signature woven collection
          </motion.p>
          <motion.p
            className="m-0 border border-[#f1c85b]/55 bg-black/45 px-3 py-2 text-[0.68rem] font-black uppercase tracking-normal backdrop-blur"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 4.82, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            El Mahalla El Kubra
          </motion.p>
        </div>

        <div className="grid max-w-[980px] gap-5 py-10 md:py-16">
          <p className="m-0 max-w-[34rem] text-sm font-black uppercase leading-6 text-[#f7f0de]/80 sm:text-base">
            A bold towel profile with a polished border, dense handfeel, and a warm hotel-ready finish.
          </p>

          <h2 className="m-0 grid gap-0 overflow-hidden text-[clamp(3.7rem,12vw,12.5rem)] font-black uppercase leading-[0.78] tracking-normal text-[#f1c85b] [font-family:var(--font-display)] [text-shadow:0_0_34px_rgba(241,200,91,0.28)]">
            {headlineWords.map((word, index) => (
              <span className="block overflow-hidden" key={word}>
                <motion.span
                  className="block"
                  initial={{ y: "112%", rotateX: -28 }}
                  animate={{ y: "0%", rotateX: 0 }}
                  transition={{
                    delay: 4.9 + index * 0.16,
                    duration: 0.9,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h2>
        </div>

        <motion.div
          className="grid gap-3 border-t border-[#f1c85b]/45 pt-4 sm:flex sm:flex-wrap sm:items-center sm:gap-4"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5.45, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {detailItems.map((item) => (
            <span
              className="inline-flex min-h-10 items-center border border-white/18 bg-black/38 px-3 text-[0.74rem] font-black uppercase text-[#f7f0de] backdrop-blur"
              key={item}
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
