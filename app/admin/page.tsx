import { ProductAdminWorkspace } from "@/components/product-admin-workspace";
import { signOut } from "@/app/actions";
import { getLocalProductRows, type LocalProductRow } from "@/lib/local-db";
import { isLocalAdminSignedIn } from "@/lib/local-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  if (!(await isLocalAdminSignedIn())) {
    redirect("/login");
  }

  const productRows: LocalProductRow[] = await getLocalProductRows();

  return (
    <main className="min-h-screen bg-[#f4f6f8] px-3 py-4 text-[#16436f] [background-image:radial-gradient(circle_at_18%_12%,rgba(22,67,111,0.08),transparent_30rem),linear-gradient(135deg,#f7f8fa_0%,#f1f4f7_48%,#e9eef3_100%)] sm:px-4 sm:py-6">
      <section className="mx-auto grid w-full max-w-[1480px] gap-4 sm:gap-6">
        <header className="grid gap-4 border-b border-[#16436f]/25 pb-4 text-[#16436f] sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="m-0 text-[0.78rem] font-black uppercase">MMTextile admin</p>
            <h1 className="m-0 text-[clamp(2.4rem,16vw,4.8rem)] font-black uppercase leading-none text-[#16436f] sm:text-[clamp(2.5rem,8vw,7rem)]">
              Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link className="secondary-button grid place-items-center no-underline" href="/">
              Website
            </Link>
            <form action={signOut}>
              <button className="secondary-button w-full" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <ProductAdminWorkspace products={productRows} />
      </section>
    </main>
  );
}
