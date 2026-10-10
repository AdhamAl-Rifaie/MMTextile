import { LoginForm } from "@/components/login-form";
import { isLocalAdminSignedIn } from "@/lib/local-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  if (await isLocalAdminSignedIn()) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6f8] px-4 py-8 text-[#16436f] [background-image:radial-gradient(circle_at_18%_12%,rgba(22,67,111,0.08),transparent_30rem),linear-gradient(135deg,#f7f8fa_0%,#f1f4f7_48%,#e9eef3_100%)]">
      <div className="grid w-full max-w-[460px] gap-5">
        <Link className="text-[0.78rem] font-black uppercase text-[#16436f] underline decoration-[#16436f]/35 underline-offset-4" href="/">
          Back to website
        </Link>
        <LoginForm />
      </div>
    </main>
  );
}
