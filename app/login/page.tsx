import { LoginForm } from "@/components/login-form";
import { getLocalAdminEmail, isLocalAdminSignedIn } from "@/lib/local-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  if (await isLocalAdminSignedIn()) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#050505] px-4 py-8 text-[#f7f0de] [background-image:radial-gradient(circle_at_18%_12%,rgba(241,200,91,0.16),transparent_30rem),linear-gradient(135deg,#050505_0%,#0d0a05_48%,#141007_100%)]">
      <div className="grid w-full max-w-[460px] gap-5">
        <Link className="text-[0.78rem] font-black uppercase text-[#f1c85b] underline underline-offset-4" href="/">
          Back to website
        </Link>
        <LoginForm adminEmail={getLocalAdminEmail()} />
      </div>
    </main>
  );
}
