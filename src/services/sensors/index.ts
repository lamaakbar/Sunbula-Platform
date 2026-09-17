import type { MetricType } from "@prisma/client";

export type NormalizedSensorReading = {
  sensorId: string;
  metric: MetricType;
  value: number;
  unit: string;
  timestamp: Date;
};

export interface SensorIngestAdapter {
  name: string;
  pullReadings(): Promise<NormalizedSensorReading[]>;
}

export class MockSensorAdapter implements SensorIngestAdapter {
  name = "mock";

  async pullReadings(): Promise<NormalizedSensorReading[]> {
    return [];
  }
}

export function getSensorAdapter(): SensorIngestAdapter {
  const mode = process.env.SENSOR_ADAPTER ?? "mock";
  if (mode === "mock") return new MockSensorAdapter();
  return new MockSensorAdapter();
}
