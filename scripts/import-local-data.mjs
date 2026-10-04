import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvConfig(projectRoot);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY before importing data.");
}

const rawDb = await readFile(path.join(projectRoot, "data", "local-db.json"), "utf8");
const db = JSON.parse(rawDb);
const products = Array.isArray(db.products) ? db.products : [];

const rows = products.map((product) => ({
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
  variants: Array.isArray(product.variants) ? product.variants : [],
  created_at: product.created_at || new Date().toISOString(),
  updated_at: product.updated_at ?? null
}));

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const { error } = await supabase.from("mmtextile_products").upsert(rows, {
  onConflict: "id"
});

if (error) {
  throw new Error(`Could not import products: ${error.message}`);
}

console.log(`Imported ${rows.length} products into Supabase.`);
