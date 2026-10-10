"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import type { ProductColorVariant } from "@/lib/products";

const maxVariants = 12;

type EditableVariant = Partial<ProductColorVariant>;

export function ProductVariantFields({
  initialVariants = []
}: {
  initialVariants?: EditableVariant[];
}) {
  const [variants, setVariants] = useState<EditableVariant[]>(
    initialVariants.length ? initialVariants.slice(0, maxVariants) : [{}]
  );
  const previewUrlsRef = useRef<Record<number, string>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<number, string>>({});
  const [imageNames, setImageNames] = useState<Record<number, string>>({});

  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  const addVariant = () => {
    setVariants((currentVariants) =>
      currentVariants.length >= maxVariants ? currentVariants : [...currentVariants, {}]
    );
  };

  const removeVariant = (index: number) => {
    setVariants((currentVariants) => {
      if (currentVariants.length === 1) {
        return currentVariants;
      }

      return currentVariants.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleImageChange = (slot: number, fileList: FileList | null) => {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    setImagePreviews((currentPreviews) => {
      const existingPreview = currentPreviews[slot];

      if (existingPreview) {
        URL.revokeObjectURL(existingPreview);
      }

      const nextPreview = URL.createObjectURL(file);
      previewUrlsRef.current[slot] = nextPreview;

      return {
        ...currentPreviews,
        [slot]: nextPreview
      };
    });

    setImageNames((currentNames) => ({
      ...currentNames,
      [slot]: file.name
    }));
  };

  return (
    <div className="grid gap-4 border-t border-[#16436f]/16 pt-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-[0.78rem] font-black uppercase text-[#16436f]">
            Color variants
          </p>
          <p className="m-0 mt-1 max-w-xl text-sm leading-5 text-[#60738d]">
            Add each towel color and its image in a consistent visual record.
          </p>
        </div>
        <button
          className="secondary-button inline-flex min-h-10 items-center gap-2 px-3 py-2 text-[0.72rem] uppercase"
          disabled={variants.length >= maxVariants}
          onClick={addVariant}
          type="button"
        >
          <Plus aria-hidden="true" size={16} strokeWidth={2.4} />
          Add color
        </button>
      </div>

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {variants.map((variant, index) => {
          const slot = index + 1;
          const previewUrl = imagePreviews[slot] ?? variant.imageUrl;
          const hasSelectedImage = Boolean(imagePreviews[slot]);
          return (
            <div
              className="group relative grid content-start gap-3 overflow-hidden border border-[#16436f]/16 bg-[#f7f8fa] p-3 shadow-[0_18px_44px_rgba(22,67,111,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#16436f]/45 hover:shadow-[0_24px_58px_rgba(22,67,111,0.13)]"
              key={`${variant.id ?? "new"}-${index}`}
            >
              <input name={`variantId${slot}`} type="hidden" value={variant.id ?? ""} />
              <input name={`variantImageUrl${slot}`} type="hidden" value={variant.imageUrl ?? ""} />

              <div className="flex items-center justify-between gap-3 border-b border-[#16436f]/12 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[1.6rem] font-black leading-none text-[#16436f] [font-family:var(--font-brand)]">
                    {String(slot).padStart(2, "0")}
                  </span>
                  <p className="m-0 text-[0.7rem] font-black uppercase text-[#16436f]">
                    Variant field
                  </p>
                </div>
                {variants.length > 1 ? (
                  <button
                    aria-label={`Remove variant ${slot}`}
                    className="grid h-9 w-9 place-items-center border border-[#c84c45]/45 text-[#a83b35] transition hover:bg-[#c84c45] hover:text-white"
                    onClick={() => removeVariant(index)}
                    title={`Remove variant ${slot}`}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={16} strokeWidth={2.2} />
                  </button>
                ) : null}
              </div>

              <div className="grid gap-3">
                <div className="relative aspect-[4/3] overflow-hidden border border-[#16436f]/12 bg-[#e9eef3]">
                  {previewUrl ? (
                    <img
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      src={previewUrl}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,rgba(22,67,111,0.1),transparent_52%),linear-gradient(45deg,#f7f8fa,#e6ebf0)] text-[#16436f]">
                      <ImagePlus aria-hidden="true" size={34} strokeWidth={1.8} />
                    </div>
                  )}

                  <label
                    className="absolute bottom-3 right-3 inline-grid h-12 w-12 cursor-pointer place-items-center border border-[#16436f]/30 bg-white/88 text-[#16436f] backdrop-blur transition hover:bg-[#16436f] hover:text-white"
                    htmlFor={`variantImage${slot}`}
                    title={variant.imageUrl ? "Replace image" : "Add image"}
                  >
                    <ImagePlus aria-hidden="true" size={20} strokeWidth={2.2} />
                  </label>
                  <input
                    accept="image/*"
                    className="sr-only"
                    id={`variantImage${slot}`}
                    name={`variantImage${slot}`}
                    onChange={(event) => handleImageChange(slot, event.currentTarget.files)}
                    type="file"
                  />
                </div>

                <div className="grid content-between gap-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="field">
                      <label htmlFor={`variantName${slot}`}>Color name</label>
                      <input
                        defaultValue={variant.name ?? ""}
                        id={`variantName${slot}`}
                        name={`variantName${slot}`}
                        placeholder={slot === 1 ? "Champagne" : "Optional color name"}
                        type="text"
                      />
                    </div>

                    <div className="field">
                      <label htmlFor={`variantColor${slot}`}>Color value</label>
                      <div className="flex items-stretch gap-2">
                        <input
                          defaultValue={variant.color ?? ""}
                          id={`variantColor${slot}`}
                          name={`variantColor${slot}`}
                          placeholder={slot === 1 ? "Optional hex" : "#efe6d1"}
                          type="text"
                        />
                        <span
                          aria-hidden="true"
                          className="mt-auto h-12 w-12 shrink-0 border border-[#16436f]/14"
                          style={{ backgroundColor: variant.color || "#d7ad47" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-t border-[#16436f]/10 pt-3">
                    <p className="m-0 max-w-[240px] truncate text-[0.68rem] font-bold uppercase text-[#60738d]">
                      {hasSelectedImage ? `Image added: ${imageNames[slot]}` : previewUrl ? "Saved image ready" : "No image yet"}
                    </p>
                    {previewUrl ? (
                      <span className="border border-[#16436f]/22 bg-[#eef2f6] px-2.5 py-1 text-[0.66rem] font-black uppercase text-[#16436f]">
                        Visual set
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="m-0 text-[0.78rem] leading-5 text-[#60738d]">
        {variants.length}/{maxVariants} colors. Each uploaded image is optimized before it is saved.
      </p>
    </div>
  );
}
