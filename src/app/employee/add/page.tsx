import { AddPlantWizard } from "@/components/forms/AddPlantWizard";
import { PageHeader } from "@/components/ui/Feedback";
import { employeeContext } from "@/lib/data/employee";
import { prisma } from "@/lib/prisma";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function AddPlantPage() {
  const { zoneLabel, zoneIds, nurseryName } = await employeeContext();
  const copy = messages(await getLocale());
  const [species, cells] = await Promise.all([
    prisma.species.findMany({ orderBy: { commonName: "asc" } }),
    prisma.plantCell.findMany({ where: { zoneId: { in: zoneIds } }, orderBy: { code: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title={copy.employee.addTitle} description={copy.employee.addLead} />
      <AddPlantWizard
        nurseryName={nurseryName}
        zoneName={zoneLabel}
        species={species.map((item) => ({ id: item.id, commonName: item.commonName }))}
        cells={cells.map((cell) => ({ id: cell.id, code: cell.code }))}
      />
    </div>
  );
}
