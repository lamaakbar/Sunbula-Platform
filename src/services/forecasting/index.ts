export type ForecastResult = { status: "unavailable"; message: string };

export interface ForecastingService {
  demand(): Promise<ForecastResult>;
  shortage(): Promise<ForecastResult>;
  yield(): Promise<ForecastResult>;
  water(): Promise<ForecastResult>;
}

class UnavailableForecasting implements ForecastingService {
  async demand() {
    return {
      status: "unavailable" as const,
      message: "Demand forecasting is prepared for a later phase and is not active in this MVP.",
    };
  }
  async shortage() {
    return {
      status: "unavailable" as const,
      message: "Shortage prediction is prepared for a later phase and is not active in this MVP.",
    };
  }
  async yield() {
    return {
      status: "unavailable" as const,
      message: "Yield forecasting is prepared for a later phase and is not active in this MVP.",
    };
  }
  async water() {
    return {
      status: "unavailable" as const,
      message: "Water prediction is prepared for a later phase and is not active in this MVP.",
    };
  }
}

export function getForecastingService(): ForecastingService {
  return new UnavailableForecasting();
}
