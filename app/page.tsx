import { IntroReveal } from "@/components/intro-reveal";
import { HeroTitle } from "@/components/hero-title";
import { ProductShowcase } from "@/components/product-showcase";
import { ProductCatalog } from "@/components/product-catalog";
import { SiteFooter } from "@/components/site-footer";
import { getLocalProducts } from "@/lib/local-db";
import type { ProductVariation } from "@/lib/products";
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
  return (
    <IntroReveal>
      <>
        <main className="min-h-screen overflow-x-clip bg-[#050505] px-3 py-4 text-[#f7f0de] [background-image:radial-gradient(circle_at_18%_12%,rgba(241,200,91,0.16),transparent_30rem),linear-gradient(135deg,#050505_0%,#0d0a05_48%,#141007_100%)] sm:px-4 sm:py-6">
          <section
            className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-[1840px] min-w-0 grid-cols-[minmax(0,1fr)] content-center gap-6"
            aria-label={label}
          >
            <div className="flex items-center justify-between gap-3 text-[#f1c85b] sm:gap-5">
              <p className="text-[0.82rem] font-black uppercase tracking-normal">
                Textile data workspace
              </p>
              <Link
                className="text-[0.82rem] font-black uppercase tracking-normal underline decoration-[#f1c85b] underline-offset-4 sm:mr-12"
                href="/admin"
              >
                Admin
              </Link>
            </div>

            <HeroTitle />

            <div className="relative left-1/2 h-1 w-[100dvw] max-w-[100dvw] -translate-x-1/2 bg-[#f1c85b]" />

            {products.length ? <ProductShowcase products={products} /> : null}
            <ProductCatalog products={products} />
          </section>
        </main>
        <SiteFooter />
      </>
    </IntroReveal>
  );
}

export default async function Home() {
  const products = await getPublicProducts();

  return <HomeShell label="MMTextile textile showcase" products={products} />;
}
