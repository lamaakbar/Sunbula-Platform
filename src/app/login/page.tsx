import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/constants";

export default async function LoginAliasPage() {
  const session = await getSession();
  if (session) redirect(ROLE_HOME[session.role]);
  redirect("/");
}
