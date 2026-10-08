"use server";

import { cookies } from "next/headers";

export async function setLocaleAction(formData: FormData) {
  const next = formData.get("locale") === "ar" ? "ar" : "en";
  const jar = await cookies();
  jar.set("sunbula_locale", next, { path: "/", sameSite: "lax" });
}
