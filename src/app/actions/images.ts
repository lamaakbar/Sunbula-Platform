"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/current-user";
import { getAccessibleCell } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { recordEvent } from "@/services/events";
import { getHealthClassifier } from "@/services/health-classification";
import type { ActionState } from "@/app/actions/operations";

export async function uploadPlantImageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("EMPLOYEE");
  const cellId = String(formData.get("cellId") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const file = formData.get("image");

  if (!cellId) return { error: "Missing cell." };
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }

  const cell = await getAccessibleCell(user, cellId);
  const batch = await prisma.seedlingBatch.findFirst({
    where: { plantCellId: cell.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  const allowedTypes: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Images must be 5 MB or smaller." };
  const ext = allowedTypes[file.type];
  if (!ext) return { error: "Only JPEG, PNG and WebP images are supported." };
  const bytes = Buffer.from(await file.arrayBuffer());
  const validSignature =
    (file.type === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
    (file.type === "image/png" && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (file.type === "image/webp" && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP");
  if (!validSignature) return { error: "The uploaded file is not a valid supported image." };

  const fileName = `${cell.id}-${Date.now()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), bytes);
  const filePath = `/uploads/${fileName}`;

  const classifier = getHealthClassifier();
  const result = await classifier.classify(filePath);

  const image = await prisma.plantImage.create({
    data: {
      nurseryId: cell.nurseryId,
      zoneId: cell.zoneId,
      plantCellId: cell.id,
      batchId: batch?.id,
      speciesId: batch?.speciesId,
      userId: user.id,
      filePath,
      notes: notes || null,
      classificationLabel: result.status === "demo" ? result.label : null,
      classificationIsDemo: result.status === "demo",
    },
  });

  await recordEvent(prisma, {
    eventType: "IMAGE_UPLOADED",
    userId: user.id,
    nurseryId: cell.nurseryId,
    zoneId: cell.zoneId,
    plantCellId: cell.id,
    batchId: batch?.id,
    relatedEntityType: "PlantImage",
    relatedEntityId: image.id,
    details: {
      filePath,
      demoClassification: result.status === "demo" ? result.label : null,
    },
  });

  revalidatePath(`/employee/zone/${cell.id}`);
  redirect(`/employee/zone/${cell.id}?saved=image`);
}
