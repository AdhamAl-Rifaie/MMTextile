import { ProductAdminWorkspace } from "@/components/product-admin-workspace";
import { signOut } from "@/app/actions";
import { getLocalProductRows, type LocalProductRow } from "@/lib/local-db";
import { isLocalAdminSignedIn, LOCAL_ADMIN_EMAIL } from "@/lib/local-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  if (!(await isLocalAdminSignedIn())) {
    redirect("/login");
  }

  const productRows: LocalProductRow[] = await getLocalProductRows();

  return (
    <main className="min-h-screen bg-[#050505] px-3 py-4 text-[#f7f0de] [background-image:radial-gradient(circle_at_18%_12%,rgba(241,200,91,0.16),transparent_30rem),linear-gradient(135deg,#050505_0%,#0d0a05_48%,#141007_100%)] sm:px-4 sm:py-6">
      <section className="mx-auto grid w-full max-w-[1480px] gap-4 sm:gap-6">
        <header className="grid gap-4 border-b border-[#f1c85b]/35 pb-4 text-[#f1c85b] sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="m-0 text-[0.78rem] font-black uppercase">MMTextile admin</p>
            <h1 className="m-0 text-[clamp(2.4rem,16vw,4.8rem)] font-black uppercase leading-none text-[#f1c85b] sm:text-[clamp(2.5rem,8vw,7rem)]">
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

        <div className="flex justify-end">
          <span className="user-pill" title={LOCAL_ADMIN_EMAIL}>
            {LOCAL_ADMIN_EMAIL}
          </span>
        </div>

        <ProductAdminWorkspace products={productRows} />
      </section>
    </main>
  );
}
