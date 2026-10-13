import { NurserySummary } from "@/components/ground/NurserySummary";

export default async function EmployeeNetworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NurserySummary nurseryId={id} />;
}
