import type { groundCopy } from "@/lib/ground-copy";
import type { NurseryWeather } from "@/lib/weather/open-meteo";

export function WeatherStrip({
  title,
  lead,
  reports,
  copy,
  names,
}: {
  title: string;
  lead: string;
  reports: NurseryWeather[];
  copy: ReturnType<typeof groundCopy>;
  names: Record<string, string>;
}) {
  return (
    <section className="mt-8 rounded-[2rem] bg-white p-4 ring-1 ring-sand sm:p-6">
      <h2 className="text-lg font-semibold text-forest">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{lead}</p>
      {reports.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{copy.weatherUnavailable}</p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <article key={report.nurseryId} className="rounded-[1.4rem] bg-cream/40 p-4 ring-1 ring-sand">
              <p className="text-sm font-semibold text-forest">{names[report.nurseryId] ?? report.place}</p>
              <p className="mt-1 text-xs text-muted">
                {copy.referencePoint}: {report.place} · {report.latitude.toFixed(2)}, {report.longitude.toFixed(2)}
              </p>
              <p className="mt-3 text-2xl font-semibold text-forest">
                {copy[report.condition]} · {round(report.temperatureC)}°C
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Fact label={copy.airHumidity} value={`${Math.round(report.humidityPct)}%`} />
                <Fact label={copy.wind} value={`${round(report.windKmh)} km/h`} />
                <Fact label={copy.rainNow} value={`${round(report.precipitationMm)} mm`} />
                <Fact label={copy.rainToday} value={report.todayRainMm == null ? "—" : `${round(report.todayRainMm)} mm`} />
                <Fact label={copy.evaporation} value={report.todayEt0Mm == null ? "—" : `${round(report.todayEt0Mm)} mm`} />
                <Fact
                  label={copy.highLow}
                  value={
                    report.todayMinC == null || report.todayMaxC == null
                      ? "—"
                      : `${round(report.todayMinC)}–${round(report.todayMaxC)}°C`
                  }
                />
              </dl>
              <p className="mt-3 text-xs text-muted">
                {copy.observed}: {report.observedAt.replace("T", " ")}
              </p>
            </article>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted">
        <a href="https://open-meteo.com/" className="font-semibold text-leaf" target="_blank" rel="noreferrer">
          {copy.weatherBy}
        </a>
      </p>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  );
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
