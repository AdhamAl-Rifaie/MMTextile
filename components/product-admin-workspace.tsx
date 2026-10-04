"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductById } from "@/app/actions";
import { ProductForm } from "@/components/product-form";
import type { LocalProductRow } from "@/lib/local-db";

export function ProductAdminWorkspace({ products }: { products: LocalProductRow[] }) {
  const [selectedProduct, setSelectedProduct] = useState<LocalProductRow | null>(null);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<LocalProductRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);

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
            <h2 className="card-title">Products needed</h2>
            <p className="card-subtitle">
              {products.length} product{products.length === 1 ? "" : "s"} currently in the local database.
            </p>
          </div>
        </div>

        {products.length ? (
          <>
          <div className="grid gap-3 md:hidden">
            {products.map((product) => (
              <article className="grid gap-3 border border-[#f1c85b]/22 bg-black/20 p-3" key={product.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="m-0 break-words text-lg font-black uppercase leading-none text-[#f1c85b]">
                      {product.name}
                    </h3>
                    <p className="m-0 mt-2 text-xs font-bold uppercase text-[#f7f0de]">
                      {product.category ?? "Home Towels"}
                      {product.subcategory ? <span className="text-[#b8aa8a]"> / {product.subcategory}</span> : null}
                    </p>
                  </div>
                  <p className="m-0 shrink-0 border border-[#f1c85b]/35 px-2 py-1 text-[0.62rem] font-black uppercase text-[#f1c85b]">
                    {product.variants?.length ?? 0} colors
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.variants?.map((variant) => (
                    <span
                      className="h-9 w-9 rounded-full border border-[#f1c85b]/60 bg-cover bg-center"
                      key={variant.id}
                      style={{
                        backgroundColor: variant.color,
                        backgroundImage: variant.imageUrl ? `url(${variant.imageUrl})` : undefined
                      }}
                      title={`${variant.name} ${variant.color}`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 border-y border-white/10 text-xs">
                  <div className="border-r border-white/10 px-2 py-2">
                    <span className="block font-black uppercase text-[#b8aa8a]">Material</span>
                    <span className="mt-1 block font-bold text-[#f7f0de]">{product.material ?? "Cotton 100%"}</span>
                  </div>
                  <div className="px-2 py-2">
                    <span className="block font-black uppercase text-[#b8aa8a]">Size</span>
                    <span className="mt-1 block font-bold text-[#f7f0de]">{product.size ?? "Custom size"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="min-h-11 border border-[#f1c85b]/55 px-3 text-[0.72rem] font-black uppercase text-[#f1c85b] transition hover:bg-[#f1c85b] hover:text-black"
                    onClick={() => editProduct(product)}
                    type="button"
                  >
                    Edit
                  </button>

                  <button
                    className="min-h-11 border border-[#ff8178]/55 px-3 text-[0.72rem] font-black uppercase text-[#ff8178] transition hover:bg-[#ff8178] hover:text-black disabled:cursor-not-allowed disabled:opacity-55"
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
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="border-b border-[#f1c85b]/35 text-[0.72rem] font-black uppercase text-[#f1c85b]">
                <tr>
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 pr-4">Colors</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Material</th>
                  <th className="py-3 pr-4">Size</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr className="border-b border-[#f1c85b]/18 align-middle" key={product.id}>
                    <td className="py-4 pr-4">
                      <p className="m-0 text-base font-black uppercase text-[#f1c85b]">
                        {product.name}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex max-w-[320px] flex-wrap gap-2">
                        {product.variants?.map((variant) => (
                          <span
                            className="h-8 w-8 rounded-full border border-[#f1c85b]/60 bg-cover bg-center"
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
                    <td className="py-4 pr-4 text-sm font-bold text-[#f7f0de]">
                      <span className="block">{product.category ?? "Home Towels"}</span>
                      {product.subcategory ? (
                        <span className="mt-1 block text-[0.68rem] uppercase text-[#b8aa8a]">{product.subcategory}</span>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4 text-sm font-bold text-[#f7f0de]">
                      {product.material ?? "Cotton 100%"}
                    </td>
                    <td className="py-4 pr-4 text-sm font-bold text-[#f7f0de]">
                      {product.size ?? "Custom size"}
                    </td>
                    <td className="py-4 text-right">
                      <div className="ml-auto flex justify-end gap-2">
                        <button
                          className="rounded-full border border-[#f1c85b]/55 px-4 py-2 text-[0.72rem] font-black uppercase text-[#f1c85b] transition hover:bg-[#f1c85b] hover:text-black"
                          onClick={() => editProduct(product)}
                          type="button"
                        >
                          Edit
                        </button>

                        <button
                          className="rounded-full border border-[#ff8178]/55 px-4 py-2 text-[0.72rem] font-black uppercase text-[#ff8178] transition hover:bg-[#ff8178] hover:text-black disabled:cursor-not-allowed disabled:opacity-55"
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
          className="fixed inset-0 z-50 grid place-items-center bg-black/72 px-4 backdrop-blur-sm"
          role="dialog"
        >
          <div className="w-full max-w-[460px] border border-[#f1c85b]/40 bg-[#080705] p-6 text-[#f7f0de] shadow-[0_40px_120px_rgba(0,0,0,0.68)]">
            <p className="m-0 text-[0.72rem] font-black uppercase text-[#f1c85b]">
              Confirm delete
            </p>
            <h3 className="m-0 mt-3 text-3xl font-black uppercase leading-none text-[#f1c85b]">
              {pendingDeleteProduct.name}
            </h3>
            <p className="m-0 mt-4 text-sm leading-6 text-[#d8c996]">
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
                className="min-h-12 rounded-[6px] border border-[#ff8178]/65 bg-[#ff8178] px-4 font-black uppercase text-black disabled:cursor-not-allowed disabled:opacity-60"
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
