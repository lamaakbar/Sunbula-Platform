import { requireRole } from "@/lib/auth/current-user";
import { PlantFile } from "@/components/ground/PlantFile";
import { getLocale } from "@/lib/locale";

export default async function HqPlantPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await requireRole("HQ");
  const { code } = await params;
  return <PlantFile code={decodeURIComponent(code)} user={user} locale={await getLocale()} />;
}
