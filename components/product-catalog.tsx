"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { X } from "lucide-react";
import {
  allProductSubcategoryFilter,
  getProductCategoryFilters,
  getProductSubcategoryFilters,
  productMatchesFilters,
  type ProductVariation
} from "@/lib/products";

const ease = [0.16, 1, 0.3, 1] as const;

function ProductPoster({
  product,
  index,
  selected,
  onSelect
}: {
  product: ProductVariation;
  index: number;
  selected: boolean;
  onSelect: (variantIndex: number) => void;
}) {
  const reducedMotion = useReducedMotion();
  const previewVariants = product.variants
    .map((variant, sourceIndex) => ({ ...variant, sourceIndex }))
    .filter((variant) => variant.imageUrl);
  const previews = previewVariants.length ? previewVariants : [{
    id: `${product.id}-primary`,
    name: "Primary design",
    color: product.color,
    imageUrl: product.imageUrl,
    sourceIndex: 0
  }];
  const [previewIndex, setPreviewIndex] = useState(0);
  const imageHovered = useRef(false);
  const activePreview = previews[previewIndex] ?? previews[0];
  const hoverPreview = previews[(previewIndex + 1) % previews.length] ?? activePreview;

  return (
    <motion.article
      layout
      className={`group/card grid min-w-0 grid-rows-[auto_1fr] overflow-hidden border bg-white/72 text-[#16436f] shadow-[0_18px_48px_rgba(22,67,111,0.07)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(22,67,111,0.14)] ${
        selected ? "border-[#16436f]" : "border-[#16436f]/14 hover:border-[#16436f]/48"
      }`}
      initial={reducedMotion ? false : { opacity: 0, y: 44, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reducedMotion ? 0 : 0.72, ease }}
      onClick={() => onSelect(imageHovered.current ? hoverPreview.sourceIndex : activePreview.sourceIndex)}
    >
      <button
        type="button"
        aria-label={`Open ${product.name} details`}
        className="group/image relative aspect-[4/5] touch-pan-y overflow-hidden border-b border-[#16436f]/14 bg-[#e9eef3] text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#16436f]"
        onMouseEnter={() => { imageHovered.current = true; }}
        onMouseLeave={() => { imageHovered.current = false; }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {activePreview?.imageUrl ? (
            <motion.img
              key={activePreview.id}
              src={activePreview.imageUrl}
              alt={`${product.name}, ${activePreview.name}`}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
              initial={reducedMotion ? false : { opacity: 0, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.32, ease }}
            />
          ) : (
            <motion.span key="empty" className="absolute inset-0 grid place-items-center px-6 text-center text-sm uppercase text-[#60738d]">
              Image coming soon
            </motion.span>
          )}
        </AnimatePresence>

        {previews.length > 1 && hoverPreview.imageUrl ? (
          <img
            src={hoverPreview.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full scale-[1.2] select-none object-cover [clip-path:polygon(0%_0%,0%_0%,0%_100%,0%_100%)] [filter:brightness(400%)_contrast(150%)] transition-[clip-path,filter,transform] duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover/image:scale-100 group-hover/image:[clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%)] group-hover/image:[filter:brightness(100%)_contrast(100%)]"
          />
        ) : null}

        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(22,67,111,0.02),transparent_54%,rgba(22,67,111,0.18))]" />

        <span className="pointer-events-none absolute left-3 top-3 max-w-[calc(100%-5rem)] truncate border border-[#16436f]/16 bg-white/82 px-2.5 py-1.5 text-[0.62rem] font-black uppercase text-[#16436f] backdrop-blur">
          {product.subcategory ? `${product.category} / ${product.subcategory}` : product.category}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 text-sm font-black text-[#16436f]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </button>

      <div className="grid content-between gap-5 p-4 sm:p-5">
        <div>
          <p className="m-0 text-[0.62rem] font-black uppercase text-[#60738d]">{activePreview?.name ?? "Primary design"}</p>
          <h3 className="m-0 mt-2 min-h-[3.4rem] break-words text-2xl font-black uppercase leading-[0.96] sm:text-[1.7rem]">
            {product.name}
          </h3>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#16436f]/14 pt-3 text-[0.66rem] font-black uppercase text-[#60738d]">
            <span>{product.size}</span>
            {product.weight ? <span>{product.weight}</span> : null}
            {product.gsm ? <span>{product.gsm}</span> : null}
            <span>{product.variants.length} colors</span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2" aria-label={`${product.name} image previews`}>
            {previews.slice(0, 7).map((preview, previewPosition) => (
              <button
                key={preview.id}
                type="button"
                aria-label={`Show ${product.name} ${preview.name}`}
                aria-pressed={previewPosition === previewIndex}
                title={preview.name}
                className={`relative h-10 w-10 shrink-0 overflow-hidden border bg-[#e9eef3] p-0 transition duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16436f] ${previewPosition === previewIndex ? "border-[#16436f] shadow-[0_0_0_2px_rgba(22,67,111,0.12)]" : "border-[#16436f]/18 opacity-72 hover:border-[#16436f]/65 hover:opacity-100"}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setPreviewIndex(previewPosition);
                }}
              >
                {preview.imageUrl ? <img src={preview.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} /> : null}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="shrink-0 text-[0.62rem] font-black uppercase text-[#16436f]/65 underline decoration-[#16436f]/25 underline-offset-4 transition hover:text-[#16436f] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#16436f]"
          >
            View details
          </button>
        </div>
      </div>
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
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#16436f]/54 px-4 py-5 backdrop-blur-md"
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
        className="relative grid max-h-[92svh] w-full max-w-7xl min-w-0 overflow-y-auto border border-[#16436f]/18 bg-[#f7f8fa] shadow-[0_44px_130px_rgba(22,67,111,0.26)] lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]"
        initial={reducedMotion ? false : { opacity: 0, y: 42, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: reducedMotion ? 0 : 0.42, ease }}
      >
        <button
          className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center border border-[#16436f]/25 bg-white/85 text-[#16436f] transition hover:bg-[#16436f] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#16436f]"
          type="button"
          aria-label="Close product details"
          onClick={onClose}
        >
          <X aria-hidden="true" size={20} strokeWidth={2.4} />
        </button>

        <div className="relative min-h-[420px] overflow-hidden border-b border-[#16436f]/16 bg-[#eef2f6] lg:min-h-[760px] lg:border-b-0 lg:border-r">
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
              <span className="absolute inset-0 grid place-items-center text-sm uppercase text-[#60738d]">
                Image coming soon
              </span>
            )}
          </AnimatePresence>
          <div className="absolute left-4 top-4 border border-[#16436f]/18 bg-white/80 px-3 py-1.5 text-[0.7rem] font-black uppercase text-[#16436f] backdrop-blur">
            {product.subcategory ? `${product.category} / ${product.subcategory}` : product.category}
          </div>
        </div>

        <div className="grid min-w-0 content-between gap-6 p-5 sm:p-7">
          <div className="grid gap-5">
            <div>
              <p className="m-0 mb-2 text-xs font-black uppercase text-[#37506f]">Product details</p>
              <h3 id="product-modal-title" className="m-0 break-words text-[clamp(2.6rem,6vw,6rem)] font-black uppercase leading-[0.84] text-[#16436f]">
                {product.name}
              </h3>
            </div>

            <p className="m-0 text-base leading-7 text-[#37506f]">{product.note}</p>

            <dl className="grid grid-cols-2 border-y border-[#16436f]/14 text-sm">
              {[
                ["Category", product.category],
                ...(product.subcategory ? [["Type", product.subcategory]] : []),
                ["Material", product.material],
                ["Size", product.size],
                ...(product.weight ? [["Weight", product.weight]] : []),
                ...(product.gsm ? [["GSM", product.gsm]] : [])
              ].map(([label, value]) => (
                <div key={label} className="border-b border-[#16436f]/10 px-3 py-4 even:border-l last:border-b-0 [&:nth-last-child(2)]:border-b-0">
                  <dt className="text-[0.65rem] font-black uppercase text-[#60738d]">{label}</dt>
                  <dd className="m-0 mt-1 font-bold text-[#16436f]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="m-0 mb-3 text-xs font-black uppercase text-[#37506f]">
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
                      ? "border-[#16436f] bg-[#16436f] text-white"
                      : "border-[#16436f]/18 text-[#16436f] hover:border-[#16436f]"
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
  const reducedMotion = useReducedMotion();
  const timelineRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [timelinePath, setTimelinePath] = useState<{
    d: string;
    width: number;
    height: number;
    nodes: { x: number; y: number }[];
  }>({ d: "", width: 0, height: 0, nodes: [] });
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.7"]
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.35 });
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
    const timeline = timelineRef.current;
    if (!timeline || !visibleProducts.length) {
      return;
    }

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = timeline.clientWidth;
        const height = timeline.clientHeight;
        const isNarrow = window.matchMedia("(max-width: 767px)").matches;
        const nodes = rowRefs.current.slice(0, visibleProducts.length).flatMap((row, index) => {
          if (!row) return [];
          return [{
            x: index % 2 === 0 ? width - (isNarrow ? 18 : width * 0.22) : (isNarrow ? 18 : width * 0.22),
            y: row.offsetTop + row.offsetHeight / 2
          }];
        });

        if (!nodes.length) return;

        let d = `M ${nodes[0].x} 0 L ${nodes[0].x} ${nodes[0].y}`;
        for (let index = 1; index < nodes.length; index += 1) {
          const previous = nodes[index - 1];
          const current = nodes[index];
          const middle = (previous.y + current.y) / 2;
          const bend = Math.min(90, (current.y - previous.y) / 6);
          d += ` L ${previous.x} ${middle - bend} C ${previous.x} ${middle} ${current.x} ${middle} ${current.x} ${middle + bend} L ${current.x} ${current.y}`;
        }
        d += ` L ${nodes[nodes.length - 1].x} ${height}`;
        setTimelinePath({ d, width, height, nodes });
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(timeline);
    rowRefs.current.slice(0, visibleProducts.length).forEach((row) => {
      if (row) observer.observe(row);
    });
    measure();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [visibleProducts]);

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

  const openProduct = (product: ProductVariation, selectedVariantIndex = 0) => {
    setModalProductId(product.id);
    setVariantIndex(selectedVariantIndex);
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
    <section id="product-wall" className="mt-10 min-w-0 scroll-mt-6 overflow-visible border-t border-[#16436f]/18 py-10 sm:mt-12 sm:py-16" aria-labelledby="catalog-heading">
      <div className="mb-7 grid gap-5 border-b border-[#16436f]/18 pb-7 lg:mb-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="m-0 mb-3 text-xs font-black uppercase text-[#37506f]">M.M Textile / Product wall</p>
          <motion.h2
            id="catalog-heading"
            className="m-0 max-w-5xl break-words text-5xl font-black uppercase leading-[0.88] text-[#16436f] sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.72, ease }}
          >
            Product collection
          </motion.h2>
        </div>
        <div className="flex items-end gap-3 text-[#16436f] lg:pb-1">
          <span className="text-4xl font-black leading-none">{String(visibleProducts.length).padStart(2, "0")}</span>
          <span className="pb-0.5 text-[0.68rem] font-black uppercase text-[#60738d]">Products shown</span>
        </div>
      </div>

      <div className="sticky top-0 z-40 mb-6 flex max-w-full gap-2 overflow-x-auto border-y border-[#16436f]/14 bg-[#f4f6f8]/92 py-2.5 backdrop-blur md:mb-8 md:py-3" aria-label="Filter products by category">
        {filters.map((filter) => {
          const count = filter === "All" ? products.length : products.filter((product) => product.category === filter).length;
          const active = activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              aria-pressed={active}
              onClick={() => selectFilter(filter)}
              className={`min-h-10 shrink-0 border px-3 text-[0.68rem] font-black uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16436f] md:min-h-11 md:px-4 md:text-xs ${
                active ? "border-[#16436f] bg-[#16436f] text-white" : "border-[#16436f]/25 text-[#16436f] hover:border-[#16436f]"
              }`}
            >
              {filter} <span className="ml-1 opacity-65">{count}</span>
            </button>
          );
        })}
      </div>

      {subcategories.length > 1 ? (
        <div className="-mt-3 mb-7 flex max-w-full gap-2 overflow-x-auto border-b border-[#16436f]/14 pb-3 md:-mt-4 md:mb-8" aria-label="Filter products by label">
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
                className={`min-h-9 shrink-0 border px-3 text-[0.62rem] font-black uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16436f] disabled:cursor-not-allowed disabled:opacity-40 md:min-h-10 md:px-4 md:text-[0.68rem] ${
                  active ? "border-[#16436f] bg-[#16436f] text-white" : "border-[#16436f]/20 text-[#16436f] hover:border-[#16436f] disabled:hover:border-[#16436f]/20"
                }`}
              >
                {subcategory} <span className="ml-1 opacity-65">{count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {visibleProducts.length ? (
        <div ref={timelineRef} className="relative min-w-0 border-x border-[#16436f]/10">
          {timelinePath.d ? (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox={`0 0 ${timelinePath.width} ${timelinePath.height}`}
              preserveAspectRatio="none"
            >
              <path d={timelinePath.d} fill="none" stroke="#16436f" strokeOpacity="0.16" strokeWidth="4" strokeLinecap="round" />
              <motion.path
                d={timelinePath.d}
                fill="none"
                stroke="#16436f"
                strokeWidth="4"
                strokeLinecap="round"
                style={{ pathLength: reducedMotion ? 1 : smoothProgress }}
              />
              {timelinePath.nodes.map((node, index) => (
                <circle key={`${visibleProducts[index]?.id}-${index}`} cx={node.x} cy={node.y} r="7" fill="#f4f6f8" stroke="#16436f" strokeWidth="3" />
              ))}
            </svg>
          ) : null}
          <AnimatePresence mode="popLayout">
            {visibleProducts.map((product, index) => (
              <div
                key={product.id}
                ref={(node) => { rowRefs.current[index] = node; }}
                className={`relative flex min-w-0 py-12 md:py-16 ${index % 2 === 0 ? "justify-start pr-14 md:pr-0" : "justify-end pl-14 md:pl-0"}`}
              >
                <div className="w-full max-w-[390px] md:w-[42%] md:max-w-[430px]">
                  <ProductPoster
                    product={product}
                    index={index}
                    selected={modalProductId === product.id}
                    onSelect={(selectedVariantIndex) => openProduct(product, selectedVariantIndex)}
                  />
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      ) : null}

      {!visibleProducts.length ? (
        <motion.div
          className="mt-3 grid min-h-64 place-items-center border border-[#16436f]/16 bg-white/55 px-6 text-center"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.4, ease }}
        >
          <div>
            <p className="m-0 text-xs font-black uppercase text-[#60738d]">{activeFilter}</p>
            <p className="m-0 mt-2 text-2xl font-black uppercase text-[#16436f]">Products coming soon</p>
          </div>
        </motion.div>
      ) : null}

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
