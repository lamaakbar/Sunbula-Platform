import type { GrowthStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { KnowledgeContext } from "@/services/recommendations";

export async function getKnowledge(speciesId: string, growthStage: GrowthStage) {
  const row = await prisma.plantKnowledgeBase.findUnique({
    where: { speciesId_growthStage: { speciesId, growthStage } },
    include: { species: true },
  });
  if (!row) return null;

  return {
    speciesName: row.species.commonName,
    growthStage: row.growthStage,
    moisture: { min: row.expectedMoistureMin, max: row.expectedMoistureMax },
    ph: { min: row.expectedPhMin, max: row.expectedPhMax },
    temperature: { min: row.expectedTempMin, max: row.expectedTempMax },
    irrigationGuidance: row.irrigationGuidance,
    fertilizationGuidance: row.fertilizationGuidance,
    careGuidelines: row.careGuidelines,
  } satisfies KnowledgeContext;
}
