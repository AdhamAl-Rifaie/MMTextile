"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, Layers3 } from "lucide-react";
import {
  fallbackProducts,
  getProductCategoryFilters,
  type ProductVariation
} from "@/lib/products";

const ease = [0.16, 1, 0.3, 1] as const;

export function ProductShowcase({ products = fallbackProducts }: { products?: ProductVariation[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const categories = useMemo(() => getProductCategoryFilters(products), [products]);
  const filteredProducts = useMemo(
    () => activeCategory === "All" ? products : products.filter((product) => product.category === activeCategory),
    [activeCategory, products]
  );
  const activeProduct = filteredProducts[activeIndex] ?? filteredProducts[0] ?? products[0];
  const activeVariant = activeProduct?.variants[activeVariantIndex] ?? activeProduct?.variants[0];
  const imageUrl = activeVariant?.imageUrl ?? activeProduct?.imageUrl;
  const color = activeVariant?.color ?? activeProduct?.color ?? "#d7ad47";
  const hasUploadedImage = Boolean(imageUrl);

  const selectCategory = (category: string) => {
    setActiveCategory(category);
    setActiveIndex(0);
    setActiveVariantIndex(0);
  };

  const selectProduct = (index: number) => {
    setActiveIndex(index);
    setActiveVariantIndex(0);
  };

  if (!activeProduct) {
    return null;
  }

  return (
    <section className="relative mt-10 min-w-0 overflow-hidden border-y border-[#f1c85b]/40 py-6 sm:mt-12 sm:py-8" aria-label="Featured towel products">
      <div className="absolute inset-x-0 top-0 h-px bg-[#f1c85b]" />

      <div className="grid min-w-0 gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] xl:items-stretch">
        <div className="relative min-h-[440px] overflow-hidden border border-[#f1c85b]/25 bg-[#080806] shadow-[0_42px_140px_rgba(0,0,0,0.42)] sm:min-h-[560px] xl:min-h-[620px]">
          <div className="pointer-events-none absolute -left-6 -top-5 text-[clamp(7rem,22vw,20rem)] font-black leading-none text-[#f1c85b]/10">
            {String(activeIndex + 1).padStart(2, "0")}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_26%,rgba(241,200,91,0.18),transparent_24rem),linear-gradient(145deg,rgba(241,200,91,0.09),transparent_52%)]" />

          <div className="relative z-10 grid h-full min-h-[440px] grid-rows-[auto_minmax(0,1fr)_auto] p-3 sm:min-h-[560px] sm:p-6 xl:min-h-[620px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 border border-[#f1c85b]/40 bg-black/50 px-3 py-2 text-[0.68rem] font-black uppercase text-[#f1c85b] backdrop-blur">
                <Layers3 aria-hidden="true" size={15} strokeWidth={2.4} />
                Product stage
              </div>
            </div>

            <div className="relative grid min-h-0 place-items-center py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeProduct.id}-${activeVariant?.id ?? color}`}
                  className="relative grid h-full min-h-[300px] w-full place-items-center sm:min-h-[420px]"
                  initial={{ opacity: 0, y: 28, rotate: -1.2, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -24, rotate: 1.2, scale: 0.98 }}
                  transition={{ duration: 0.48, ease }}
                >
                  {!hasUploadedImage ? <div className="absolute inset-12 rounded-full bg-[#f1c85b]/16 blur-3xl" /> : null}
                  <motion.div
                    className={
                      hasUploadedImage
                        ? "relative h-[min(48svh,430px)] min-h-[280px] w-full max-w-[760px] overflow-hidden border border-[#f1c85b]/18 bg-black/10 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:h-[min(60vh,560px)] sm:min-h-[390px] sm:p-3"
                        : `${activeProduct.aspect} relative w-[min(78vw,500px)] overflow-hidden border border-white/15 shadow-[0_28px_80px_rgba(0,0,0,0.55)] sm:w-[min(84vw,640px)]`
                    }
                    animate={{ scale: hasUploadedImage ? 1 : activeProduct.scale }}
                    transition={{ duration: 0.45, ease }}
                    style={{
                      borderRadius: hasUploadedImage ? "10px" : activeProduct.radius,
                      background: hasUploadedImage
                        ? "transparent"
                        : `linear-gradient(135deg, ${color}, rgba(255,255,255,0.12)), repeating-linear-gradient(90deg, rgba(255,255,255,0.16) 0 2px, transparent 2px 8px)`
                    }}
                  >
                    {imageUrl ? (
                      <img
                        alt=""
                        className={hasUploadedImage ? "h-full w-full object-contain" : "absolute inset-0 h-full w-full object-contain"}
                        src={imageUrl}
                      />
                    ) : null}
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-4 right-3 z-20 grid justify-items-end gap-2 sm:bottom-6 sm:right-6">
                <span className="border border-[#f1c85b]/35 bg-black/60 px-2.5 py-1 text-[0.62rem] font-black uppercase text-[#f1c85b] backdrop-blur">
                  Variants
                </span>
                <div className="flex max-w-[min(72vw,360px)] flex-wrap justify-end gap-2.5">
                  {activeProduct.variants.map((variant, variantIndex) => (
                    <button
                      aria-label={`${activeProduct.name} ${variant.name}`}
                      className="h-11 w-11 border border-[#f1c85b]/65 bg-cover bg-center shadow-[0_12px_32px_rgba(0,0,0,0.42)] transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f1c85b] sm:h-16 sm:w-16"
                      key={variant.id}
                      onClick={() => setActiveVariantIndex(variantIndex)}
                      style={{
                        backgroundColor: variant.color,
                        backgroundImage: variant.imageUrl ? `url(${variant.imageUrl})` : undefined,
                        outline: activeVariantIndex === variantIndex ? "3px solid #f1c85b" : "none",
                        outlineOffset: "3px"
                      }}
                      title={variant.name}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-[#f1c85b]/30 pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <p className="m-0 text-[0.68rem] font-black uppercase text-[#f1c85b]">
                  {activeProduct.category}
                </p>
                <p className="m-0 mt-1 truncate text-sm font-bold text-[#f7f0de]">
                  {activeVariant?.name ?? "Primary design"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[0.62rem] font-black uppercase text-[#b8aa8a] sm:text-[0.68rem]">
                <span>{activeProduct.size}</span>
                <span>{activeProduct.weight}</span>
                <span>{activeProduct.variants.length} colors</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 content-between gap-7">
          <div className="grid gap-5">
            <div className="flex flex-wrap gap-2" aria-label="Showcase categories">
              {categories.map((category) => {
                const count = category === "All" ? products.length : products.filter((product) => product.category === category).length;
                const active = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={active}
                    onClick={() => selectCategory(category)}
                    className={`min-h-9 border px-2.5 text-[0.62rem] font-black uppercase transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f1c85b] sm:min-h-10 sm:px-3 sm:text-[0.7rem] ${
                      active ? "border-[#f1c85b] bg-[#f1c85b] text-black" : "border-[#f1c85b]/35 text-[#f1c85b] hover:border-[#f1c85b]"
                    }`}
                  >
                    {category} <span className="opacity-65">{count}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <p className="m-0 mb-2 text-xs font-black uppercase text-[#f1c85b]">Featured towel</p>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={activeProduct.id}
                  className="m-0 max-w-5xl break-words text-[clamp(2.35rem,14vw,5rem)] font-black uppercase leading-[0.78] text-[#f1c85b] sm:text-[clamp(3rem,8.4vw,8.8rem)]"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease }}
                >
                  {activeProduct.name}
                </motion.h2>
              </AnimatePresence>
            </div>

            <p className="m-0 max-w-2xl text-base font-medium leading-7 text-[#d8c996]">
              {activeProduct.note}
            </p>

            <dl className="grid grid-cols-3 border-y border-white/15 text-xs sm:text-sm">
              {[
                ...(activeProduct.subcategory ? [["Type", activeProduct.subcategory]] : []),
                ["Material", activeProduct.material],
                ["Size", activeProduct.size],
                ["Weight", activeProduct.weight]
              ].slice(0, 3).map(([label, value]) => (
                <div key={label} className="border-r border-white/10 px-3 py-3 last:border-r-0">
                  <dt className="text-[0.62rem] font-black uppercase text-[#b8aa8a]">{label}</dt>
                  <dd className="m-0 mt-1 font-bold text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-4">
            <div className="themed-scrollbar flex max-w-full snap-x gap-3 overflow-x-auto pb-2" aria-label="Choose featured product">
              {filteredProducts.map((product, index) => {
                const thumb = product.variants[0]?.imageUrl ?? product.imageUrl;
                const active = activeIndex === index;

                return (
                  <button
                    aria-pressed={active}
                    className={`grid min-h-[112px] w-[148px] shrink-0 snap-start grid-rows-[66px_minmax(0,1fr)] overflow-hidden border text-left transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#f1c85b] sm:min-h-[128px] sm:w-[176px] sm:grid-rows-[76px_minmax(0,1fr)] ${
                      active ? "border-[#f1c85b] bg-[#f1c85b] text-black" : "border-[#f1c85b]/25 bg-black/20 text-[#f1c85b] hover:border-[#f1c85b]"
                    }`}
                    key={product.id}
                    onClick={() => selectProduct(index)}
                    type="button"
                  >
                    <span className="relative block bg-[#090807]">
                      {thumb ? <img alt="" className="absolute inset-0 h-full w-full object-contain p-2" src={thumb} /> : null}
                      <span className="absolute left-2 top-2 text-[0.65rem] font-black">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                    <span className="grid content-center px-3 py-2 text-[0.72rem] font-black uppercase leading-tight">
                      {product.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#f1c85b] bg-[#f1c85b] px-4 text-xs font-black uppercase text-black no-underline transition hover:bg-transparent hover:text-[#f1c85b] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#f1c85b]"
                href="#product-wall"
              >
                Product wall
                <ArrowDownRight aria-hidden="true" size={16} strokeWidth={2.5} />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center border border-[#f1c85b]/35 px-4 text-xs font-black uppercase text-[#f1c85b] no-underline transition hover:border-[#f1c85b] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#f1c85b]"
                href="/admin"
              >
                Manage products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
