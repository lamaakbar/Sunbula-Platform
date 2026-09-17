import { AddPlantWizard } from "@/components/forms/AddPlantWizard";
import { PageHeader } from "@/components/ui/Feedback";
import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";

export default async function AddPlantPage() {
  const { zone, nurseryName } = await employeeContext();
  const [species, cells] = await Promise.all([
    prisma.species.findMany({ orderBy: { commonName: "asc" } }),
    prisma.plantCell.findMany({ where: { zoneId: zone.id }, orderBy: { code: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Add plant / batch" description="A short guided flow — nursery and zone are already filled for you." />
      <AddPlantWizard
        nurseryName={nurseryName}
        zoneName={zone.name}
        species={species.map((item) => ({ id: item.id, commonName: item.commonName }))}
        cells={cells.map((cell) => ({ id: cell.id, code: cell.code }))}
      />
    </div>
  );
}
