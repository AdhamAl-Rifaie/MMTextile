"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductById } from "@/app/actions";
import { ProductForm } from "@/components/product-form";
import type { LocalProductRow } from "@/lib/local-db";
import {
  formatProductGsm,
  formatProductWeight,
  primaryProductCategory,
  productCategoryGroups
} from "@/lib/products";

export function ProductAdminWorkspace({ products }: { products: LocalProductRow[] }) {
  const [selectedProduct, setSelectedProduct] = useState<LocalProductRow | null>(null);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<LocalProductRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const configuredCategoryNames = new Set<string>(productCategoryGroups.map((group) => group.name));
  const configuredTaxonomy = productCategoryGroups.map((group) => {
    const categoryProducts = products.filter((product) => product.category === group.name);
    const productSubcategories = categoryProducts.map((product) => product.subcategory).filter(Boolean) as string[];
    const subcategories = [...new Set([...group.subcategories, ...productSubcategories])];
    const imageCount = categoryProducts.reduce(
      (total, product) => total + (product.image_url ? 1 : 0) + (product.variants?.filter((variant) => variant.imageUrl).length ?? 0),
      0
    );

    return { name: group.name, subcategories, productCount: categoryProducts.length, imageCount };
  });
  const customTaxonomy = [...new Set(products
    .map((product) => product.category)
    .filter((category): category is string => Boolean(category) && !configuredCategoryNames.has(category as string)))]
    .map((category) => {
      const categoryProducts = products.filter((product) => product.category === category);
      const subcategories = [...new Set(categoryProducts.map((product) => product.subcategory).filter(Boolean) as string[])];
      const imageCount = categoryProducts.reduce(
        (total, product) => total + (product.image_url ? 1 : 0) + (product.variants?.filter((variant) => variant.imageUrl).length ?? 0),
        0
      );

      return { name: category, subcategories, productCount: categoryProducts.length, imageCount };
    });
  const taxonomyRows = [...configuredTaxonomy, ...customTaxonomy];
  const sortedProducts = [...products].sort((first, second) => (
    (first.category ?? primaryProductCategory).localeCompare(second.category ?? primaryProductCategory)
    || (first.subcategory ?? "").localeCompare(second.subcategory ?? "")
    || first.name.localeCompare(second.name)
  ));

  const editProduct = (product: LocalProductRow) => {
    setSelectedProduct(product);
    window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const clearSelection = () => {
    setSelectedProduct(null);
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }

    setDeleteError(null);
    setPendingDeleteProduct(null);
  };

  const deletePendingProduct = () => {
    if (!pendingDeleteProduct) {
      return;
    }

    const product = pendingDeleteProduct;
    setDeleteError(null);
    setDeletingProductId(product.id);
    startDeleteTransition(async () => {
      const result = await deleteProductById(product.id);

      if (result.tone === "error") {
        setDeleteError(result.message);
        setPendingDeleteProduct(product);
      } else {
        if (selectedProduct?.id === product.id) {
          setSelectedProduct(null);
        }
        setPendingDeleteProduct(null);
        router.refresh();
      }

      setDeletingProductId(null);
    });
  };

  return (
    <div className="grid gap-6">
      <section className="form-card">
        <div className="card-header">
          <div>
            <p className="m-0 text-[0.68rem] font-black uppercase text-[#60738d]">Catalog structure</p>
            <h2 className="card-title mt-1">Categories and subcategories</h2>
            <p className="card-subtitle">The complete taxonomy stays available while product photography is added over time.</p>
          </div>
          <span className="border border-[#16436f]/20 bg-[#eef2f6] px-3 py-2 text-xs font-black uppercase text-[#16436f]">
            {taxonomyRows.length} categories
          </span>
        </div>

        <div className="grid border border-[#16436f]/14 md:hidden">
          {taxonomyRows.map((row) => (
            <article className="grid gap-3 border-b border-[#16436f]/10 p-4 last:border-b-0" key={row.name}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="m-0 text-base font-black uppercase leading-tight text-[#16436f]">{row.name}</h3>
                  <p className="m-0 mt-1 text-[0.68rem] font-black uppercase text-[#60738d]">
                    {row.productCount} product{row.productCount === 1 ? "" : "s"}
                  </p>
                </div>
                <span className={`shrink-0 text-right text-[0.65rem] font-black uppercase ${row.name === primaryProductCategory ? "text-[#217a46]" : "text-[#60738d]"}`}>
                  {row.imageCount ? `${row.imageCount} images` : "Ready for upload"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {row.subcategories.length ? row.subcategories.map((subcategory) => (
                  <span className="border border-[#16436f]/16 bg-white px-2.5 py-1 text-[0.65rem] font-bold uppercase text-[#4d6d91]" key={subcategory}>
                    {subcategory}
                  </span>
                )) : (
                  <span className="text-xs font-medium text-[#60738d]">No configured subcategories</span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto border border-[#16436f]/14 md:block">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-[#e9eef3] text-[0.68rem] font-black uppercase text-[#16436f]">
              <tr>
                <th className="border-b border-[#16436f]/16 px-4 py-3">Category</th>
                <th className="border-b border-[#16436f]/16 px-4 py-3">Subcategories</th>
                <th className="border-b border-[#16436f]/16 px-4 py-3 text-center">Products</th>
                <th className="border-b border-[#16436f]/16 px-4 py-3">Image status</th>
              </tr>
            </thead>
            <tbody>
              {taxonomyRows.map((row) => (
                <tr className="border-b border-[#16436f]/10 last:border-b-0" key={row.name}>
                  <td className="px-4 py-4 align-top">
                    <span className="font-black uppercase text-[#16436f]">{row.name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex max-w-3xl flex-wrap gap-2">
                      {row.subcategories.length ? row.subcategories.map((subcategory) => (
                        <span className="border border-[#16436f]/16 bg-white px-2.5 py-1 text-[0.65rem] font-bold uppercase text-[#4d6d91]" key={subcategory}>
                          {subcategory}
                        </span>
                      )) : (
                        <span className="text-xs font-medium text-[#60738d]">No configured subcategories</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-lg font-black text-[#16436f]">{row.productCount}</td>
                  <td className="px-4 py-4 text-xs font-black uppercase">
                    <span className={row.name === primaryProductCategory ? "text-[#217a46]" : "text-[#60738d]"}>
                      {row.imageCount ? `${row.imageCount} images` : "Ready for upload"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="form-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Product inventory</h2>
            <p className="card-subtitle">
              {products.length} product{products.length === 1 ? "" : "s"} currently in the local database.
            </p>
          </div>
        </div>

        {products.length ? (
          <>
          <div className="grid gap-3 md:hidden">
            {sortedProducts.map((product) => (
              <article className="grid gap-3 border border-[#16436f]/16 bg-[#eef2f6]/72 p-3" key={product.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="m-0 break-words text-lg font-black uppercase leading-none text-[#16436f]">
                      {product.name}
                    </h3>
                    <p className="m-0 mt-2 text-xs font-bold uppercase text-[#16436f]">
                      {product.category ?? "Home Towels"}
                      {product.subcategory ? <span className="text-[#60738d]"> / {product.subcategory}</span> : null}
                    </p>
                  </div>
                  <p className="m-0 shrink-0 border border-[#16436f]/25 px-2 py-1 text-[0.62rem] font-black uppercase text-[#16436f]">
                    {product.variants?.length ?? 0} colors
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.variants?.map((variant) => (
                    <span
                      className="h-9 w-9 border border-[#16436f]/25 bg-cover bg-center"
                      key={variant.id}
                      style={{
                        backgroundColor: variant.color,
                        backgroundImage: variant.imageUrl ? `url(${variant.imageUrl})` : undefined
                      }}
                      title={`${variant.name} ${variant.color}`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 border-y border-[#16436f]/10 text-xs">
                  <div className="border-b border-r border-[#16436f]/10 px-2 py-2">
                    <span className="block font-black uppercase text-[#60738d]">Material</span>
                    <span className="mt-1 block font-bold text-[#16436f]">{product.material ?? "Cotton 100%"}</span>
                  </div>
                  <div className="border-b border-[#16436f]/10 px-2 py-2">
                    <span className="block font-black uppercase text-[#60738d]">Size</span>
                    <span className="mt-1 block font-bold text-[#16436f]">{product.size ?? "Custom size"}</span>
                  </div>
                  <div className="border-r border-[#16436f]/10 px-2 py-2">
                    <span className="block font-black uppercase text-[#60738d]">Weight</span>
                    <span className="mt-1 block font-bold text-[#16436f]">{formatProductWeight(product.weight ?? "") || "Not set"}</span>
                  </div>
                  <div className="px-2 py-2">
                    <span className="block font-black uppercase text-[#60738d]">GSM</span>
                    <span className="mt-1 block font-bold text-[#16436f]">{formatProductGsm(product.gsm ?? "") || "Not set"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="min-h-11 border border-[#16436f]/35 px-3 text-[0.72rem] font-black uppercase text-[#16436f] transition hover:bg-[#16436f] hover:text-white"
                    onClick={() => editProduct(product)}
                    type="button"
                  >
                    Edit
                  </button>

                  <button
                    className="min-h-11 border border-[#c84c45]/45 px-3 text-[0.72rem] font-black uppercase text-[#a83b35] transition hover:bg-[#c84c45] hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
                    disabled={isDeleting && deletingProductId === product.id}
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDeleteProduct(product);
                    }}
                    type="button"
                  >
                    {isDeleting && deletingProductId === product.id ? "Deleting" : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[940px] border-collapse text-left">
              <thead className="border-b border-[#16436f]/25 bg-[#e9eef3] text-[0.72rem] font-black uppercase text-[#16436f]">
                <tr>
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Colors</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Material</th>
                  <th className="py-3 pr-4">Size</th>
                  <th className="py-3 pr-4">Weight</th>
                  <th className="py-3 pr-4">GSM</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedProducts.map((product) => (
                  <tr className="border-b border-[#16436f]/12 align-middle transition hover:bg-[#eef2f6]/75" key={product.id}>
                    <td className="py-4 pr-4">
                      <p className="m-0 text-base font-black uppercase text-[#16436f]">
                        {product.name}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex max-w-[320px] flex-wrap gap-2">
                        {product.variants?.map((variant) => (
                          <span
                            className="h-8 w-8 border border-[#16436f]/25 bg-cover bg-center"
                            key={variant.id}
                            style={{
                              backgroundColor: variant.color,
                              backgroundImage: variant.imageUrl ? `url(${variant.imageUrl})` : undefined
                            }}
                            title={`${variant.name} ${variant.color}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm font-bold text-[#16436f]">
                      <span className="block">{product.category ?? "Home Towels"}</span>
                      {product.subcategory ? (
                        <span className="mt-1 block text-[0.68rem] uppercase text-[#60738d]">{product.subcategory}</span>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4 text-sm font-bold text-[#16436f]">
                      {product.material ?? "Cotton 100%"}
                    </td>
                    <td className="py-4 pr-4 text-sm font-bold text-[#16436f]">
                      {product.size ?? "Custom size"}
                    </td>
                    <td className="py-4 pr-4 text-sm font-bold text-[#16436f]">
                      {formatProductWeight(product.weight ?? "") || "Not set"}
                    </td>
                    <td className="py-4 pr-4 text-sm font-bold text-[#16436f]">
                      {formatProductGsm(product.gsm ?? "") || "Not set"}
                    </td>
                    <td className="py-4 text-right">
                      <div className="ml-auto flex justify-end gap-2">
                        <button
                          className="border border-[#16436f]/35 px-4 py-2 text-[0.72rem] font-black uppercase text-[#16436f] transition hover:bg-[#16436f] hover:text-white"
                          onClick={() => editProduct(product)}
                          type="button"
                        >
                          Edit
                        </button>

                        <button
                          className="border border-[#c84c45]/45 px-4 py-2 text-[0.72rem] font-black uppercase text-[#a83b35] transition hover:bg-[#c84c45] hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
                          disabled={isDeleting && deletingProductId === product.id}
                          onClick={() => {
                            setDeleteError(null);
                            setPendingDeleteProduct(product);
                          }}
                          type="button"
                        >
                          {isDeleting && deletingProductId === product.id ? "Deleting" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <p className="status">No products yet. Add the first towel product.</p>
        )}
      </section>

      <div className="mx-auto w-full lg:w-[80%]" ref={editorRef}>
        <ProductForm
          key={selectedProduct?.id ?? "new-product"}
          onCancel={clearSelection}
          onSaved={clearSelection}
          product={selectedProduct}
        />
      </div>

      {pendingDeleteProduct ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-[#16436f]/48 px-4 backdrop-blur-sm"
          role="dialog"
        >
          <div className="w-full max-w-[460px] border border-[#16436f]/22 bg-[#f7f8fa] p-6 text-[#16436f] shadow-[0_40px_120px_rgba(22,67,111,0.28)]">
            <p className="m-0 text-[0.72rem] font-black uppercase text-[#60738d]">
              Confirm delete
            </p>
            <h3 className="m-0 mt-3 text-3xl font-black uppercase leading-none text-[#16436f]">
              {pendingDeleteProduct.name}
            </h3>
            <p className="m-0 mt-4 text-sm leading-6 text-[#4d6d91]">
              This will permanently remove the product and its color variants from the local database.
            </p>
            {deleteError ? (
              <p className="m-0 mt-4 text-sm font-bold text-[#ff8178]">
                {deleteError}
              </p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className="secondary-button"
                disabled={isDeleting}
                onClick={closeDeleteModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="min-h-12 rounded-[6px] border border-[#c84c45] bg-[#c84c45] px-4 font-black uppercase text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isDeleting && deletingProductId === pendingDeleteProduct.id}
                onClick={deletePendingProduct}
                type="button"
              >
                {isDeleting && deletingProductId === pendingDeleteProduct.id ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
