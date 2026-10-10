import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectRoot);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY before importing data.");
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const rawDb = await readFile(path.join(projectRoot, "data", "local-db.json"), "utf8");
const db = JSON.parse(rawDb);
const products = Array.isArray(db.products) ? db.products : [];
const imageBucket = process.env.SUPABASE_PRODUCT_IMAGE_BUCKET || "product-images";
const migratedImages = new Map();
const shouldResetSupabaseData = process.env.RESET_SUPABASE_DATA === "true";

async function assertRemoteSchemaReady() {
  const { error } = await supabase.from("mmtextile_products").select("id,gsm").limit(1);

  if (error) {
    throw new Error(
      `Supabase schema is not ready for import: ${error.message}. Run supabase/schema.sql in the SQL Editor first.`
    );
  }
}

async function clearSupabaseData() {
  const { data: existingObjects, error: listError } = await supabase.storage.from(imageBucket).list("products", {
    limit: 1000
  });

  if (listError) {
    throw new Error(`Could not list existing product images: ${listError.message}`);
  }

  const objectPaths = (existingObjects ?? []).map((object) => `products/${object.name}`);

  if (objectPaths.length) {
    const { error: removeImagesError } = await supabase.storage.from(imageBucket).remove(objectPaths);

    if (removeImagesError) {
      throw new Error(`Could not delete existing product images: ${removeImagesError.message}`);
    }
  }

  const { error: deleteProductsError } = await supabase.from("mmtextile_products").delete().not("id", "is", null);

  if (deleteProductsError) {
    throw new Error(`Could not delete existing products: ${deleteProductsError.message}`);
  }

  const { error: deleteRequestsError } = await supabase.from("mmtextile_requests").delete().not("id", "is", null);

  if (deleteRequestsError) {
    throw new Error(`Could not delete existing requests: ${deleteRequestsError.message}`);
  }
}

await assertRemoteSchemaReady();

if (shouldResetSupabaseData) {
  await clearSupabaseData();
}

async function migrateImage(imageUrl) {
  if (!imageUrl?.startsWith("/uploads/")) {
    return imageUrl ?? null;
  }

  if (migratedImages.has(imageUrl)) {
    return migratedImages.get(imageUrl);
  }

  const filePath = path.join(projectRoot, "public", imageUrl.replace(/^\//, ""));
  const image = await readFile(filePath);
  const storagePath = `products/${path.basename(filePath)}`;
  const { error: uploadError } = await supabase.storage.from(imageBucket).upload(storagePath, image, {
    contentType: "image/webp",
    upsert: true
  });

  if (uploadError) {
    throw new Error(`Could not upload ${path.basename(filePath)}: ${uploadError.message}`);
  }

  const publicUrl = supabase.storage.from(imageBucket).getPublicUrl(storagePath).data.publicUrl;
  migratedImages.set(imageUrl, publicUrl);
  return publicUrl;
}

const productsWithImages = await Promise.all(products.map(async (product) => {
  const variants = await Promise.all((Array.isArray(product.variants) ? product.variants : []).map(async (variant) => ({
    ...variant,
    imageUrl: await migrateImage(variant.imageUrl)
  })));

  return {
    ...product,
    image_url: await migrateImage(product.image_url),
    variants
  };
}));

const rows = productsWithImages.map((product) => ({
  id: product.id,
  user_id: product.user_id || "local-admin",
  name: product.name,
  category: product.category || "Home Towels",
  subcategory: product.subcategory || "",
  material: product.material || "Cotton 100%",
  size: product.size || "Custom size",
  shape: product.shape || "Rectangle",
  weight: product.weight || "",
  gsm: product.gsm || "",
  color: product.color || "#d7ad47",
  note: product.note || "",
  image_url: product.image_url ?? null,
  variants: Array.isArray(product.variants) ? product.variants : [],
  created_at: product.created_at || new Date().toISOString(),
  updated_at: product.updated_at ?? null
}));

const { error } = await supabase.from("mmtextile_products").upsert(rows, {
  onConflict: "id"
});

if (error) {
  throw new Error(`Could not import products: ${error.message}`);
}

console.log(
  `${shouldResetSupabaseData ? "Reset and imported" : "Imported"} ${rows.length} products and ${migratedImages.size} images into Supabase.`
);
