import assert from "node:assert/strict";
import test from "node:test";
import { parseOpenMeteo, weatherCondition } from "./open-meteo";
import { stationFor } from "./stations";

test("weather codes map to a short condition", () => {
  assert.equal(weatherCondition(0), "clear");
  assert.equal(weatherCondition(2), "cloudy");
  assert.equal(weatherCondition(61), "rain");
  assert.equal(weatherCondition(95), "thunder");
});

test("a forecast payload becomes a nursery weather report", () => {
  const station = stationFor("nursery-riyadh");
  assert.ok(station);
  const report = parseOpenMeteo(
    {
      current: {
        time: "2026-10-13T15:00",
        temperature_2m: 36.4,
        relative_humidity_2m: 18,
        precipitation: 0,
        weather_code: 0,
        wind_speed_10m: 14.2,
      },
      daily: {
        precipitation_sum: [0.2],
        et0_fao_evapotranspiration: [7.1],
        temperature_2m_max: [39],
        temperature_2m_min: [25],
      },
    },
    station,
    "en",
  );
  assert.equal(report?.place, "Riyadh");
  assert.equal(report?.temperatureC, 36.4);
  assert.equal(report?.humidityPct, 18);
  assert.equal(report?.todayEt0Mm, 7.1);
  assert.equal(report?.condition, "clear");
});

test("a payload without current air readings is ignored", () => {
  const station = stationFor("nursery-asir");
  assert.ok(station);
  assert.equal(parseOpenMeteo({ current: { time: "2026-10-13T15:00" } }, station, "ar"), null);
});
