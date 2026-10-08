import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateReading } from "@/services/data-quality";
import { evaluateReading } from "@/services/alerts/engine";
import { recordEvent } from "@/services/events";
import type { MetricType } from "@prisma/client";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-sensor-secret");
  if (!secret || secret !== process.env.SENSOR_INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    sensorId: string;
    value: number;
    timestamp?: string;
  };

  const sensor = await prisma.sensor.findUnique({
    where: { id: body.sensorId },
    include: { zone: true },
  });
  if (!sensor) return NextResponse.json({ error: "Unknown sensor" }, { status: 404 });

  const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();
  const last = await prisma.sensorReading.findFirst({
    where: { sensorId: sensor.id },
    orderBy: { timestamp: "desc" },
  });
  const quality = validateReading(
    {
      metric: sensor.type,
      value: body.value,
      unit: unitFor(sensor.type),
      source: "SENSOR",
      timestamp,
      sensorId: sensor.id,
    },
    { lastTimestamp: last?.timestamp },
  );

  if (quality.qualityStatus === "INVALID") {
    return NextResponse.json({ ok: false, quality }, { status: 422 });
  }

  // Zone-level sensors must not be attributed to an arbitrary cell or batch.
  const cell = null;
  const batch = null;
  const knowledge = null;
  const assignee = await prisma.employeeZoneAssignment.findFirst({ where: { zoneId: sensor.zoneId } });

  await prisma.$transaction(async (tx) => {
    await tx.sensorReading.create({
      data: {
        sensorId: sensor.id,
        value: body.value,
        unit: unitFor(sensor.type),
        qualityStatus: quality.qualityStatus,
        timestamp,
      },
    });
    await tx.sensor.update({
      where: { id: sensor.id },
      data: { lastReadingAt: timestamp },
    });
    const measurement = await tx.plantMeasurement.create({
      data: {
        nurseryId: sensor.nurseryId,
        zoneId: sensor.zoneId,
        plantCellId: cell?.id,
        batchId: batch?.id,
        sensorId: sensor.id,
        metric: sensor.type,
        value: body.value,
        unit: unitFor(sensor.type),
        source: "SENSOR",
        qualityStatus: quality.qualityStatus,
        timestamp,
      },
    });
    await recordEvent(tx, {
      eventType: "SENSOR_READING_RECEIVED",
      nurseryId: sensor.nurseryId,
      zoneId: sensor.zoneId,
      plantCellId: cell?.id,
      batchId: batch?.id,
      relatedEntityType: "PlantMeasurement",
      relatedEntityId: measurement.id,
      details: { sensorId: sensor.id, value: body.value, metric: sensor.type },
    });
    await evaluateReading(tx, {
      nurseryId: sensor.nurseryId,
      zoneId: sensor.zoneId,
      plantCellId: cell?.id,
      batchId: batch?.id,
      metric: sensor.type,
      value: body.value,
      knowledge,
      assigneeId: assignee?.userId,
    });
  });

  return NextResponse.json({ ok: true, quality: quality.qualityStatus });
}

function unitFor(metric: MetricType) {
  if (metric === "TEMPERATURE") return "°C";
  if (metric === "PH") return "pH";
  return "%";
}
