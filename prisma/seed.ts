import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const NOW = new Date("2026-09-18T08:14:00.000Z");

function hoursAgo(hours: number) {
  return new Date(NOW.getTime() - hours * 3_600_000);
}

function daysAgo(days: number) {
  return new Date(NOW.getTime() - days * 86_400_000);
}

async function main() {
  await prisma.eventHistory.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.dailyOperation.deleteMany();
  await prisma.plantImage.deleteMany();
  await prisma.healthAssessment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.plantMeasurement.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.seedlingRequest.deleteMany();
  await prisma.productionTarget.deleteMany();
  await prisma.plantKnowledgeBase.deleteMany();
  await prisma.seedlingBatch.deleteMany();
  await prisma.plantCell.deleteMany();
  await prisma.employeeZoneAssignment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.nursery.deleteMany();
  await prisma.species.deleteMany();

  const employeeHash = await bcrypt.hash("Sanbala.Employee1", 10);
  const supervisorHash = await bcrypt.hash("Sanbala.Supervisor1", 10);
  const hqHash = await bcrypt.hash("Sanbala.HQ1", 10);

  const nurseries = await Promise.all([
    prisma.nursery.create({
      data: { id: "nursery-eastern", name: "Eastern Region Nursery", region: "Eastern Province", code: "ERN", capacity: 18000 },
    }),
    prisma.nursery.create({
      data: { id: "nursery-riyadh", name: "Riyadh Nursery", region: "Riyadh", code: "RIY", capacity: 24000 },
    }),
    prisma.nursery.create({
      data: { id: "nursery-western", name: "Western Region Nursery", region: "Makkah", code: "WRN", capacity: 15000 },
    }),
    prisma.nursery.create({
      data: { id: "nursery-qassim", name: "Qassim Nursery", region: "Qassim", code: "QAS", capacity: 12000 },
    }),
    prisma.nursery.create({
      data: { id: "nursery-asir", name: "Asir Highland Nursery", region: "Asir", code: "AHN", capacity: 9000 },
    }),
  ]);

  const [eastern, riyadh, western, qassim, asir] = nurseries;

  const zones = {
    easternA: await prisma.zone.create({ data: { id: "zone-eastern-a", nurseryId: eastern.id, name: "Zone A", code: "A", capacity: 1600 } }),
    easternB: await prisma.zone.create({ data: { id: "zone-eastern-b", nurseryId: eastern.id, name: "Zone B", code: "B", capacity: 1400 } }),
    riyadhA: await prisma.zone.create({ data: { id: "zone-riyadh-a", nurseryId: riyadh.id, name: "Zone A", code: "A", capacity: 2000 } }),
    riyadhB: await prisma.zone.create({ data: { id: "zone-riyadh-b", nurseryId: riyadh.id, name: "Zone B", code: "B", capacity: 1800 } }),
    riyadhC: await prisma.zone.create({ data: { id: "zone-riyadh-c", nurseryId: riyadh.id, name: "Zone C", code: "C", capacity: 1600 } }),
    westernA: await prisma.zone.create({ data: { id: "zone-western-a", nurseryId: western.id, name: "Zone A", code: "A", capacity: 1500 } }),
    qassimA: await prisma.zone.create({ data: { id: "zone-qassim-a", nurseryId: qassim.id, name: "Zone A", code: "A", capacity: 1200 } }),
    asirA: await prisma.zone.create({ data: { id: "zone-asir-a", nurseryId: asir.id, name: "Zone A", code: "A", capacity: 1000 } }),
  };

  const species = {
    acacia: await prisma.species.create({ data: { id: "species-acacia", commonName: "Acacia", scientificName: "Acacia gerrardii", category: "Native tree" } }),
    ghaf: await prisma.species.create({ data: { id: "species-ghaf", commonName: "Ghaf", scientificName: "Prosopis cineraria", category: "Native tree" } }),
    sidr: await prisma.species.create({ data: { id: "species-sidr", commonName: "Sidr", scientificName: "Ziziphus spina-christi", category: "Native tree" } }),
    datePalm: await prisma.species.create({ data: { id: "species-date", commonName: "Date palm", scientificName: "Phoenix dactylifera", category: "Palm" } }),
    juniper: await prisma.species.create({ data: { id: "species-juniper", commonName: "Juniper", scientificName: "Juniperus procera", category: "Highland" } }),
    talh: await prisma.species.create({ data: { id: "species-talh", commonName: "Talh", scientificName: "Acacia seyal", category: "Native tree" } }),
  };

  const knowledgeRows = [
    { speciesId: species.acacia.id, stage: "GROWING" as const, m: [40, 60], pH: [6, 7.5], t: [18, 36], irrig: "Keep moisture between 40–60%. Review irrigation if the soil dries below 40%." },
    { speciesId: species.acacia.id, stage: "SEEDLING" as const, m: [45, 65], pH: [6, 7.5], t: [18, 34], irrig: "Seedlings need steadier moisture. Avoid letting soil fall below 45%." },
    { speciesId: species.ghaf.id, stage: "GROWING" as const, m: [30, 50], pH: [6.5, 8], t: [20, 40], irrig: "Ghaf is drought-tolerant. Water when moisture drops below 30%." },
    { speciesId: species.sidr.id, stage: "GROWING" as const, m: [35, 55], pH: [6, 8], t: [18, 38], irrig: "Sidr prefers moderate moisture. Irrigate if readings stay under 35%." },
    { speciesId: species.datePalm.id, stage: "GROWING" as const, m: [45, 65], pH: [6.5, 8], t: [20, 40], irrig: "Palms need consistent moisture during active growth." },
    { speciesId: species.juniper.id, stage: "GROWING" as const, m: [35, 55], pH: [5.5, 7], t: [10, 28], irrig: "Highland juniper prefers cooler, moderate moisture." },
    { speciesId: species.talh.id, stage: "GROWING" as const, m: [38, 58], pH: [6, 7.8], t: [18, 36], irrig: "Keep Talh within 38–58% moisture during growing." },
  ];

  for (const row of knowledgeRows) {
    await prisma.plantKnowledgeBase.create({
      data: {
        speciesId: row.speciesId,
        growthStage: row.stage,
        expectedMoistureMin: row.m[0],
        expectedMoistureMax: row.m[1],
        expectedPhMin: row.pH[0],
        expectedPhMax: row.pH[1],
        expectedTempMin: row.t[0],
        expectedTempMax: row.t[1],
        irrigationGuidance: row.irrig,
        fertilizationGuidance: "Apply a balanced nursery fertilizer according to the current growth stage.",
        expectedGrowth: "Steady weekly shoot growth under the listed ranges.",
        careGuidelines: "Inspect weekly, keep weeds clear, and record any discoloration.",
        source: "SANBALA demo knowledge base (fictional, for product demonstration)",
        lastReviewedAt: daysAgo(20),
      },
    });
  }

  async function makeCells(zoneId: string, nurseryId: string, prefix: string, count: number) {
    const cells = [];
    for (let i = 0; i < count; i += 1) {
      const n = i + 1;
      const code = `${prefix}-${String(n).padStart(2, "0")}`;
      const cell = await prisma.plantCell.create({
        data: {
          id: `cell-${zoneId}-${code.toLowerCase()}`,
          zoneId,
          nurseryId,
          code,
          rowIndex: Math.floor(i / 4),
          colIndex: i % 4,
        },
      });
      cells.push(cell);
    }
    return cells;
  }

  const easternACells = await makeCells(zones.easternA.id, eastern.id, "A", 16);
  const easternBCells = await makeCells(zones.easternB.id, eastern.id, "B", 8);
  const riyadhACells = await makeCells(zones.riyadhA.id, riyadh.id, "A", 8);
  const riyadhBCells = await makeCells(zones.riyadhB.id, riyadh.id, "B", 8);
  const riyadhCCells = await makeCells(zones.riyadhC.id, riyadh.id, "C", 8);
  const westernCells = await makeCells(zones.westernA.id, western.id, "A", 6);
  const qassimCells = await makeCells(zones.qassimA.id, qassim.id, "A", 6);
  const asirCells = await makeCells(zones.asirA.id, asir.id, "A", 6);

  const cellA03 = easternACells[2];

  const ahmed = await prisma.user.create({
    data: {
      id: "user-ahmed",
      fullName: "Ahmed",
      email: "ahmed@sanbala.sa",
      username: "ahmed",
      passwordHash: employeeHash,
      role: "EMPLOYEE",
      nurseryId: eastern.id,
    },
  });
  const fatima = await prisma.user.create({
    data: {
      id: "user-fatima",
      fullName: "Fatima",
      email: "fatima@sanbala.sa",
      username: "fatima",
      passwordHash: employeeHash,
      role: "EMPLOYEE",
      nurseryId: eastern.id,
    },
  });
  const nora = await prisma.user.create({
    data: {
      id: "user-nora",
      fullName: "Nora",
      email: "nora@sanbala.sa",
      username: "nora",
      passwordHash: employeeHash,
      role: "EMPLOYEE",
      nurseryId: riyadh.id,
    },
  });
  await prisma.user.create({
    data: {
      id: "user-khalid",
      fullName: "Khalid",
      email: "khalid@sanbala.sa",
      username: "khalid",
      passwordHash: supervisorHash,
      role: "SUPERVISOR",
      nurseryId: eastern.id,
    },
  });
  const sara = await prisma.user.create({
    data: {
      id: "user-sara",
      fullName: "Sara",
      email: "sara@sanbala.sa",
      username: "sara",
      passwordHash: supervisorHash,
      role: "SUPERVISOR",
      nurseryId: riyadh.id,
    },
  });
  await prisma.user.create({
    data: {
      id: "user-layla",
      fullName: "Layla",
      email: "layla@sanbala.sa",
      username: "layla",
      passwordHash: supervisorHash,
      role: "SUPERVISOR",
      nurseryId: western.id,
    },
  });
  await prisma.user.create({
    data: {
      id: "user-hq",
      fullName: "Management User",
      email: "hq@sanbala.sa",
      username: "hq",
      passwordHash: hqHash,
      role: "HQ",
    },
  });

  await prisma.employeeZoneAssignment.createMany({
    data: [
      { userId: ahmed.id, zoneId: zones.easternA.id },
      { userId: fatima.id, zoneId: zones.easternB.id },
      { userId: nora.id, zoneId: zones.riyadhA.id },
    ],
  });

  async function plantCell(opts: {
    cell: { id: string; zoneId: string; nurseryId: string; code: string };
    speciesId: string;
    qty: number;
    stage: "SEEDLING" | "GROWING" | "READY";
    health: "HEALTHY" | "ATTENTION" | "CRITICAL" | "NO_RECENT_DATA";
    planted: Date;
    moisture?: number;
    moistureHoursAgo?: number;
    source?: "SENSOR" | "MANUAL";
  }) {
    const batch = await prisma.seedlingBatch.create({
      data: {
        id: `batch-${opts.cell.id}`,
        code: `B-${opts.cell.id.replace("cell-", "")}`,
        speciesId: opts.speciesId,
        nurseryId: opts.cell.nurseryId,
        zoneId: opts.cell.zoneId,
        plantCellId: opts.cell.id,
        quantity: opts.qty,
        source: "Nursery production",
        plantingDate: opts.planted,
        growthStage: opts.stage,
        healthStatus: opts.health,
      },
    });
    if (opts.moisture != null) {
      await prisma.plantMeasurement.create({
        data: {
          nurseryId: opts.cell.nurseryId,
          zoneId: opts.cell.zoneId,
          plantCellId: opts.cell.id,
          batchId: batch.id,
          metric: "SOIL_MOISTURE",
          value: opts.moisture,
          unit: "%",
          source: opts.source ?? "SENSOR",
          qualityStatus: "VALID",
          timestamp: hoursAgo(opts.moistureHoursAgo ?? 3),
        },
      });
    }
    return batch;
  }

  const batchA03 = await prisma.seedlingBatch.create({
    data: {
      id: "batch-eastern-a-03",
      code: "B-A-03",
      speciesId: species.acacia.id,
      nurseryId: eastern.id,
      zoneId: zones.easternA.id,
      plantCellId: cellA03.id,
      quantity: 48,
      source: "Eastern production line",
      plantingDate: new Date("2026-06-01T07:00:00.000Z"),
      growthStage: "GROWING",
      healthStatus: "ATTENTION",
    },
  });

  for (const [index, cell] of easternACells.entries()) {
    if (cell.id === cellA03.id) continue;
    const critical = index === 6;
    const noData = index === 11;
    await plantCell({
      cell,
      speciesId: index % 2 === 0 ? species.acacia.id : species.ghaf.id,
      qty: 36 + index,
      stage: index > 12 ? "READY" : "GROWING",
      health: critical ? "CRITICAL" : noData ? "NO_RECENT_DATA" : "HEALTHY",
      planted: daysAgo(70 - index),
      moisture: noData ? undefined : critical ? 22 : 48 + (index % 5),
      moistureHoursAgo: noData ? undefined : critical ? 6 : 2,
    });
  }

  for (const [index, cell] of easternBCells.entries()) {
    await plantCell({
      cell,
      speciesId: species.sidr.id,
      qty: 40,
      stage: "GROWING",
      health: index === 1 ? "ATTENTION" : "HEALTHY",
      planted: daysAgo(50),
      moisture: index === 1 ? 31 : 46,
    });
  }

  for (const [index, cell] of riyadhACells.entries()) {
    await plantCell({
      cell,
      speciesId: index % 2 ? species.datePalm.id : species.acacia.id,
      qty: 60,
      stage: "GROWING",
      health: index === 2 ? "ATTENTION" : "HEALTHY",
      planted: daysAgo(40),
      moisture: index === 2 ? 33 : 52,
    });
  }
  for (const cell of [...riyadhBCells, ...riyadhCCells, ...westernCells, ...qassimCells, ...asirCells]) {
    await plantCell({
      cell,
      speciesId: species.talh.id,
      qty: 32,
      stage: "GROWING",
      health: "HEALTHY",
      planted: daysAgo(30),
      moisture: 51,
    });
  }

  const moistureSeries = [
    { value: 55, hours: 72 },
    { value: 49, hours: 48 },
    { value: 41, hours: 24 },
    { value: 34, hours: 8 },
    { value: 32, hours: 0.03 },
  ];

  const sensor = await prisma.sensor.create({
    data: {
      id: "sensor-eastern-a-moisture",
      nurseryId: eastern.id,
      zoneId: zones.easternA.id,
      name: "Zone A soil moisture",
      type: "SOIL_MOISTURE",
      status: "ONLINE",
      calibrationStatus: "CURRENT",
      lastReadingAt: hoursAgo(0.03),
    },
  });

  for (const point of moistureSeries) {
    const timestamp = hoursAgo(point.hours);
    await prisma.sensorReading.create({
      data: {
        sensorId: sensor.id,
        value: point.value,
        unit: "%",
        qualityStatus: "VALID",
        timestamp,
      },
    });
    await prisma.plantMeasurement.create({
      data: {
        nurseryId: eastern.id,
        zoneId: zones.easternA.id,
        plantCellId: cellA03.id,
        batchId: batchA03.id,
        sensorId: sensor.id,
        metric: "SOIL_MOISTURE",
        value: point.value,
        unit: "%",
        source: "SENSOR",
        qualityStatus: "VALID",
        timestamp,
      },
    });
    await prisma.eventHistory.create({
      data: {
        eventType: "SENSOR_READING_RECEIVED",
        timestamp,
        nurseryId: eastern.id,
        zoneId: zones.easternA.id,
        plantCellId: cellA03.id,
        batchId: batchA03.id,
        relatedEntityType: "Sensor",
        relatedEntityId: sensor.id,
        details: JSON.stringify({ metric: "SOIL_MOISTURE", value: point.value, cell: "A-03" }),
      },
    });
  }

  await prisma.eventHistory.create({
    data: {
      eventType: "PLANT_ADDED",
      timestamp: new Date("2026-06-01T07:10:00.000Z"),
      userId: ahmed.id,
      nurseryId: eastern.id,
      zoneId: zones.easternA.id,
      plantCellId: cellA03.id,
      batchId: batchA03.id,
      relatedEntityType: "SeedlingBatch",
      relatedEntityId: batchA03.id,
      details: JSON.stringify({ species: "Acacia", quantity: 48, cell: "A-03" }),
    },
  });

  const alert = await prisma.alert.create({
    data: {
      id: "alert-a03-moisture",
      type: "LOW_MOISTURE",
      severity: "HIGH",
      status: "OPEN",
      title: "Low moisture",
      message: "Soil moisture is 32%. Expected range for growing Acacia is 40–60%.",
      nurseryId: eastern.id,
      zoneId: zones.easternA.id,
      plantCellId: cellA03.id,
      batchId: batchA03.id,
      triggerMetric: "SOIL_MOISTURE",
      triggerValue: 32,
      createdAt: hoursAgo(8),
    },
  });

  const recommendation = await prisma.recommendation.create({
    data: {
      id: "rec-a03-irrigation",
      alertId: alert.id,
      title: "Review irrigation",
      message: "Keep moisture between 40–60%. Review irrigation if the soil dries below 40%.",
      nurseryId: eastern.id,
      zoneId: zones.easternA.id,
      plantCellId: cellA03.id,
      batchId: batchA03.id,
      createdAt: hoursAgo(8),
    },
  });

  await prisma.task.create({
    data: {
      id: "task-water-a03",
      type: "WATERING",
      title: "Watering required",
      description: "Soil moisture is below the expected range for growing Acacia. Water cell A-03 before mid-morning.",
      status: "PENDING",
      priority: "URGENT",
      dueAt: new Date("2026-09-18T07:30:00.000Z"),
      nurseryId: eastern.id,
      zoneId: zones.easternA.id,
      plantCellId: cellA03.id,
      batchId: batchA03.id,
      assigneeId: ahmed.id,
      recommendationId: recommendation.id,
      alertId: alert.id,
    },
  });

  await prisma.eventHistory.createMany({
    data: [
      {
        eventType: "ALERT_CREATED",
        timestamp: hoursAgo(8),
        nurseryId: eastern.id,
        zoneId: zones.easternA.id,
        plantCellId: cellA03.id,
        batchId: batchA03.id,
        relatedEntityType: "Alert",
        relatedEntityId: alert.id,
        details: JSON.stringify({ title: "Low moisture", value: 32, expected: "40-60" }),
      },
      {
        eventType: "RECOMMENDATION_GENERATED",
        timestamp: hoursAgo(8),
        nurseryId: eastern.id,
        zoneId: zones.easternA.id,
        plantCellId: cellA03.id,
        batchId: batchA03.id,
        relatedEntityType: "Recommendation",
        relatedEntityId: recommendation.id,
        details: JSON.stringify({ title: "Review irrigation", trigger: "Low moisture" }),
      },
      {
        eventType: "TASK_ASSIGNED",
        timestamp: hoursAgo(8),
        userId: ahmed.id,
        nurseryId: eastern.id,
        zoneId: zones.easternA.id,
        plantCellId: cellA03.id,
        batchId: batchA03.id,
        relatedEntityType: "Task",
        relatedEntityId: "task-water-a03",
        details: JSON.stringify({ title: "Watering required", assignee: "Ahmed" }),
      },
    ],
  });

  await prisma.task.create({
    data: {
      type: "INSPECTION",
      title: "Midday inspection",
      description: "Walk Zone A and note any wilted seedlings after irrigation.",
      status: "PENDING",
      priority: "MEDIUM",
      dueAt: hoursAgo(-4),
      nurseryId: eastern.id,
      zoneId: zones.easternA.id,
      assigneeId: ahmed.id,
    },
  });

  await prisma.task.create({
    data: {
      type: "INSPECTION",
      title: "Check Zone B drainage",
      description: "Three cells were slow to drain yesterday.",
      status: "OVERDUE",
      priority: "HIGH",
      dueAt: hoursAgo(20),
      nurseryId: riyadh.id,
      zoneId: zones.riyadhB.id,
      assigneeId: nora.id,
    },
  });

  await prisma.dailyOperation.create({
    data: {
      type: "INSPECTION",
      nurseryId: riyadh.id,
      zoneId: zones.riyadhA.id,
      plantCellId: riyadhACells[0].id,
      userId: nora.id,
      occurredAt: hoursAgo(5),
      notes: "Morning walkthrough",
    },
  });

  const inventoryPlan = [
    { nurseryId: eastern.id, speciesId: species.acacia.id, ready: 3120, prod: 1840 },
    { nurseryId: eastern.id, speciesId: species.ghaf.id, ready: 980, prod: 640 },
    { nurseryId: riyadh.id, speciesId: species.acacia.id, ready: 5420, prod: 2100 },
    { nurseryId: riyadh.id, speciesId: species.datePalm.id, ready: 1260, prod: 800 },
    { nurseryId: western.id, speciesId: species.sidr.id, ready: 2100, prod: 900 },
    { nurseryId: qassim.id, speciesId: species.talh.id, ready: 1680, prod: 720 },
    { nurseryId: asir.id, speciesId: species.juniper.id, ready: 740, prod: 410 },
  ];

  for (const row of inventoryPlan) {
    await prisma.inventoryItem.create({
      data: { nurseryId: row.nurseryId, speciesId: row.speciesId, state: "READY", quantity: row.ready },
    });
    await prisma.inventoryItem.create({
      data: { nurseryId: row.nurseryId, speciesId: row.speciesId, state: "IN_PRODUCTION", quantity: row.prod },
    });
  }

  await prisma.seedlingRequest.create({
    data: {
      nurseryId: eastern.id,
      speciesId: species.acacia.id,
      quantity: 5000,
      requiredDate: new Date("2026-10-15"),
      currentStock: 3120,
      reason: "Seasonal restoration planting for coastal shelterbelts.",
      purpose: "Field distribution",
      priority: "URGENT",
      notes: "Needed before autumn planting window.",
      status: "PENDING",
      submittedById: "user-khalid",
    },
  });
  await prisma.seedlingRequest.create({
    data: {
      nurseryId: riyadh.id,
      speciesId: species.datePalm.id,
      quantity: 800,
      requiredDate: new Date("2026-11-01"),
      currentStock: 1260,
      reason: "Municipal landscape programme.",
      priority: "MEDIUM",
      status: "UNDER_REVIEW",
      submittedById: sara.id,
    },
  });

  await prisma.productionTarget.create({
    data: {
      nurseryId: eastern.id,
      speciesId: species.acacia.id,
      targetQuantity: 8000,
      targetDate: new Date("2026-12-01"),
      createdById: "user-hq",
      notes: "Network target — not a transfer instruction.",
    },
  });

  await prisma.sensor.createMany({
    data: [
      { id: "sensor-riyadh-a-temp", nurseryId: riyadh.id, zoneId: zones.riyadhA.id, name: "Riyadh A temperature", type: "TEMPERATURE", status: "ONLINE", calibrationStatus: "CURRENT" },
      { id: "sensor-eastern-a-ph", nurseryId: eastern.id, zoneId: zones.easternA.id, name: "Zone A pH", type: "PH", status: "ONLINE", calibrationStatus: "CURRENT" },
    ],
  });

  await prisma.plantMeasurement.create({
    data: {
      nurseryId: eastern.id,
      zoneId: zones.easternA.id,
      plantCellId: cellA03.id,
      batchId: batchA03.id,
      metric: "PH",
      value: 6.4,
      unit: "pH",
      source: "MANUAL",
      qualityStatus: "VALID",
      recordedById: ahmed.id,
      timestamp: hoursAgo(26),
      notes: "Manual morning check",
    },
  });

  console.log("SANBALA demo data is ready.");
  console.log("Employee: ahmed@sanbala.sa / Sanbala.Employee1");
  console.log("Eastern supervisor: khalid@sanbala.sa / Sanbala.Supervisor1");
  console.log("Riyadh supervisor: sara@sanbala.sa / Sanbala.Supervisor1");
  console.log("HQ: hq@sanbala.sa / Sanbala.HQ1");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
