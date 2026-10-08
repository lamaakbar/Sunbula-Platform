import { cookies } from "next/headers";

export type Locale = "en" | "ar";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  return jar.get("sunbula_locale")?.value === "ar" ? "ar" : "en";
}
