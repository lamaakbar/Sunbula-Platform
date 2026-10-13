import { requireRole } from "@/lib/auth/current-user";
import { PlantFile } from "@/components/ground/PlantFile";
import { getLocale } from "@/lib/locale";

export default async function SupervisorPlantPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await requireRole("SUPERVISOR");
  const { code } = await params;
  return <PlantFile code={code} user={user} locale={await getLocale()} />;
}
