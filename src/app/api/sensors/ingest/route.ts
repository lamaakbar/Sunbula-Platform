import { NextRequest, NextResponse } from "next/server";
import type { MetricType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateReading } from "@/services/data-quality";
import { recordEvent } from "@/services/events";
import { nextLastReadingAt, parseSensorPayload, shouldStoreMeasurement } from "@/services/sensors/payload";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-sensor-secret");
  if (!secret || secret !== process.env.SENSOR_INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = parseSensorPayload(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const sensor = await prisma.sensor.findUnique({
    where: { id: parsed.payload.sensorId },
  });
  if (!sensor) return NextResponse.json({ error: "Unknown sensor" }, { status: 404 });

  const timestamp = parsed.payload.timestamp ?? new Date();
  const last = await prisma.sensorReading.findFirst({
    where: { sensorId: sensor.id },
    orderBy: { timestamp: "desc" },
  });
  const quality = validateReading(
    {
      metric: sensor.type,
      value: parsed.payload.value,
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

  const store = shouldStoreMeasurement(quality.qualityStatus, timestamp, last?.timestamp ?? null);

  await prisma.$transaction(async (tx) => {
    const reading = await tx.sensorReading.create({
      data: {
        sensorId: sensor.id,
        value: parsed.payload.value,
        unit: unitFor(sensor.type),
        qualityStatus: quality.qualityStatus,
        timestamp,
      },
    });

    const lastReadingAt = nextLastReadingAt(sensor.lastReadingAt, timestamp, store);
    if (store && lastReadingAt && lastReadingAt.getTime() !== sensor.lastReadingAt?.getTime()) {
      await tx.sensor.update({
        where: { id: sensor.id },
        data: { lastReadingAt },
      });
    }

    if (!store) {
      await recordEvent(tx, {
        eventType: "SENSOR_READING_RECEIVED",
        nurseryId: sensor.nurseryId,
        zoneId: sensor.zoneId,
        relatedEntityType: "SensorReading",
        relatedEntityId: reading.id,
        details: {
          sensorId: sensor.id,
          value: parsed.payload.value,
          metric: sensor.type,
          quality: quality.qualityStatus,
          applied: false,
          reason: quality.reasons[0] ?? "Reading was stored for audit and did not replace the latest value.",
        },
      });
      return;
    }

    const measurement = await tx.plantMeasurement.create({
      data: {
        nurseryId: sensor.nurseryId,
        zoneId: sensor.zoneId,
        sensorId: sensor.id,
        metric: sensor.type,
        value: parsed.payload.value,
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
      relatedEntityType: "PlantMeasurement",
      relatedEntityId: measurement.id,
      details: {
        sensorId: sensor.id,
        value: parsed.payload.value,
        metric: sensor.type,
        quality: quality.qualityStatus,
        applied: quality.qualityStatus === "VALID",
      },
    });
  });

  return NextResponse.json({
    ok: true,
    quality: quality.qualityStatus,
    applied: store && quality.qualityStatus === "VALID",
  });
}

function unitFor(metric: MetricType) {
  if (metric === "TEMPERATURE") return "°C";
  if (metric === "PH") return "pH";
  return "%";
}
