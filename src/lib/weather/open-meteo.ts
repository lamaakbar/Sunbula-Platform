import type { Locale } from "@/lib/locale";
import { stationFor, type WeatherStation } from "@/lib/weather/stations";

export type NurseryWeather = {
  nurseryId: string;
  place: string;
  latitude: number;
  longitude: number;
  observedAt: string;
  temperatureC: number;
  humidityPct: number;
  precipitationMm: number;
  windKmh: number;
  condition: WeatherCondition;
  todayRainMm: number | null;
  todayEt0Mm: number | null;
  todayMaxC: number | null;
  todayMinC: number | null;
};

export type WeatherCondition = "clear" | "cloudy" | "fog" | "rain" | "snow" | "thunder";

const CURRENT = "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m";
const DAILY = "precipitation_sum,et0_fao_evapotranspiration,temperature_2m_max,temperature_2m_min";

export function openMeteoUrl(station: WeatherStation) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(station.latitude));
  url.searchParams.set("longitude", String(station.longitude));
  url.searchParams.set("current", CURRENT);
  url.searchParams.set("daily", DAILY);
  url.searchParams.set("timezone", "Asia/Riyadh");
  url.searchParams.set("forecast_days", "1");
  return url.toString();
}

export function weatherCondition(code: number): WeatherCondition {
  if (code === 0) return "clear";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 95) return "thunder";
  return "cloudy";
}

export function parseOpenMeteo(payload: unknown, station: WeatherStation, locale: Locale): NurseryWeather | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as {
    current?: Record<string, unknown>;
    daily?: Record<string, unknown>;
  };
  const current = body.current;
  if (!current) return null;
  const temperatureC = finite(current.temperature_2m);
  const humidityPct = finite(current.relative_humidity_2m);
  const precipitationMm = finite(current.precipitation);
  const windKmh = finite(current.wind_speed_10m);
  const code = finite(current.weather_code);
  const observedAt = typeof current.time === "string" ? current.time : "";
  if (temperatureC == null || humidityPct == null || precipitationMm == null || windKmh == null || code == null || !observedAt) {
    return null;
  }
  const daily = body.daily ?? {};
  return {
    nurseryId: station.nurseryId,
    place: locale === "ar" ? station.placeAr : station.placeEn,
    latitude: station.latitude,
    longitude: station.longitude,
    observedAt,
    temperatureC,
    humidityPct,
    precipitationMm,
    windKmh,
    condition: weatherCondition(code),
    todayRainMm: firstFinite(daily.precipitation_sum),
    todayEt0Mm: firstFinite(daily.et0_fao_evapotranspiration),
    todayMaxC: firstFinite(daily.temperature_2m_max),
    todayMinC: firstFinite(daily.temperature_2m_min),
  };
}

export async function getNurseryWeather(nurseryId: string, locale: Locale): Promise<NurseryWeather | null> {
  const station = stationFor(nurseryId);
  if (!station) return null;
  try {
    const response = await fetch(openMeteoUrl(station), {
      headers: { accept: "application/json", "user-agent": "SUNBULLA/0.1" },
      next: { revalidate: 1800 },
    });
    if (!response.ok) return null;
    return parseOpenMeteo(await response.json(), station, locale);
  } catch {
    return null;
  }
}

export async function getNetworkWeather(nurseryIds: string[], locale: Locale) {
  const reports = await Promise.all(nurseryIds.map((id) => getNurseryWeather(id, locale)));
  return reports.filter((report): report is NurseryWeather => report != null);
}

function finite(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function firstFinite(value: unknown) {
  if (!Array.isArray(value)) return null;
  return finite(value[0]);
}
