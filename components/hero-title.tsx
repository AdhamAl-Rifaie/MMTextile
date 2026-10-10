"use client";

import { motion } from "framer-motion";
import { titleEntranceStart } from "@/lib/intro-timing";

const title = "MM TEXTILE";
const titleLetters = title.split("");
const titleStart = titleEntranceStart;
const lineDuration = 1.35;
const letterDuration = 1;
const letterStaggerDuration = lineDuration - letterDuration;
const visibleLetterCount = titleLetters.filter((letter) => letter !== " ").length;
const easeOutCubic = [0.33, 1, 0.68, 1] as const;

function getLetterSortValue(letter: string, index: number) {
  let hash = 17;
  const value = `${title}:${letter}:${index}`;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 997;
  }

  return hash;
}

const letterRevealRanks = titleLetters
  .map((letter, index) => ({
    index,
    letter,
    sortValue: getLetterSortValue(letter, index)
  }))
  .filter(({ letter }) => letter !== " ")
  .sort((a, b) => a.sortValue - b.sortValue || a.index - b.index)
  .reduce<Record<number, number>>((ranks, { index }, rank) => {
    ranks[index] = rank;
    return ranks;
  }, {});

export function HeroTitle() {
  return (
    <div className="grid min-w-0 gap-4 sm:gap-5">
      <h1
        aria-label={title}
        className="m-0 flex max-w-full overflow-hidden whitespace-nowrap !text-[clamp(2.75rem,11.8vw,4.2rem)] font-black uppercase !leading-[0.78] tracking-normal text-[#16436f] drop-shadow-[0_16px_42px_rgba(22,67,111,0.12)] [font-family:var(--font-display)] [text-shadow:0_16px_46px_rgba(22,67,111,0.12)] md:!text-[clamp(4rem,14.8vw,16rem)]"
      >
        {titleLetters.map((letter, index) => {
          const revealRank = letterRevealRanks[index] ?? 0;

          return (
            <motion.span
              aria-hidden="true"
              className={letter === " " ? "inline-block w-[0.18em]" : "inline-block will-change-transform"}
              initial={{ y: "128%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{
                delay: titleStart + revealRank * (letterStaggerDuration / Math.max(visibleLetterCount - 1, 1)),
                duration: letterDuration,
                ease: [0.2, 1, 0.28, 1]
              }}
              key={`${letter}-${index}`}
            >
              {letter === " " ? "\u00a0" : letter}
            </motion.span>
          );
        })}
      </h1>
      <div aria-hidden="true" className="relative left-1/2 h-[3px] w-[100dvw] max-w-[100dvw] -translate-x-1/2 bg-[#16436f]/15 sm:h-1">
        <motion.div
          className="h-full w-full origin-left bg-[#16436f] will-change-transform"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: titleStart, duration: lineDuration, ease: easeOutCubic }}
        />
      </div>
    </div>
  );
}
