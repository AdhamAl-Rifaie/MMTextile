"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ChevronLeft, ChevronRight, GalleryHorizontal, Pause, Play, X } from "lucide-react";
import {
  fallbackProducts,
  getProductCategoryFilters,
  primaryProductCategory,
  type ProductVariation
} from "@/lib/products";

const ease = [0.16, 1, 0.3, 1] as const;

type ShowcaseSlide = {
  id: string;
  product: ProductVariation;
  variantName: string;
  color: string;
  imageUrl: string | null;
};

function getOffset(index: number, activeIndex: number, total: number) {
  let offset = index - activeIndex;

  if (offset > total / 2) {
    offset -= total;
  }

  if (offset < -total / 2) {
    offset += total;
  }

  return offset;
}

export function ProductShowcase({ products = fallbackProducts }: { products?: ProductVariation[] }) {
  const [activeCategory, setActiveCategory] = useState(primaryProductCategory);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [detailSlide, setDetailSlide] = useState<ShowcaseSlide | null>(null);
  const wheelGesture = useRef({ distance: 0, lastStepAt: 0 });
  const wheelEndTimer = useRef<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lastSwipeAt = useRef(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const categories = useMemo(
    () => getProductCategoryFilters(products).filter((category) => (
      category === "All" || products.some((product) => product.category === category)
    )),
    [products]
  );
  const filteredProducts = useMemo(
    () => activeCategory === "All" ? products : products.filter((product) => product.category === activeCategory),
    [activeCategory, products]
  );
  const slides = useMemo<ShowcaseSlide[]>(() => filteredProducts.flatMap((product) => {
    const variants = product.variants.length ? product.variants : [{
      id: `${product.id}-primary`,
      name: "Primary design",
      color: product.color,
      imageUrl: product.imageUrl
    }];

    return variants.map((variant) => ({
      id: `${product.id}-${variant.id}`,
      product,
      variantName: variant.name,
      color: variant.color || product.color,
      imageUrl: variant.imageUrl ?? product.imageUrl
    }));
  }), [filteredProducts]);
  const activeSlide = slides[activeSlideIndex] ?? slides[0];
  const activeProduct = activeSlide?.product;
  const visibleSlides = useMemo(() => slides
    .map((slide, index) => {
      const offset = getOffset(index, activeSlideIndex, slides.length);
      const depth = Math.abs(offset);

      return { slide, index, offset, depth };
    })
    .filter(({ depth }) => depth <= 1)
    .sort((a, b) => b.depth - a.depth), [activeSlideIndex, slides]);

  useEffect(() => {
    setActiveSlideIndex(0);
    setDetailSlide(null);
  }, [activeCategory]);

  useEffect(() => {
    if (!isPlaying || reducedMotion || detailSlide || slides.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlideIndex((index) => (index + 1) % slides.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [activeSlideIndex, detailSlide, isPlaying, reducedMotion, slides.length]);

  useEffect(() => () => {
    if (wheelEndTimer.current !== null) {
      window.clearTimeout(wheelEndTimer.current);
    }
  }, []);

  useEffect(() => {
    if (!detailSlide) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetailSlide(null);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [detailSlide]);

  const goToSlide = useCallback((index: number) => {
    setActiveSlideIndex((index + slides.length) % slides.length);
  }, [slides.length]);

  const stepSlide = useCallback((direction: number) => {
    setActiveSlideIndex((index) => (index + direction + slides.length) % slides.length);
  }, [slides.length]);

  const openProduct = (productId: string) => {
    const index = slides.findIndex((slide) => slide.product.id === productId);

    if (index >= 0) {
      goToSlide(index);
      setDetailSlide(slides[index]);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (slides.length < 2 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
      return;
    }

    const gesture = wheelGesture.current;

    if (wheelEndTimer.current !== null) {
      window.clearTimeout(wheelEndTimer.current);
    }

    wheelEndTimer.current = window.setTimeout(() => {
      wheelGesture.current.distance = 0;
      wheelEndTimer.current = null;
    }, 180);

    const distance = event.deltaX * (event.deltaMode === 1 ? 16 : 1);

    if (gesture.distance !== 0 && Math.sign(gesture.distance) !== Math.sign(distance)) {
      gesture.distance = 0;
    }

    gesture.distance += distance;

    const now = Date.now();

    if (Math.abs(gesture.distance) >= 72 && now - gesture.lastStepAt >= 220) {
      stepSlide(Math.sign(gesture.distance));
      gesture.distance = 0;
      gesture.lastStepAt = now;
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart.current || slides.length < 2) {
      return;
    }

    const deltaX = event.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = event.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      lastSwipeAt.current = Date.now();
      stepSlide(-Math.sign(deltaX));
    }
  };

  if (!activeProduct || !activeSlide) {
    return null;
  }

  const detailVariants = detailSlide
    ? detailSlide.product.variants.length
      ? detailSlide.product.variants
      : [{
          id: `${detailSlide.product.id}-primary`,
          name: detailSlide.variantName,
          color: detailSlide.color,
          imageUrl: detailSlide.imageUrl
        }]
    : [];

  return (
    <>
      <section className="relative mt-10 min-w-0 overflow-hidden border-y border-[#16436f]/18 py-6 sm:mt-12 sm:py-8" aria-label="Featured towel products">
      <div className="absolute inset-x-0 top-0 h-px bg-[#16436f]/35" />

      <div className="relative min-h-[720px] overflow-hidden border border-[#16436f]/14 bg-[#eef2f6] shadow-[0_36px_120px_rgba(22,67,111,0.14)] sm:min-h-[780px] xl:min-h-[820px]">
        <div className="pointer-events-none absolute -left-6 -top-5 text-[clamp(7rem,22vw,20rem)] font-black leading-none text-[#16436f]/5">
          {String(activeSlideIndex + 1).padStart(2, "0")}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(22,67,111,0.12),transparent_27rem),linear-gradient(135deg,rgba(255,255,255,0.82),transparent_55%)]" />

        <div className="relative z-10 grid min-h-[720px] grid-rows-[auto_minmax(0,1fr)_auto] gap-4 p-3 sm:min-h-[780px] sm:p-6 xl:min-h-[820px]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 border border-[#16436f]/25 bg-white/80 px-3 py-2 text-[0.68rem] font-black uppercase text-[#16436f] shadow-[0_10px_30px_rgba(22,67,111,0.08)] backdrop-blur">
                <GalleryHorizontal aria-hidden="true" size={15} strokeWidth={2.4} />
                Image slideshow
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Showcase categories">
                {categories.map((category) => {
                  const count = category === "All" ? products.length : products.filter((product) => product.category === category).length;
                  const active = activeCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setActiveCategory(category)}
                      className={`min-h-9 border px-2.5 text-[0.62rem] font-black uppercase transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16436f] sm:min-h-10 sm:px-3 sm:text-[0.7rem] ${
                        active ? "border-[#16436f] bg-[#16436f] text-white" : "border-[#16436f]/25 bg-white/60 text-[#16436f] hover:border-[#16436f]"
                      }`}
                    >
                      {category} <span className="opacity-65">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto]">
            <div
              className="relative grid min-h-0 place-items-center overflow-hidden overscroll-x-contain py-4 touch-pan-y [perspective:1600px] sm:py-6"
              onWheel={handleWheel}
              onTouchStart={(event) => {
                touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
              }}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={() => { touchStart.current = null; }}
            >
              <div className="relative h-[min(72svh,680px)] min-h-[480px] w-full max-w-[1240px] sm:h-[min(74vh,740px)] sm:min-h-[600px] xl:h-[min(78vh,800px)]">
              {visibleSlides.map(({ slide, index, offset, depth }) => {
                const direction = Math.sign(offset);

                return (
                  <motion.button
                    key={slide.id}
                    type="button"
                    aria-label={depth === 0 ? `Open details for ${slide.product.name} ${slide.variantName}` : `Show ${slide.product.name} ${slide.variantName}`}
                    className={`absolute inset-x-[10%] top-0 h-full overflow-hidden border border-white bg-white text-left shadow-[0_34px_96px_rgba(22,67,111,0.22)] outline-none focus-visible:ring-2 focus-visible:ring-[#16436f] sm:inset-x-[9%] lg:inset-x-[14%] ${depth === 0 ? "cursor-zoom-in" : "cursor-pointer"}`}
                    initial={reducedMotion ? false : { opacity: 1, y: 28, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      x: depth === 0 ? "0%" : `${direction * (42 + depth * 10)}%`,
                      y: depth === 0 ? 0 : 24 + depth * 16,
                      rotateY: depth === 0 ? 0 : direction * -28,
                      rotateZ: depth === 0 ? 0 : direction * 1.2,
                      scale: depth === 0 ? 1 : 0.8 - depth * 0.05
                    }}
                    transition={{ duration: reducedMotion ? 0 : 0.34, ease }}
                    onClick={() => {
                      if (Date.now() - lastSwipeAt.current > 500) {
                        if (depth === 0) {
                          setDetailSlide(slide);
                        } else {
                          goToSlide(index);
                        }
                      }
                    }}
                    style={{
                      borderRadius: "clamp(26px, 6vw, 84px)",
                      zIndex: depth === 0 ? 50 : 20 - depth,
                      willChange: "transform",
                      backfaceVisibility: "hidden"
                    }}
                  >
                    {slide.imageUrl ? (
                      <Image
                        src={slide.imageUrl}
                        alt={`${slide.product.name}, ${slide.variantName}`}
                        fill
                        sizes="(min-width: 1280px) 840px, (min-width: 768px) 78vw, 94vw"
                        className="object-cover"
                        draggable={false}
                        priority={depth === 0}
                        loading={depth === 0 ? "eager" : "lazy"}
                      />
                    ) : (
                      <span
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(135deg, ${slide.color}, rgba(255,255,255,0.42)), repeating-linear-gradient(90deg, rgba(22,67,111,0.12) 0 2px, transparent 2px 8px)`
                        }}
                      />
                    )}
                    {depth > 0 ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 left-0 w-[72%] bg-[#16436f]/[0.035]"
                          style={{
                            backdropFilter: "blur(6px)",
                            maskImage: "linear-gradient(90deg, black 0%, rgba(0,0,0,0.9) 18%, rgba(0,0,0,0.56) 52%, rgba(0,0,0,0.18) 78%, transparent 100%)",
                            WebkitBackdropFilter: "blur(6px)",
                            WebkitMaskImage: "linear-gradient(90deg, black 0%, rgba(0,0,0,0.9) 18%, rgba(0,0,0,0.56) 52%, rgba(0,0,0,0.18) 78%, transparent 100%)"
                          }}
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 right-0 w-[72%] bg-[#16436f]/[0.035]"
                          style={{
                            backdropFilter: "blur(6px)",
                            maskImage: "linear-gradient(270deg, black 0%, rgba(0,0,0,0.9) 18%, rgba(0,0,0,0.56) 52%, rgba(0,0,0,0.18) 78%, transparent 100%)",
                            WebkitBackdropFilter: "blur(6px)",
                            WebkitMaskImage: "linear-gradient(270deg, black 0%, rgba(0,0,0,0.9) 18%, rgba(0,0,0,0.56) 52%, rgba(0,0,0,0.18) 78%, transparent 100%)"
                          }}
                        />
                      </>
                    ) : null}
                  </motion.button>
                );
              })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pb-2 pt-3 sm:pb-3">
              <button
                type="button"
                aria-label="Previous product image"
                className="grid h-11 w-11 place-items-center border border-[#16436f]/25 bg-white/85 text-[#16436f] transition hover:bg-[#16436f] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#16436f]"
                onClick={() => stepSlide(-1)}
              >
                <ChevronLeft aria-hidden="true" size={20} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                aria-pressed={isPlaying}
                className="grid h-11 w-11 place-items-center border border-[#16436f]/25 bg-white/85 text-[#16436f] transition hover:bg-[#16436f] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#16436f]"
                onClick={() => setIsPlaying((playing) => !playing)}
              >
                {isPlaying ? <Pause aria-hidden="true" size={17} strokeWidth={2.6} /> : <Play aria-hidden="true" size={17} strokeWidth={2.6} />}
              </button>
              <button
                type="button"
                aria-label="Next product image"
                className="grid h-11 w-11 place-items-center border border-[#16436f]/25 bg-white/85 text-[#16436f] transition hover:bg-[#16436f] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#16436f]"
                onClick={() => stepSlide(1)}
              >
                <ChevronRight aria-hidden="true" size={20} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div className="grid gap-4 border-t border-[#16436f]/16 pt-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="grid min-w-0 gap-3">
              <div className="min-w-0">
                <p className="m-0 text-[0.68rem] font-black uppercase text-[#16436f]/70">
                  {activeProduct.category}
                </p>
                <h2 className="m-0 mt-1 break-words text-[clamp(2.5rem,11vw,7.8rem)] font-black uppercase leading-[0.78] text-[#16436f]">
                  {activeProduct.name}
                </h2>
                <p className="m-0 mt-2 text-sm font-black uppercase text-[#4d6d91]">
                  {[
                    activeSlide.variantName,
                    activeProduct.size,
                    activeProduct.weight,
                    activeProduct.gsm,
                    `${activeProduct.variants.length} colors`
                  ].filter(Boolean).join(" / ")}
                </p>
              </div>

              <div className="themed-scrollbar flex max-w-full snap-x gap-3 overflow-x-auto pb-2" aria-label="Choose featured product">
                {filteredProducts.map((product) => {
                  const thumb = product.variants[0]?.imageUrl ?? product.imageUrl;
                  const active = product.id === activeProduct.id;

                  return (
                    <button
                      aria-pressed={active}
                      aria-haspopup="dialog"
                      className={`grid min-h-[94px] w-[138px] shrink-0 snap-start grid-rows-[58px_minmax(0,1fr)] overflow-hidden border text-left transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#16436f] sm:min-h-[112px] sm:w-[170px] sm:grid-rows-[70px_minmax(0,1fr)] ${
                        active ? "border-[#16436f] bg-[#16436f] text-white" : "border-[#16436f]/16 bg-white/70 text-[#16436f] hover:border-[#16436f]"
                      }`}
                      key={product.id}
                      onClick={() => openProduct(product.id)}
                      type="button"
                    >
                      <span className="relative block bg-[#eef2f6]">
                        {thumb ? <img alt="" className="absolute inset-0 h-full w-full object-contain p-2" src={thumb} /> : null}
                      </span>
                      <span className="grid content-center px-3 py-2 text-[0.68rem] font-black uppercase leading-tight">
                        {product.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#16436f] bg-[#16436f] px-4 text-xs font-black uppercase text-white no-underline transition hover:bg-transparent hover:text-[#16436f] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#16436f]"
                href="#product-wall"
              >
                Product wall
                <ArrowDownRight aria-hidden="true" size={16} strokeWidth={2.5} />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center border border-[#16436f]/25 px-4 text-xs font-black uppercase text-[#16436f] no-underline transition hover:border-[#16436f] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#16436f]"
                href="/admin"
              >
                Manage products
              </Link>
            </div>
          </div>
        </div>
      </div>
      </section>

      {detailSlide ? createPortal(
        <div
          className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#16436f]/55 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={() => setDetailSlide(null)}
          role="presentation"
        >
          <motion.div
            aria-labelledby="product-detail-title"
            aria-modal="true"
            className="relative grid max-h-[94svh] w-full max-w-[1120px] overflow-y-auto border border-[#16436f]/20 bg-[#f4f6f8] shadow-[0_35px_120px_rgba(12,43,74,0.38)] lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]"
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.25, ease }}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close product details"
              className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center border border-[#16436f]/25 bg-white/90 text-[#16436f] shadow-sm transition hover:bg-[#16436f] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#16436f]"
              onClick={() => setDetailSlide(null)}
            >
              <X aria-hidden="true" size={20} strokeWidth={2.5} />
            </button>

            <div className="relative min-h-[320px] bg-[#e6ebf0] sm:min-h-[500px] lg:min-h-[680px]">
              {detailSlide.imageUrl ? (
                <Image
                  src={detailSlide.imageUrl}
                  alt={`${detailSlide.product.name}, ${detailSlide.variantName}`}
                  fill
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  className="object-cover"
                  draggable={false}
                />
              ) : (
                <span
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, ${detailSlide.color}, rgba(255,255,255,0.6))` }}
                />
              )}
            </div>

            <div className="grid content-start gap-6 p-5 pr-16 text-[#16436f] sm:p-8 sm:pr-20 lg:p-10 lg:pr-10 lg:pt-20">
              <div>
                <p className="m-0 text-xs font-black uppercase text-[#16436f]/65">
                  {detailSlide.product.category}{detailSlide.product.subcategory ? ` / ${detailSlide.product.subcategory}` : ""}
                </p>
                <h2 id="product-detail-title" className="m-0 mt-2 text-4xl font-black uppercase leading-[0.9] sm:text-5xl">
                  {detailSlide.product.name}
                </h2>
                <p className="m-0 mt-3 text-sm font-black uppercase text-[#4d6d91]">
                  {detailSlide.variantName}
                </p>
              </div>

              <p className="m-0 text-base font-medium leading-7 text-[#31597f]">
                {detailSlide.product.note}
              </p>

              <dl className="m-0 grid grid-cols-2 border-y border-[#16436f]/18">
                {[
                  ["Material", detailSlide.product.material],
                  ["Size", detailSlide.product.size],
                  ["Shape", detailSlide.product.shape],
                  ...(detailSlide.product.weight ? [["Weight", detailSlide.product.weight]] : []),
                  ...(detailSlide.product.gsm ? [["GSM", detailSlide.product.gsm]] : [])
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-r border-[#16436f]/12 px-3 py-4 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0">
                    <dt className="text-[0.65rem] font-black uppercase text-[#16436f]/55">{label}</dt>
                    <dd className="m-0 mt-1 text-sm font-bold">{value}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="m-0 text-[0.68rem] font-black uppercase text-[#16436f]/60">Available colors</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {detailVariants.map((variant) => (
                    <span key={variant.id} className="inline-flex items-center gap-2 text-xs font-bold uppercase">
                      <span
                        aria-hidden="true"
                        className="h-5 w-5 border border-[#16436f]/25 shadow-sm"
                        style={{ backgroundColor: variant.color }}
                      />
                      {variant.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
