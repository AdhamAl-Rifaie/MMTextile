import { IntroReveal } from "@/components/intro-reveal";
import { HeroTitle } from "@/components/hero-title";
import { OpeningHero } from "@/components/opening-hero";
import { ProductShowcase } from "@/components/product-showcase";
import { ProductCatalog } from "@/components/product-catalog";
import { SiteFooter } from "@/components/site-footer";
import { getLocalProducts } from "@/lib/local-db";
import { primaryProductCategory, type ProductVariation } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";

async function getPublicProducts(): Promise<ProductVariation[]> {
  return getLocalProducts();
}

function HomeShell({
  label,
  products
}: {
  label: string;
  products: ProductVariation[];
}) {
  const featuredProducts = products.filter((product) => (
    product.category === primaryProductCategory
    && (product.imageUrl || product.variants.some((variant) => variant.imageUrl))
  ));

  return (
    <IntroReveal>
      <>
        <main className="min-h-screen overflow-x-clip bg-[#f4f6f8] px-3 py-4 text-[#16436f] [background-image:radial-gradient(circle_at_18%_12%,rgba(22,67,111,0.08),transparent_30rem),linear-gradient(135deg,#f7f8fa_0%,#f1f4f7_48%,#e9eef3_100%)] sm:px-4 sm:py-6">
          <section
            className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-[1840px] min-w-0 grid-cols-[minmax(0,1fr)] content-center gap-6"
            aria-label={label}
          >
            <div className="flex items-center justify-between gap-3 text-[#16436f] sm:gap-5">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <Image
                  src="/brand/mm-textile-logo-transparent.png"
                  alt="MM Textile"
                  width={96}
                  height={96}
                  priority
                  className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
                />
                <p className="text-[0.82rem] font-black uppercase tracking-normal">
                  Textile data workspace
                </p>
              </div>
              <Link
                className="text-[0.82rem] font-black uppercase tracking-normal underline decoration-[#16436f]/45 underline-offset-4 sm:mr-12"
                href="/admin"
              >
                Admin
              </Link>
            </div>

            <HeroTitle />
            <OpeningHero />

            {featuredProducts.length ? <ProductShowcase products={featuredProducts} /> : null}
            <ProductCatalog products={products} />
          </section>
        </main>
        <SiteFooter />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-10 bg-gradient-to-b from-[#eef2f6]/45 to-transparent backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)] sm:h-14"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] h-12 bg-gradient-to-t from-[#eef2f6]/45 to-transparent backdrop-blur-[2px] [mask-image:linear-gradient(to_top,black_0%,transparent_100%)] sm:h-16"
        />
      </>
    </IntroReveal>
  );
}

export default async function Home() {
  const products = await getPublicProducts();

  return <HomeShell label="MMTextile textile showcase" products={products} />;
}
