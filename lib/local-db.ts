import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
import {
  fallbackProducts,
  mapProductRow,
  normalizeProductCategory,
  normalizeProductSubcategory,
  normalizeProductVariants,
  type ProductColorVariant,
  type ProductRow,
  type ProductVariation
} from "@/lib/products";

export type LocalProductRow = ProductRow & {
  user_id?: string;
  created_at: string;
  updated_at?: string;
};

type LocalDb = {
  products: LocalProductRow[];
};

type NewLocalProduct = {
  name: string;
  category: string;
  subcategory: string;
  material: string;
  size: string;
  shape: string;
  weight: string;
  color: string;
  note: string;
  variants: ProductColorVariant[];
};

const dbDirectory = path.join(process.cwd(), "data");
const dbPath = path.join(dbDirectory, "local-db.json");
const uploadDirectory = path.join(process.cwd(), "public", "uploads", "products");
const supabaseProductTable = "mmtextile_products";

function getSupabaseSettings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseSecretKey,
    readKey: supabaseSecretKey || supabaseAnonKey,
    imageBucket: process.env.SUPABASE_PRODUCT_IMAGE_BUCKET || "product-images"
  };
}

function hasSupabaseReadEnv() {
  const { supabaseUrl, readKey } = getSupabaseSettings();

  return Boolean(supabaseUrl && readKey);
}

function hasSupabaseWriteEnv() {
  const { supabaseUrl, supabaseSecretKey } = getSupabaseSettings();

  return Boolean(supabaseUrl && supabaseSecretKey);
}

function createSupabaseDataClient(requireWriteKey = false) {
  const { supabaseUrl, readKey, supabaseSecretKey } = getSupabaseSettings();
  const supabaseKey = requireWriteKey ? supabaseSecretKey : readKey;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function toSupabaseProductPayload(product: LocalProductRow) {
  return {
    id: product.id,
    user_id: product.user_id || "local-admin",
    name: product.name,
    category: product.category || "Home Towels",
    subcategory: product.subcategory || "",
    material: product.material || "Cotton 100%",
    size: product.size || "Custom size",
    shape: product.shape || "Rectangle",
    weight: product.weight || "Custom GSM",
    color: product.color || "#d7ad47",
    note: product.note || "",
    image_url: product.image_url ?? null,
    variants: product.variants ?? [],
    created_at: product.created_at,
    updated_at: product.updated_at ?? null
  };
}

function createSeedDb(): LocalDb {
  const now = new Date().toISOString();

  return {
    products: fallbackProducts.map((product, index) => ({
      id: product.id,
      user_id: "local-admin",
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      material: product.material,
      size: product.size,
      shape: product.shape,
      weight: product.weight,
      note: product.note,
      color: product.color,
      image_url: product.imageUrl,
      variants: product.variants,
      created_at: new Date(Date.parse(now) - index * 1000).toISOString()
    }))
  };
}

function normalizeLocalProduct(product: LocalProductRow): LocalProductRow {
  return {
    ...product,
    category: normalizeProductCategory(product.category),
    subcategory: normalizeProductSubcategory(product.category, product.subcategory),
    material: product.material || "Cotton 100%",
    size: product.size || "Custom size",
    shape: product.shape || "Rectangle",
    weight: product.weight || "Custom GSM",
    note: product.note || "",
    color: product.color || "#d7ad47",
    image_url: product.image_url ?? null,
    variants: normalizeProductVariants(product)
  };
}

async function writeLocalDb(db: LocalDb) {
  await mkdir(dbDirectory, { recursive: true });
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

export async function readLocalDb(): Promise<LocalDb> {
  try {
    const rawDb = await readFile(dbPath, "utf8");
    const parsedDb = JSON.parse(rawDb) as LocalDb;

    return {
      products: Array.isArray(parsedDb.products) ? parsedDb.products.map(normalizeLocalProduct) : []
    };
  } catch {
    const seedDb = createSeedDb();
    await writeLocalDb(seedDb);

    return seedDb;
  }
}

export async function optimizeProductImage(file: File | null, imageKey: string) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Upload an image file for each product variant.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Images must be smaller than 8 MB before optimization.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${imageKey}-${randomUUID()}.webp`;
  const optimizedImage = await sharp(buffer)
    .rotate()
    .resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({ quality: 78, effort: 4 })
    .toBuffer();

  if (hasSupabaseWriteEnv()) {
    const supabase = createSupabaseDataClient(true);
    const { imageBucket } = getSupabaseSettings();
    const imagePath = `products/${fileName}`;

    if (supabase) {
      const { error } = await supabase.storage.from(imageBucket).upload(imagePath, optimizedImage, {
        contentType: "image/webp",
        upsert: false
      });

      if (error) {
        throw new Error(`Could not upload product image: ${error.message}`);
      }

      return supabase.storage.from(imageBucket).getPublicUrl(imagePath).data.publicUrl;
    }
  }

  await mkdir(uploadDirectory, { recursive: true });

  const outputPath = path.join(uploadDirectory, fileName);

  await writeFile(outputPath, optimizedImage);

  return `/uploads/products/${fileName}`;
}

export async function getLocalProductRows() {
  if (hasSupabaseReadEnv()) {
    const supabase = createSupabaseDataClient();

    if (supabase) {
      const { data, error } = await supabase
        .from(supabaseProductTable)
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((product) => normalizeLocalProduct(product as LocalProductRow));
      }
    }
  }

  const db = await readLocalDb();

  return [...db.products].sort(
    (first, second) => Date.parse(second.created_at) - Date.parse(first.created_at)
  );
}

export async function getLocalProducts(): Promise<ProductVariation[]> {
  const products = await getLocalProductRows();

  return products.length ? products.map(mapProductRow) : fallbackProducts;
}

export async function addLocalProduct(product: NewLocalProduct) {
  const nextProduct: LocalProductRow = {
    id: randomUUID(),
    user_id: "local-admin",
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    material: product.material,
    size: product.size,
    shape: product.shape,
    weight: product.weight,
    color: product.color,
    note: product.note,
    image_url: product.variants[0]?.imageUrl ?? null,
    variants: product.variants,
    created_at: new Date().toISOString()
  };

  if (hasSupabaseWriteEnv()) {
    const supabase = createSupabaseDataClient(true);

    if (supabase) {
      const { data, error } = await supabase
        .from(supabaseProductTable)
        .insert(toSupabaseProductPayload(nextProduct))
        .select("*")
        .single();

      if (error) {
        throw new Error(`Could not save product: ${error.message}`);
      }

      return normalizeLocalProduct(data as LocalProductRow);
    }
  }

  const db = await readLocalDb();

  await writeLocalDb({
    products: [nextProduct, ...db.products]
  });

  return nextProduct;
}

export async function updateLocalProduct(productId: string, product: NewLocalProduct) {
  if (hasSupabaseWriteEnv()) {
    const supabase = createSupabaseDataClient(true);

    if (supabase) {
      const updatedProduct = {
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        material: product.material,
        size: product.size,
        shape: product.shape,
        weight: product.weight,
        color: product.color,
        note: product.note,
        image_url: product.variants[0]?.imageUrl ?? null,
        variants: product.variants,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from(supabaseProductTable)
        .update(updatedProduct)
        .eq("id", productId)
        .select("*")
        .single();

      if (error) {
        throw new Error(`Could not update product: ${error.message}`);
      }

      return normalizeLocalProduct(data as LocalProductRow);
    }
  }

  const db = await readLocalDb();
  const existingProduct = db.products.find((item) => item.id === productId);

  if (!existingProduct) {
    throw new Error("Product not found.");
  }

  const updatedProduct: LocalProductRow = {
    ...existingProduct,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    material: product.material,
    size: product.size,
    shape: product.shape,
    weight: product.weight,
    color: product.color,
    note: product.note,
    image_url: product.variants[0]?.imageUrl ?? null,
    variants: product.variants,
    updated_at: new Date().toISOString()
  };

  await writeLocalDb({
    products: db.products.map((item) => (item.id === productId ? updatedProduct : item))
  });

  return updatedProduct;
}

export async function deleteLocalProduct(productId: string) {
  if (hasSupabaseWriteEnv()) {
    const supabase = createSupabaseDataClient(true);

    if (supabase) {
      const { error } = await supabase.from(supabaseProductTable).delete().eq("id", productId);

      if (error) {
        throw new Error(`Could not delete product: ${error.message}`);
      }

      return;
    }
  }

  const db = await readLocalDb();

  await writeLocalDb({
    products: db.products.filter((product) => product.id !== productId)
  });
}
