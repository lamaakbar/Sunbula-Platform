import { NurserySummary } from "@/components/ground/NurserySummary";

export default async function SupervisorNetworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NurserySummary nurseryId={id} />;
}
