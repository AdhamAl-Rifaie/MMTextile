"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { introExitDuration, introExitStart } from "@/lib/intro-timing";

const photos = [
  {
    src: "/uploads/products/basic-floral-towel-stack.webp",
    alt: "Stacked basic towels beside a bathtub",
    rotate: -9,
    x: -64,
    y: -28
  },
  {
    src: "/uploads/products/basic-floral-towel-rolls.webp",
    alt: "Rolled basic towels on a bathroom counter",
    rotate: 8,
    x: 54,
    y: 24
  },
  {
    src: "/uploads/products/basic-floral-towel-burgundy-detail.webp",
    alt: "Burgundy basic towel texture detail",
    rotate: -4,
    x: 16,
    y: -52
  },
  {
    src: "/uploads/products/basic-floral-towel-stack1.jpeg",
    alt: "Basic towels stacked on a bathroom stool",
    rotate: 11,
    x: -28,
    y: 46
  },
  {
    src: "/uploads/products/basicTowels.jpeg",
    alt: "Basic towels product composition",
    rotate: -13,
    x: 68,
    y: -8
  },
  {
    src: "/uploads/products/Towels.jpeg",
    alt: "Basic towels display",
    rotate: 4,
    x: -8,
    y: 4
  }
];

const title = "MM TEXTILE";
const imageEnterStart = 0.08;
const imageEnterStep = 0.16;
const imageEnterDuration = 0.78;
const textEnterDuration = 0.68;
const textEnterBase =
  imageEnterStart + imageEnterStep * (photos.length - 1) + imageEnterDuration - textEnterDuration - 0.5;
const firstReverseStart = introExitStart;
const revealStart = firstReverseStart;
const revealDuration = introExitDuration;
const letterDelays = [0.22, 0.02, 0.36, 0.12, 0.5, 0.28, 0.08, 0.42, 0.18];
const letterExitDelays = [0.15, 0.02, 0.21, 0.08, 0.24, 0.12, 0, 0.18, 0.05];

function getLetterDelay(delays: number[], index: number) {
  const pass = Math.floor(index / delays.length);

  return delays[index % delays.length] + pass * 0.025;
}

export function IntroReveal({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setShowIntro(false);
    }
  }, [prefersReducedMotion]);

  return (
    <>
      <div className="relative z-0 min-h-screen">{children}</div>

      {showIntro ? (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-black text-white"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{ delay: revealStart, duration: revealDuration, ease: [0.86, 0, 0.07, 1] }}
          onAnimationComplete={() => {
            setShowIntro(false);
          }}
        >
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(214,174,76,0.12),transparent_34rem)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.45] }}
            transition={{ duration: 5, times: [0, 0.18, 0.78, 1], ease: "easeOut" }}
          />

          <motion.div
            className="relative z-10 h-[48vh] min-h-[330px] w-[min(72vw,520px)] max-w-[86vw]"
          >
            {photos.map((photo, index) => {
              const enterDelay = imageEnterStart + index * imageEnterStep;
              const exitStart = firstReverseStart + (photos.length - 1 - index) * 0.16;
              const exitEnd = exitStart + 0.8;
              const duration = exitEnd - enterDelay;
              const enterEnd = imageEnterDuration / duration;
              const holdEnd = (exitStart - enterDelay) / duration;

              return (
                <motion.figure
                  key={photo.src}
                  className="absolute left-1/2 top-1/2 aspect-[3/4] w-[clamp(150px,21vw,245px)] origin-center overflow-hidden rounded-[10px] border border-white/10 bg-zinc-900 shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
                  initial={{
                    x: "-50%",
                    y: "calc(-50% + 70px)",
                    scale: 0,
                    rotate: photo.rotate * 0.35
                  }}
                  animate={{
                    x: [
                      "-50%",
                      `calc(-50% + ${photo.x}px)`,
                      `calc(-50% + ${photo.x}px)`,
                      "-50%"
                    ],
                    y: [
                      "calc(-50% + 70px)",
                      `calc(-50% + ${photo.y}px)`,
                      `calc(-50% + ${photo.y}px)`,
                      "calc(-50% + 70px)"
                    ],
                    scale: [0, 1.04, 1, 0],
                    rotate: [photo.rotate * 0.35, photo.rotate, photo.rotate, photo.rotate * 0.35]
                  }}
                  transition={{
                    delay: enterDelay,
                    duration,
                    times: [0, enterEnd, holdEnd, 1],
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  style={{ zIndex: index + 1 }}
                >
                  <img
                    className="h-full w-full object-cover"
                    src={photo.src}
                    alt={photo.alt}
                    loading="eager"
                    decoding="async"
                    fetchPriority={index < 2 ? "high" : "auto"}
                  />
                </motion.figure>
              );
            })}
          </motion.div>

          <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center px-5">
            <h2 className="flex max-w-[min(94vw,1260px)] origin-center scale-x-[0.78] flex-wrap justify-center gap-x-[0.04em] gap-y-2 text-center text-[clamp(2.8rem,8.2vw,9.2rem)] font-black leading-none tracking-[2px] text-white drop-shadow-[0_0_16px_rgba(241,200,91,0.44)] [font-family:var(--font-brand)] [text-shadow:0_0_10px_rgba(241,200,91,0.38),0_0_28px_rgba(241,200,91,0.24)]">
              {Array.from(title).map((letter, index) => {
                const enterDelay = textEnterBase + getLetterDelay(letterDelays, index);
                const exitStart = firstReverseStart + getLetterDelay(letterExitDelays, index);
                const exitEnd = exitStart + 1.34;
                const duration = exitEnd - enterDelay;
                const enterEnd = textEnterDuration / duration;
                const holdEnd = (exitStart - enterDelay) / duration;

                return (
                  <span
                    key={`${letter}-${index}`}
                    className={letter === " " ? "inline-block w-[0.22em]" : "inline-block overflow-hidden"}
                    aria-hidden="true"
                  >
                    {letter === " " ? null : (
                      <motion.span
                        className="inline-block will-change-transform"
                        initial={{ y: "125%", rotateX: 64 }}
                        animate={{
                          y: ["125%", "0%", "0%", "-118%"],
                          rotateX: [64, 0, 0, -16]
                        }}
                        transition={{
                          delay: enterDelay,
                          duration,
                          times: [0, enterEnd, holdEnd, 1],
                          ease: [0.2, 1, 0.32, 1]
                        }}
                      >
                        {letter}
                      </motion.span>
                    )}
                  </span>
                );
              })}
            </h2>
          </div>

          <motion.div
            className="absolute bottom-8 left-1/2 h-px w-24 -translate-x-1/2 bg-white/50"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ delay: 1.05, duration: 3.5, times: [0, 0.25, 0.72, 1] }}
          />
        </motion.div>
      ) : null}
    </>
  );
}
