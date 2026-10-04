import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
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
  user_id: string;
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

  await mkdir(uploadDirectory, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${imageKey}-${randomUUID()}.webp`;
  const outputPath = path.join(uploadDirectory, fileName);

  await sharp(buffer)
    .rotate()
    .resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({ quality: 78, effort: 4 })
    .toFile(outputPath);

  return `/uploads/products/${fileName}`;
}

export async function getLocalProductRows() {
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
  const db = await readLocalDb();

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

  await writeLocalDb({
    products: [nextProduct, ...db.products]
  });

  return nextProduct;
}

export async function updateLocalProduct(productId: string, product: NewLocalProduct) {
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
  const db = await readLocalDb();

  await writeLocalDb({
    products: db.products.filter((product) => product.id !== productId)
  });
}
