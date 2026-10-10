"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import {
  addLocalProduct,
  deleteLocalProduct,
  getLocalProductRows,
  optimizeProductImage,
  updateLocalProduct,
  type LocalProductRow
} from "@/lib/local-db";
import {
  clearLocalAdminSession,
  isLocalAdminSignedIn,
  isValidLocalAdmin,
  setLocalAdminSession
} from "@/lib/local-auth";
import {
  cleanCategoryName,
  normalizeProductCategory,
  normalizeProductSubcategory,
  type ProductColorVariant
} from "@/lib/products";

export type FormState = {
  message: string;
  tone?: "error" | "success";
};

const variantSlots = Array.from({ length: 12 }, (_, index) => index + 1);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

async function readProductPayload(formData: FormData, existingProduct?: LocalProductRow) {
  const name = String(formData.get("name") ?? "").trim();
  const categoryChoice = String(formData.get("category") ?? "").trim();
  const customCategory = cleanCategoryName(String(formData.get("customCategory") ?? ""));
  const rawCategory = categoryChoice === "__custom" ? customCategory : categoryChoice;
  const category = normalizeProductCategory(rawCategory);
  const subcategoryChoice = String(formData.get("subcategory") ?? "").trim();
  const customSubcategory = cleanCategoryName(String(formData.get("customSubcategory") ?? ""));
  const rawSubcategory = subcategoryChoice === "__custom" || (!subcategoryChoice && customSubcategory)
    ? customSubcategory
    : subcategoryChoice;
  const subcategory = normalizeProductSubcategory(category, rawSubcategory);
  const materialChoice = String(formData.get("material") ?? "").trim();
  const customMaterial = String(formData.get("customMaterial") ?? "").trim();
  const material = materialChoice === "__custom" ? customMaterial : materialChoice;
  const size = String(formData.get("size") ?? "").trim();
  const shape = String(formData.get("shape") ?? "Rectangle").trim() || "Rectangle";
  const weight = String(formData.get("weight") ?? "").trim();
  const gsm = String(formData.get("gsm") ?? "").trim().replace(/\s*gsm$/i, "");
  const note = String(formData.get("note") ?? "").trim();

  if (!name || !category || !material || !size) {
    throw new Error("Fill the product name, category, material, and size.");
  }

  if (categoryChoice === "__custom" && !customCategory) {
    throw new Error("Add a name for the new category.");
  }

  const variants: ProductColorVariant[] = [];
  const productSlug = slugify(name) || "product";

  for (const slot of variantSlots) {
    const variantName = String(formData.get(`variantName${slot}`) ?? "").trim();
    const variantColor = String(formData.get(`variantColor${slot}`) ?? "").trim();
    const existingVariantId = String(formData.get(`variantId${slot}`) ?? "").trim();
    const existingImageUrl = String(formData.get(`variantImageUrl${slot}`) ?? "").trim();
    const imageValue = formData.get(`variantImage${slot}`);
    const imageFile = imageValue instanceof File ? imageValue : null;
    const hasImageUpload = Boolean(imageFile && imageFile.size > 0);

    if (!variantColor && !variantName && !hasImageUpload && !existingImageUrl) {
      continue;
    }

    const optimizedImageUrl = hasImageUpload
      ? await optimizeProductImage(imageFile, `${productSlug}-variant-${slot}`)
      : null;

    variants.push({
      id: existingVariantId || randomUUID(),
      name: variantName || `Color ${slot}`,
      color: variantColor || "#d7ad47",
      imageUrl: optimizedImageUrl ?? (existingImageUrl || null)
    });
  }

  if (!variants.length) {
    const fallbackColor = existingProduct?.color || "#d7ad47";

    variants.push({
      id: existingProduct?.variants?.[0]?.id || randomUUID(),
      name: "Primary",
      color: fallbackColor,
      imageUrl: existingProduct?.image_url ?? null
    });
  }

  return {
    name,
    category,
    subcategory,
    material,
    size,
    shape,
    weight,
    gsm,
    color: variants[0].color,
    note,
    variants
  };
}

export async function loginAdmin(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isValidLocalAdmin(email, password)) {
    return {
      message: "Invalid admin email or password.",
      tone: "error"
    };
  }

  await setLocalAdminSession();
  redirect("/admin");
}

export async function saveTextileRequest(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const fabricType = String(formData.get("fabricType") ?? "").trim();

  if (!customerName || !fabricType) {
    return {
      message: "Please fill both fields before saving.",
      tone: "error"
    };
  }

  if (!(await isLocalAdminSignedIn())) {
    return {
      message: "Please login again before saving requests.",
      tone: "error"
    };
  }

  revalidatePath("/");

  return {
    message: `Saved locally: ${customerName} / ${fabricType}.`,
    tone: "success"
  };
}

export async function saveProduct(
  _previousState: FormState,
  formData: FormData
): Promise<FormState> {
  if (!(await isLocalAdminSignedIn())) {
    return {
      message: "Please login again before adding products.",
      tone: "error"
    };
  }

  try {
    const productId = String(formData.get("productId") ?? "").trim();

    if (productId) {
      const existingProduct = (await getLocalProductRows()).find((product) => product.id === productId);

      if (!existingProduct) {
        return {
          message: "Product not found.",
          tone: "error"
        };
      }

      await updateLocalProduct(productId, await readProductPayload(formData, existingProduct));
    } else {
      await addLocalProduct(await readProductPayload(formData));
    }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Could not save product.",
      tone: "error"
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");

  return {
    message: "Product saved to the local website database.",
    tone: "success"
  };
}

export async function editProduct(formData: FormData) {
  if (!(await isLocalAdminSignedIn())) {
    redirect("/login");
  }

  const productId = String(formData.get("productId") ?? "").trim();
  const existingProduct = (await getLocalProductRows()).find((product) => product.id === productId);

  if (!productId || !existingProduct) {
    redirect("/admin");
  }

  await updateLocalProduct(productId, await readProductPayload(formData, existingProduct));

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function removeProduct(formData: FormData) {
  if (!(await isLocalAdminSignedIn())) {
    redirect("/login");
  }

  const productId = String(formData.get("productId") ?? "").trim();

  if (productId) {
    await deleteLocalProduct(productId);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProductById(productId: string): Promise<FormState> {
  if (!(await isLocalAdminSignedIn())) {
    return {
      message: "Please login again before deleting products.",
      tone: "error"
    };
  }

  const normalizedProductId = productId.trim();

  if (!normalizedProductId) {
    return {
      message: "Product not found.",
      tone: "error"
    };
  }

  await deleteLocalProduct(normalizedProductId);

  revalidatePath("/");
  revalidatePath("/admin");

  return {
    message: "Product deleted.",
    tone: "success"
  };
}

export async function signOut() {
  await clearLocalAdminSession();
  redirect("/login");
}
