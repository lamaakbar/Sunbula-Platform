export type WeatherStation = {
  nurseryId: string;
  placeEn: string;
  placeAr: string;
  latitude: number;
  longitude: number;
};

export const WEATHER_STATIONS: WeatherStation[] = [
  { nurseryId: "nursery-eastern", placeEn: "Dammam", placeAr: "الدمام", latitude: 26.4207, longitude: 50.0888 },
  { nurseryId: "nursery-riyadh", placeEn: "Riyadh", placeAr: "الرياض", latitude: 24.7136, longitude: 46.6753 },
  { nurseryId: "nursery-western", placeEn: "Makkah", placeAr: "مكة المكرمة", latitude: 21.3891, longitude: 39.8579 },
  { nurseryId: "nursery-qassim", placeEn: "Buraidah", placeAr: "بريدة", latitude: 26.326, longitude: 43.975 },
  { nurseryId: "nursery-asir", placeEn: "Abha", placeAr: "أبها", latitude: 18.2164, longitude: 42.5053 },
];

export function stationFor(nurseryId: string) {
  return WEATHER_STATIONS.find((station) => station.nurseryId === nurseryId) ?? null;
}
