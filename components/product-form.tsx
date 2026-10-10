"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { saveProduct, type FormState } from "@/app/actions";
import { ProductVariantFields } from "@/components/product-variant-fields";
import type { LocalProductRow } from "@/lib/local-db";
import {
  normalizeProductCategory,
  normalizeProductSubcategory,
  primaryProductCategory,
  productCategories,
  productCategoryGroups
} from "@/lib/products";

const initialState: FormState = {
  message: "Ready to add a product."
};
const materialOptions = ["Cotton 100%", "Blended cotton"];

export function ProductForm({
  product,
  onSaved,
  onCancel
}: {
  product?: LocalProductRow | null;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(saveProduct, initialState);
  const isEditing = Boolean(product);
  const initialMaterial = product?.material ?? materialOptions[0];
  const initialMaterialChoice = materialOptions.includes(initialMaterial) ? initialMaterial : "__custom";
  const initialCategory = normalizeProductCategory(product?.category);
  const initialCategoryChoice = productCategories.includes(initialCategory) ? initialCategory : "__custom";
  const initialSubcategory = normalizeProductSubcategory(initialCategory, product?.subcategory);
  const [materialChoice, setMaterialChoice] = useState(initialMaterialChoice);
  const [categoryChoice, setCategoryChoice] = useState(initialCategoryChoice);
  const [subcategoryChoice, setSubcategoryChoice] = useState(() => {
    const group = productCategoryGroups.find((item) => item.name === initialCategory);

    if (!initialSubcategory) {
      return "";
    }

    return group?.subcategories.some((subcategory) => subcategory === initialSubcategory)
      ? initialSubcategory
      : "__custom";
  });
  const selectedCategoryGroup = useMemo(
    () => productCategoryGroups.find((group) => group.name === categoryChoice),
    [categoryChoice]
  );
  const hasConfiguredSubcategories = Boolean(selectedCategoryGroup?.subcategories.length);

  useEffect(() => {
    if (state.tone === "success") {
      formRef.current?.reset();
      setMaterialChoice(materialOptions[0]);
      setCategoryChoice(primaryProductCategory);
      setSubcategoryChoice("");
      onSaved?.();
    }
  }, [onSaved, state]);

  return (
    <form className="form-card scroll-mt-6" id="product-editor" ref={formRef} action={action}>
      <input name="productId" type="hidden" value={product?.id ?? ""} />

      <div className="card-header">
        <div>
          <h2 className="card-title">{isEditing ? "Edit product" : "Add product"}</h2>
          <p className="card-subtitle">
            {isEditing ? "Update the selected product and its color images." : "Create a product with up to 12 color images."}
          </p>
        </div>
        {isEditing ? (
          <button className="secondary-button" onClick={onCancel} type="button">
            New product
          </button>
        ) : null}
      </div>

      <div className="field-stack">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.45fr)]">
          <div className="field">
            <label htmlFor="name">Product name</label>
            <input
              defaultValue={product?.name ?? ""}
              id="name"
              name="name"
              type="text"
              placeholder="Classic Bath Towel"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              value={categoryChoice}
              onChange={(event) => {
                setCategoryChoice(event.target.value);
                setSubcategoryChoice("");
              }}
              id="category"
              name="category"
              required
            >
              {productCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
              <option value="__custom">Add new category</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {categoryChoice === "__custom" ? (
            <div className="field">
              <label htmlFor="customCategory">New category</label>
              <input
                defaultValue={initialCategoryChoice === "__custom" ? initialCategory : ""}
                id="customCategory"
                name="customCategory"
                placeholder="Spa Towel"
                required
                type="text"
              />
            </div>
          ) : null}

          {hasConfiguredSubcategories ? (
            <div className="field">
              <label htmlFor="subcategory">Category type</label>
              <select
                id="subcategory"
                name="subcategory"
                onChange={(event) => setSubcategoryChoice(event.target.value)}
                value={subcategoryChoice}
              >
                <option value="">No subtype</option>
                {selectedCategoryGroup?.subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
                <option value="__custom">Add new type</option>
              </select>
            </div>
          ) : (
            <div className="field">
              <label htmlFor="customSubcategory">Category type</label>
              <input
                defaultValue={!hasConfiguredSubcategories ? initialSubcategory : ""}
                id="customSubcategory"
                name="customSubcategory"
                placeholder="Optional"
                type="text"
              />
            </div>
          )}

          {subcategoryChoice === "__custom" ? (
            <div className="field">
              <label htmlFor="customSubcategory">New type</label>
              <input
                defaultValue={initialSubcategory && subcategoryChoice === "__custom" ? initialSubcategory : ""}
                id="customSubcategory"
                name="customSubcategory"
                placeholder="Waffle"
                required
                type="text"
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="field">
            <label htmlFor="material">Material</label>
            <select
              id="material"
              name="material"
              onChange={(event) => setMaterialChoice(event.target.value)}
              value={materialChoice}
            >
              <option value="Cotton 100%">Cotton 100%</option>
              <option value="Blended cotton">Blended cotton</option>
              <option value="__custom">Add future material</option>
            </select>
          </div>

          {materialChoice === "__custom" ? (
            <div className="field">
              <label htmlFor="customMaterial">Future material</label>
              <input
                defaultValue={initialMaterialChoice === "__custom" ? initialMaterial : ""}
                id="customMaterial"
                name="customMaterial"
                placeholder="Bamboo blend"
                required
                type="text"
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="field">
            <label htmlFor="size">Size</label>
            <input
              defaultValue={product?.size ?? ""}
              id="size"
              name="size"
              type="text"
              placeholder="70 x 140 cm"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="shape">Shape</label>
            <input
              defaultValue={product?.shape ?? "Rectangle"}
              id="shape"
              name="shape"
              type="text"
              placeholder="Rectangle"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="weight">Weight</label>
            <input
              defaultValue={product?.weight ?? ""}
              id="weight"
              name="weight"
              type="text"
              inputMode="decimal"
              placeholder="200 g"
            />
          </div>

          <div className="field">
            <label htmlFor="gsm">GSM</label>
            <input
              defaultValue={product?.gsm ?? ""}
              id="gsm"
              name="gsm"
              type="text"
              inputMode="decimal"
              placeholder="450"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="note">Product note</label>
          <textarea
            defaultValue={product?.note ?? ""}
            id="note"
            name="note"
            placeholder="Soft towel with a deep border weave."
            rows={4}
          />
        </div>

        <ProductVariantFields initialVariants={product?.variants ?? []} />
      </div>

      <button className="primary-button" type="submit" disabled={isPending}>
        {isPending ? "Saving..." : isEditing ? "Save product" : "Add product"}
      </button>

      <p className="status" data-tone={state.tone}>
        {state.message}
      </p>
    </form>
  );
}
