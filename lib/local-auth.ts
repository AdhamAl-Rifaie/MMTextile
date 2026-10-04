import { cookies } from "next/headers";

export const LOCAL_ADMIN_EMAIL = "admin@email.com";
const LOCAL_ADMIN_PASSWORD = "newpassword123";
const LOCAL_ADMIN_COOKIE = "mmtextile_local_admin";
const LOCAL_ADMIN_COOKIE_VALUE = "local-admin-session-v2";

export function isValidLocalAdmin(email: string, password: string) {
  return email.trim().toLowerCase() === LOCAL_ADMIN_EMAIL && password.trim() === LOCAL_ADMIN_PASSWORD;
}

export async function isLocalAdminSignedIn() {
  const cookieStore = await cookies();

  return cookieStore.get(LOCAL_ADMIN_COOKIE)?.value === LOCAL_ADMIN_COOKIE_VALUE;
}

export async function setLocalAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(LOCAL_ADMIN_COOKIE, LOCAL_ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax"
  });
}

export async function clearLocalAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(LOCAL_ADMIN_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax"
  });
}
