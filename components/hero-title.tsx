"use client";

import { motion } from "framer-motion";

const title = "MM TEXTILE";
const letterOrderDelays = [0.2, 0.04, 0.34, 0.12, 0.28, 0, 0.42, 0.16, 0.08, 0.36, 0.24];

export function HeroTitle() {
  return (
    <h1
      aria-label={title}
      className="m-0 flex max-w-full overflow-hidden whitespace-nowrap !text-[clamp(2.75rem,11.8vw,4.2rem)] font-black uppercase !leading-[0.78] tracking-normal text-[#f1c85b] drop-shadow-[0_0_34px_rgba(241,200,91,0.28)] [font-family:var(--font-display)] [text-shadow:0_0_38px_rgba(241,200,91,0.22)] md:!text-[clamp(4rem,14.8vw,16rem)]"
    >
      {title.split("").map((letter, index) => (
        <motion.span
          aria-hidden="true"
          className={letter === " " ? "inline-block w-[0.18em]" : "inline-block"}
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          transition={{
            delay: 3.8 + letterOrderDelays[index],
            duration: 0.78,
            ease: [0.16, 1, 0.3, 1]
          }}
          key={`${letter}-${index}`}
        >
          {letter === " " ? "\u00a0" : letter}
        </motion.span>
      ))}
    </h1>
  );
}
