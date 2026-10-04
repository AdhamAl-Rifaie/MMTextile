"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import {
  allProductSubcategoryFilter,
  getProductCategoryFilters,
  getProductSubcategoryFilters,
  productMatchesFilters,
  type ProductVariation
} from "@/lib/products";

const ease = [0.16, 1, 0.3, 1] as const;
const productLayouts = [
  {
    tile: "col-span-4 -rotate-1 md:col-span-7 lg:col-span-7 lg:row-span-2 lg:-translate-y-4",
    image: "aspect-[4/5]",
    rotate: -1.1,
    title: "text-[clamp(1.35rem,8vw,2.4rem)] md:text-[clamp(2.3rem,4.8vw,5.9rem)]"
  },
  {
    tile: "col-span-3 translate-y-8 rotate-[1.2deg] md:col-span-5 lg:col-span-5 lg:translate-y-12",
    image: "aspect-[5/4]",
    rotate: 1.3,
    title: "text-[clamp(1.05rem,6.4vw,1.85rem)] md:text-[clamp(1.9rem,3.1vw,3.7rem)]"
  },
  {
    tile: "col-span-3 -translate-y-1 rotate-[0.8deg] md:col-span-4 lg:col-span-4 lg:-translate-y-2",
    image: "aspect-square",
    rotate: 0.8,
    title: "text-[clamp(1rem,6vw,1.65rem)] md:text-[clamp(1.75rem,2.7vw,3rem)]"
  },
  {
    tile: "col-span-5 translate-y-4 -rotate-[0.8deg] md:col-span-8 lg:col-span-8 lg:translate-y-7",
    image: "aspect-[16/10]",
    rotate: -0.8,
    title: "text-[clamp(1.35rem,7.5vw,2.25rem)] md:text-[clamp(2.1rem,4vw,5rem)]"
  },
  {
    tile: "col-span-3 -translate-y-5 rotate-[1.1deg] md:col-span-6 lg:col-span-5 lg:-translate-y-10",
    image: "aspect-[3/4]",
    rotate: 1.1,
    title: "text-[clamp(1rem,6.2vw,1.7rem)] md:text-[clamp(1.8rem,3vw,3.4rem)]"
  },
  {
    tile: "col-span-3 translate-y-3 -rotate-[1.4deg] md:col-span-6 lg:col-span-7 lg:translate-y-4",
    image: "aspect-[6/4]",
    rotate: -1.4,
    title: "text-[clamp(1.05rem,6.3vw,1.85rem)] md:text-[clamp(2rem,3.8vw,4.6rem)]"
  }
];

function ProductPoster({
  product,
  index,
  selected,
  onSelect
}: {
  product: ProductVariation;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const layout = productLayouts[index % productLayouts.length];
  const imageUrl = product.variants[0]?.imageUrl ?? product.imageUrl;

  return (
    <motion.article
      layout
      className={`min-w-0 ${layout.tile}`}
      initial={reducedMotion ? false : { opacity: 0, y: 78, rotate: layout.rotate * 1.6 }}
      whileInView={{ opacity: 1, y: 0, rotate: layout.rotate }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : (index % 4) * 0.07, ease }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Open ${product.name} details`}
        aria-pressed={selected}
        className={`group grid w-full min-w-0 gap-2 text-left outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-[#f1c85b] md:gap-3 ${
          selected ? "text-[#f1c85b]" : "text-white hover:text-[#f1c85b]"
        }`}
      >
        <div
          className={`relative overflow-hidden border bg-[#080806] transition duration-300 ${
            selected ? "border-[#f1c85b]" : "border-white/15 group-hover:border-[#f1c85b]/65"
          } ${layout.image}`}
        >
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain p-1.5 sm:p-3 md:p-4"
              whileHover={reducedMotion ? undefined : { scale: 1.04, y: -7 }}
              transition={{ duration: reducedMotion ? 0 : 0.6, ease }}
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center px-6 text-center text-sm uppercase text-[#b8aa8a]">
              Image coming soon
            </span>
          )}

          <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate border border-[#f1c85b]/45 bg-black/75 px-1.5 py-1 text-[0.52rem] font-black uppercase text-[#f1c85b] backdrop-blur md:left-3 md:top-3 md:px-2.5 md:text-[0.65rem]">
            {product.subcategory ? `${product.category} / ${product.subcategory}` : product.category}
          </span>
          <span className="absolute bottom-2 right-2 text-[clamp(1.45rem,9vw,3rem)] font-black leading-none text-[#f1c85b] opacity-80 [font-family:var(--font-display)] md:bottom-3 md:right-3 md:text-[clamp(2.1rem,5vw,5rem)]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="grid gap-1.5 border-t border-current/40 pt-2 md:gap-2 md:pt-3">
          <h3 className={`m-0 break-words pb-1 font-black uppercase leading-[0.98] md:leading-[0.85] ${layout.title}`}>
            {product.name}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.56rem] font-black uppercase text-[#b8aa8a] md:gap-x-4 md:gap-y-1 md:text-[0.7rem]">
            <span>{product.size}</span>
            <span>{product.weight}</span>
            <span>{product.variants.length} colors</span>
          </div>
        </div>
      </button>
    </motion.article>
  );
}

function ProductModal({
  product,
  variantIndex,
  setVariantIndex,
  onClose
}: {
  product: ProductVariation;
  variantIndex: number;
  setVariantIndex: (index: number) => void;
  onClose: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const selectedVariant = product.variants[variantIndex] ?? product.variants[0];
  const selectedImage = selectedVariant?.imageUrl ?? product.imageUrl;

  useEffect(() => {
    modalRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/82 px-4 py-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      tabIndex={-1}
      ref={modalRef}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="relative grid max-h-[92svh] w-full max-w-7xl min-w-0 overflow-y-auto border border-[#f1c85b]/45 bg-[#050505] shadow-[0_44px_130px_rgba(0,0,0,0.58)] lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]"
        initial={reducedMotion ? false : { opacity: 0, y: 42, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: reducedMotion ? 0 : 0.42, ease }}
      >
        <button
          className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center border border-[#f1c85b]/55 bg-black/80 text-[#f1c85b] transition hover:bg-[#f1c85b] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#f1c85b]"
          type="button"
          aria-label="Close product details"
          onClick={onClose}
        >
          <X aria-hidden="true" size={20} strokeWidth={2.4} />
        </button>

        <div className="relative min-h-[420px] overflow-hidden border-b border-[#f1c85b]/25 bg-[#090807] lg:min-h-[760px] lg:border-b-0 lg:border-r">
          <AnimatePresence mode="wait" initial={false}>
            {selectedImage ? (
              <motion.img
                key={selectedImage}
                src={selectedImage}
                alt={`${product.name}, ${selectedVariant?.name ?? "primary design"}`}
                className="absolute inset-0 h-full w-full object-contain p-2 sm:p-4"
                initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: reducedMotion ? 0 : 0.4, ease }}
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-sm uppercase text-[#b8aa8a]">
                Image coming soon
              </span>
            )}
          </AnimatePresence>
          <div className="absolute left-4 top-4 border border-[#f1c85b]/50 bg-black/75 px-3 py-1.5 text-[0.7rem] font-black uppercase text-[#f1c85b] backdrop-blur">
            {product.subcategory ? `${product.category} / ${product.subcategory}` : product.category}
          </div>
        </div>

        <div className="grid min-w-0 content-between gap-6 p-5 sm:p-7">
          <div className="grid gap-5">
            <div>
              <p className="m-0 mb-2 text-xs font-black uppercase text-[#f1c85b]">Product details</p>
              <h3 id="product-modal-title" className="m-0 break-words text-[clamp(2.6rem,6vw,6rem)] font-black uppercase leading-[0.84] text-white">
                {product.name}
              </h3>
            </div>

            <p className="m-0 text-base leading-7 text-[#c6c1b5]">{product.note}</p>

            <dl className="grid grid-cols-2 border-y border-white/15 text-sm">
              {[
                ["Category", product.category],
                ...(product.subcategory ? [["Type", product.subcategory]] : []),
                ["Material", product.material],
                ["Size", product.size],
                ["Weight", product.weight]
              ].map(([label, value]) => (
                <div key={label} className="border-b border-white/10 px-3 py-4 even:border-l last:border-b-0 [&:nth-last-child(2)]:border-b-0">
                  <dt className="text-[0.65rem] font-black uppercase text-[#b8aa8a]">{label}</dt>
                  <dd className="m-0 mt-1 font-bold text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="m-0 mb-3 text-xs font-black uppercase text-[#f1c85b]">
              Available designs
            </p>
            <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label={`${product.name} designs`}>
              {product.variants.map((variant, index) => (
                <button
                  key={variant.id}
                  type="button"
                  aria-pressed={variantIndex === index}
                  onClick={() => setVariantIndex(index)}
                  className={`grid min-h-20 grid-cols-[58px_minmax(0,1fr)] items-center gap-3 border px-3 text-left text-xs font-black uppercase transition-colors ${
                    variantIndex === index
                      ? "border-[#f1c85b] bg-[#f1c85b] text-black"
                      : "border-white/25 text-white hover:border-[#f1c85b]"
                  }`}
                >
                  <span
                    className="h-14 w-14 rounded-full border border-current bg-cover bg-center"
                    style={{ backgroundColor: variant.color, backgroundImage: variant.imageUrl ? `url(${variant.imageUrl})` : undefined }}
                  />
                  <span className="min-w-0 truncate">{variant.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProductCatalog({ products }: { products: ProductVariation[] }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSubcategory, setActiveSubcategory] = useState(allProductSubcategoryFilter);
  const [modalProductId, setModalProductId] = useState<string | null>(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const filters = useMemo(() => getProductCategoryFilters(products), [products]);
  const subcategories = useMemo(
    () => getProductSubcategoryFilters(products, activeFilter),
    [activeFilter, products]
  );
  const visibleProducts = useMemo(
    () => products.filter((product) => productMatchesFilters(product, activeFilter, activeSubcategory)),
    [activeFilter, activeSubcategory, products]
  );
  const modalProduct = visibleProducts.find((product) => product.id === modalProductId) ?? products.find((product) => product.id === modalProductId);

  useEffect(() => {
    if (!modalProductId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalProductId(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalProductId]);

  const openProduct = (product: ProductVariation) => {
    setModalProductId(product.id);
    setVariantIndex(0);
  };

  const selectFilter = (filter: string) => {
    setActiveFilter(filter);
    setActiveSubcategory(allProductSubcategoryFilter);
    setModalProductId(null);
    setVariantIndex(0);
  };

  const selectSubcategory = (subcategory: string) => {
    setActiveSubcategory(subcategory);
    setModalProductId(null);
    setVariantIndex(0);
  };

  return (
    <section id="product-wall" className="mt-10 min-w-0 scroll-mt-6 overflow-visible border-t border-[#f1c85b]/50 py-10 sm:mt-12 sm:py-16" aria-labelledby="catalog-heading">
      <div className="mb-6 grid gap-4 lg:mb-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.32fr)] lg:items-end">
        <div className="min-w-0">
          <p className="m-0 mb-3 text-xs font-black uppercase text-[#f1c85b]">M.M Textile / Product wall</p>
          <motion.h2
            id="catalog-heading"
            className="m-0 max-w-6xl break-words text-[clamp(2.8rem,16vw,6rem)] font-black uppercase leading-[0.78] text-white md:text-[clamp(3.5rem,10vw,12rem)]"
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.72, ease }}
          >
            Towel<br />index
          </motion.h2>
        </div>
        <p className="m-0 max-w-sm text-sm leading-6 text-[#b8aa8a]">
          Filter the collection, then tap any product to open its image, material details, and color variants in one focused view.
        </p>
      </div>

      <div className="sticky top-0 z-40 mb-6 flex max-w-full gap-2 overflow-x-auto border-y border-[#f1c85b]/30 bg-[#050505]/92 py-2.5 backdrop-blur md:mb-8 md:py-3" aria-label="Filter products by category">
        {filters.map((filter) => {
          const count = filter === "All" ? products.length : products.filter((product) => product.category === filter).length;
          const active = activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              aria-pressed={active}
              onClick={() => selectFilter(filter)}
              className={`min-h-10 shrink-0 border px-3 text-[0.68rem] font-black uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f1c85b] md:min-h-11 md:px-4 md:text-xs ${
                active ? "border-[#f1c85b] bg-[#f1c85b] text-black" : "border-[#f1c85b]/35 text-[#f1c85b] hover:border-[#f1c85b]"
              }`}
            >
              {filter} <span className="ml-1 opacity-65">{count}</span>
            </button>
          );
        })}
      </div>

      {subcategories.length > 1 ? (
        <div className="-mt-3 mb-7 flex max-w-full gap-2 overflow-x-auto border-b border-white/15 pb-3 md:-mt-4 md:mb-8" aria-label="Filter products by label">
          {subcategories.map((subcategory) => {
            const count = products.filter((product) => productMatchesFilters(product, activeFilter, subcategory)).length;
            const active = activeSubcategory === subcategory;
            const disabled = count === 0 && subcategory !== allProductSubcategoryFilter;

            return (
              <button
                key={subcategory}
                type="button"
                aria-pressed={active}
                disabled={disabled}
                onClick={() => selectSubcategory(subcategory)}
                className={`min-h-9 shrink-0 border px-3 text-[0.62rem] font-black uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f1c85b] disabled:cursor-not-allowed disabled:opacity-40 md:min-h-10 md:px-4 md:text-[0.68rem] ${
                  active ? "border-white bg-white text-black" : "border-white/25 text-white hover:border-white disabled:hover:border-white/25"
                }`}
              >
                {subcategory} <span className="ml-1 opacity-65">{count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <motion.div layout className="grid min-w-0 grid-cols-6 items-start gap-x-3 gap-y-10 pt-3 sm:grid-cols-12 sm:gap-x-4 md:gap-x-5 md:gap-y-11 md:pt-4 lg:gap-y-14">
        <AnimatePresence mode="popLayout">
          {visibleProducts.map((product, index) => (
            <ProductPoster
              key={product.id}
              product={product}
              index={index}
              selected={modalProductId === product.id}
              onSelect={() => openProduct(product)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {modalProduct ? (
          <ProductModal
            product={modalProduct}
            variantIndex={variantIndex}
            setVariantIndex={setVariantIndex}
            onClose={() => setModalProductId(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
