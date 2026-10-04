export const primaryProductCategory = "Home Towels";

export const productCategoryGroups = [
  {
    name: primaryProductCategory,
    subcategories: []
  },
  {
    name: "Beach Towel",
    subcategories: ["Cabana", "Solid", "Double Jacquard", "Jacquard"]
  },
  {
    name: "Pareos Towel",
    subcategories: ["Solid", "Light"]
  },
  {
    name: "Kitchen Towel",
    subcategories: ["Flat", "Jacquard"]
  },
  {
    name: "Towel Sets",
    subcategories: ["Solid Jacquard"]
  },
  {
    name: "Mandala Towel",
    subcategories: []
  },
  {
    name: "Printed Towels",
    subcategories: []
  },
  {
    name: "Ihram Towel",
    subcategories: []
  },
  {
    name: "Hotel Towel",
    subcategories: []
  },
  {
    name: "Bath Robe",
    subcategories: []
  }
] as const;

export const productCategories: string[] = productCategoryGroups.map((group) => group.name);

export type ProductCategory = string;

export function normalizeProductCategory(category?: string | null): ProductCategory {
  const value = category?.trim().toLowerCase() ?? "";

  if (!value || value.includes("basic") || value.includes("home")) {
    return primaryProductCategory;
  }

  if (value.includes("beach")) {
    return "Beach Towel";
  }

  if (value.includes("pareo")) {
    return "Pareos Towel";
  }

  if (value.includes("kitchen")) {
    return "Kitchen Towel";
  }

  if (value.includes("set")) {
    return "Towel Sets";
  }

  if (value.includes("mandala")) {
    return "Mandala Towel";
  }

  if (value.includes("print")) {
    return "Printed Towels";
  }

  if (value.includes("ihram")) {
    return "Ihram Towel";
  }

  if (value.includes("hotel") || value.includes("luxury") || value === "spa") {
    return "Hotel Towel";
  }

  if (value.includes("robe")) {
    return "Bath Robe";
  }

  return cleanCategoryName(category) || primaryProductCategory;
}

export function cleanCategoryName(category?: string | null) {
  return category?.replace(/\s+/g, " ").trim() ?? "";
}

export function normalizeProductSubcategory(category?: string | null, subcategory?: string | null) {
  const normalizedSubcategory = cleanCategoryName(subcategory);

  if (!normalizedSubcategory) {
    return "";
  }

  const group = productCategoryGroups.find((item) => item.name === normalizeProductCategory(category));

  if (!group?.subcategories.length) {
    return normalizedSubcategory;
  }

  const matchingSubcategory = group.subcategories.find(
    (item) => item.toLowerCase() === normalizedSubcategory.toLowerCase()
  );

  return matchingSubcategory ?? normalizedSubcategory;
}

export function getProductCategoryFilters(products: Pick<ProductVariation, "category">[]) {
  const productCategorySet = new Set(products.map((product) => normalizeProductCategory(product.category)));
  const customProductCategories = [...productCategorySet].filter(
    (category) => category !== primaryProductCategory && !productCategories.includes(category)
  );

  return [
    "All",
    primaryProductCategory,
    ...productCategories.filter((category) => category !== primaryProductCategory),
    ...customProductCategories
  ];
}

export const allProductSubcategoryFilter = "All labels";

export function getProductSubcategoryFilters(
  products: Pick<ProductVariation, "category" | "subcategory">[],
  category: string
) {
  const configuredSubcategories = category === "All"
    ? [...new Set(productCategoryGroups.flatMap((group) => [...group.subcategories]))]
    : [...(productCategoryGroups.find((group) => group.name === category)?.subcategories ?? [])];
  const configuredSet = new Set<string>(configuredSubcategories);
  const productSubcategories = products
    .filter((product) => category === "All" || product.category === category)
    .map((product) => product.subcategory)
    .filter(Boolean);
  const customSubcategories = [...new Set(productSubcategories)].filter(
    (subcategory) => !configuredSet.has(subcategory)
  );

  return [allProductSubcategoryFilter, ...configuredSubcategories, ...customSubcategories];
}

export function productMatchesFilters(
  product: Pick<ProductVariation, "category" | "subcategory">,
  category: string,
  subcategory: string
) {
  const matchesCategory = category === "All" || product.category === category;
  const matchesSubcategory = subcategory === allProductSubcategoryFilter || product.subcategory === subcategory;

  return matchesCategory && matchesSubcategory;
}

export type ProductColorVariant = {
  id: string;
  name: string;
  color: string;
  imageUrl: string | null;
};

export type ProductVariation = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  material: string;
  size: string;
  shape: string;
  weight: string;
  note: string;
  color: string;
  imageUrl: string | null;
  variants: ProductColorVariant[];
  scale: number;
  radius: string;
  aspect: string;
};

export type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  subcategory?: string | null;
  material?: string | null;
  size: string | null;
  shape: string | null;
  weight: string | null;
  note: string | null;
  color: string | null;
  image_url?: string | null;
  variants?: ProductColorVariant[] | null;
};

export const fallbackProducts: ProductVariation[] = [
  {
    id: "classic-bath-towel",
    name: "Classic Bath Towel",
    category: primaryProductCategory,
    subcategory: "",
    material: "Cotton 100%",
    size: "70 x 140 cm",
    shape: "Rectangle",
    weight: "520 GSM",
    note: "Daily bath towel with a deep border weave.",
    color: "#d7ad47",
    imageUrl: null,
    variants: [
      { id: "classic-bath-towel-champagne", name: "Champagne", color: "#d7ad47", imageUrl: null },
      { id: "classic-bath-towel-ivory", name: "Ivory", color: "#efe6d1", imageUrl: null }
    ],
    scale: 1,
    radius: "18px",
    aspect: "aspect-[7/10]"
  },
  {
    id: "hotel-hand-towel",
    name: "Hotel Hand Towel",
    category: "Hotel Towel",
    subcategory: "",
    material: "Cotton 100%",
    size: "50 x 90 cm",
    shape: "Compact",
    weight: "480 GSM",
    note: "Quick-dry hand towel for stacked guest sets.",
    color: "#efe6d1",
    imageUrl: null,
    variants: [
      { id: "hotel-hand-towel-ivory", name: "Ivory", color: "#efe6d1", imageUrl: null },
      { id: "hotel-hand-towel-graphite", name: "Graphite", color: "#222222", imageUrl: null }
    ],
    scale: 0.78,
    radius: "14px",
    aspect: "aspect-[5/7]"
  },
  {
    id: "round-beach-towel",
    name: "Round Beach Towel",
    category: "Beach Towel",
    subcategory: "Solid",
    material: "Blended cotton",
    size: "150 cm",
    shape: "Circle",
    weight: "420 GSM",
    note: "Circular beach towel with a soft terry face.",
    color: "#6f7350",
    imageUrl: null,
    variants: [
      { id: "round-beach-towel-olive", name: "Olive", color: "#6f7350", imageUrl: null },
      { id: "round-beach-towel-champagne", name: "Champagne", color: "#d7ad47", imageUrl: null }
    ],
    scale: 0.96,
    radius: "999px",
    aspect: "aspect-square"
  },
  {
    id: "oversized-spa-towel",
    name: "Oversized Spa Towel",
    category: "Hotel Towel",
    subcategory: "",
    material: "Cotton 100%",
    size: "100 x 180 cm",
    shape: "Oversized",
    weight: "620 GSM",
    note: "Large spa profile with extra wrap length.",
    color: "#c49a3a",
    imageUrl: null,
    variants: [
      { id: "oversized-spa-towel-gold", name: "Gold", color: "#c49a3a", imageUrl: null },
      { id: "oversized-spa-towel-graphite", name: "Graphite", color: "#222222", imageUrl: null }
    ],
    scale: 1.12,
    radius: "20px",
    aspect: "aspect-[5/8]"
  },
  {
    id: "guest-towel-stack",
    name: "Guest Towel Stack",
    category: primaryProductCategory,
    subcategory: "",
    material: "Blended cotton",
    size: "30 x 50 cm",
    shape: "Stack",
    weight: "450 GSM",
    note: "Small folded towels for hospitality counters.",
    color: "#222222",
    imageUrl: null,
    variants: [
      { id: "guest-towel-stack-graphite", name: "Graphite", color: "#222222", imageUrl: null },
      { id: "guest-towel-stack-ivory", name: "Ivory", color: "#efe6d1", imageUrl: null }
    ],
    scale: 0.72,
    radius: "12px",
    aspect: "aspect-[6/5]"
  },
  {
    id: "hooded-kids-towel",
    name: "Hooded Kids Towel",
    category: primaryProductCategory,
    subcategory: "",
    material: "Cotton 100%",
    size: "75 x 75 cm",
    shape: "Hooded",
    weight: "500 GSM",
    note: "Square towel with a corner hood silhouette.",
    color: "#d7ad47",
    imageUrl: null,
    variants: [
      { id: "hooded-kids-towel-champagne", name: "Champagne", color: "#d7ad47", imageUrl: null },
      { id: "hooded-kids-towel-olive", name: "Olive", color: "#6f7350", imageUrl: null }
    ],
    scale: 0.86,
    radius: "16px",
    aspect: "aspect-square"
  }
];

export function getShapeDisplay(shape: string) {
  const normalizedShape = shape.trim().toLowerCase();

  if (normalizedShape.includes("round") || normalizedShape.includes("circle")) {
    return {
      shape: "Circle",
      radius: "999px",
      aspect: "aspect-square",
      scale: 0.96
    };
  }

  if (normalizedShape.includes("stack")) {
    return {
      shape: "Stack",
      radius: "12px",
      aspect: "aspect-[6/5]",
      scale: 0.72
    };
  }

  if (normalizedShape.includes("hood")) {
    return {
      shape: "Hooded",
      radius: "16px",
      aspect: "aspect-square",
      scale: 0.86
    };
  }

  if (normalizedShape.includes("oversized") || normalizedShape.includes("spa")) {
    return {
      shape: "Oversized",
      radius: "20px",
      aspect: "aspect-[5/8]",
      scale: 1.12
    };
  }

  if (normalizedShape.includes("compact") || normalizedShape.includes("hand")) {
    return {
      shape: "Compact",
      radius: "14px",
      aspect: "aspect-[5/7]",
      scale: 0.78
    };
  }

  return {
    shape: shape.trim() || "Rectangle",
    radius: "18px",
    aspect: "aspect-[7/10]",
    scale: 1
  };
}

export function mapProductRow(row: ProductRow): ProductVariation {
  const display = getShapeDisplay(row.shape ?? "");
  const variants = normalizeProductVariants(row);
  const primaryVariant = variants[0];

  return {
    id: row.id,
    name: row.name,
    category: normalizeProductCategory(row.category),
    subcategory: normalizeProductSubcategory(row.category, row.subcategory),
    material: row.material || "Cotton 100%",
    size: row.size || "Custom size",
    shape: display.shape,
    weight: row.weight || "Custom GSM",
    note: row.note || "MMTextile towel variation.",
    color: primaryVariant.color,
    imageUrl: primaryVariant.imageUrl,
    variants,
    radius: display.radius,
    aspect: display.aspect,
    scale: display.scale
  };
}

export function normalizeProductVariants(row: ProductRow): ProductColorVariant[] {
  const variants = Array.isArray(row.variants)
    ? row.variants
        .filter((variant) => variant?.color || variant?.imageUrl)
        .map((variant, index) => ({
          id: variant.id || `${row.id}-variant-${index + 1}`,
          name: variant.name || `Color ${index + 1}`,
          color: variant.color || "#d7ad47",
          imageUrl: variant.imageUrl ?? null
        }))
    : [];

  if (variants.length) {
    return variants;
  }

  return [
    {
      id: `${row.id}-primary`,
      name: "Primary",
      color: row.color || "#d7ad47",
      imageUrl: row.image_url ?? null
    }
  ];
}
