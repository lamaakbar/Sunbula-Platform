import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/Feedback";
import { growthLabel } from "@/lib/format";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();
  const entries = await prisma.plantKnowledgeBase.findMany({
    where: query
      ? {
          OR: [
            { species: { commonName: { contains: query } } },
            { species: { scientificName: { contains: query } } },
            { careGuidelines: { contains: query } },
          ],
        }
      : undefined,
    include: { species: true },
    orderBy: [{ species: { commonName: "asc" } }, { growthStage: "asc" }],
  });

  return (
    <div>
      <PageHeader title="Plant knowledge base" description="Expected ranges that give readings their meaning. Source: SANBALA demo knowledge, not official ministry data." />
      <form className="mb-6">
        <label className="sr-only" htmlFor="q">
          Search species
        </label>
        <input
          id="q"
          name="q"
          defaultValue={query}
          placeholder="Search Acacia, Ghaf, Sidr…"
          className="w-full max-w-lg rounded-2xl border border-sand bg-white px-4 py-3"
        />
      </form>
      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map((entry) => (
          <article key={entry.id} className="rounded-3xl border border-sand bg-white p-5">
            <p className="text-lg font-semibold text-forest">{entry.species.commonName}</p>
            <p className="text-sm text-muted">
              {entry.species.scientificName} · {growthLabel[entry.growthStage]}
            </p>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-muted">Moisture</dt>
                <dd className="font-semibold">{entry.expectedMoistureMin}–{entry.expectedMoistureMax}%</dd>
              </div>
              <div>
                <dt className="text-muted">pH</dt>
                <dd className="font-semibold">{entry.expectedPhMin}–{entry.expectedPhMax}</dd>
              </div>
              <div>
                <dt className="text-muted">Temp</dt>
                <dd className="font-semibold">{entry.expectedTempMin}–{entry.expectedTempMax}°C</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm">{entry.irrigationGuidance}</p>
            <p className="mt-2 text-xs text-muted">Source: {entry.source}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
