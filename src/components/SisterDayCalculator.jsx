import { useMemo, useState } from "react";
import { locations } from "../lib/locations.js";
import {
  dayOfYear,
  sisterDay,
  summerSolsticeDoy,
  thermalLag,
  winterSolsticeDoy,
} from "../lib/sister-day.js";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const SHORT_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const shortMonth = (d) => SHORT_FMT.format(d);

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const POINT_COLORS = {
  warming: "#059669", // emerald-600
  cooling: "#e11d48", // rose-600
  cold: "#0284c7", // sky-600
  hot: "#d97706", // amber-600
  solstice: "#7c3aed", // violet-600
};

export default function SisterDayCalculator({ commitSha = "dev" }) {
  const [dateValue, setDateValue] = useState(todayIso());
  const [locationIndex, setLocationIndex] = useState(0);

  const location = locations[locationIndex];

  const result = useMemo(() => {
    if (!dateValue) return null;
    const D = new Date(`${dateValue}T12:00:00`);
    if (Number.isNaN(D.getTime())) return null;

    const yr = D.getFullYear();
    const C = new Date(yr, location.cold[0] - 1, location.cold[1], 12);
    const H = new Date(yr, location.hot[0] - 1, location.hot[1], 12);

    const { n, warmDate, coolDate } = sisterDay(D, C);
    const wSolDoy = winterSolsticeDoy(location.h);
    const sSolDoy = summerSolsticeDoy(location.h);
    const wSolDate = new Date(yr, 0, wSolDoy, 12);
    const lag = thermalLag(wSolDoy, dayOfYear(C));

    return { D, C, H, warmDate, coolDate, n, wSolDoy, sSolDoy, wSolDate, lag, yr };
  }, [dateValue, location]);

  const shortShaHref = commitSha && commitSha !== "dev" && commitSha !== "unknown"
    ? `https://github.com/ekalvi/sister-day/commit/${commitSha}`
    : "https://github.com/ekalvi/sister-day";
  const shortSha = commitSha && commitSha !== "dev" && commitSha !== "unknown"
    ? commitSha.slice(0, 7)
    : commitSha;

  return (
    <div
      className="min-h-screen bg-zinc-50 text-zinc-900 antialiased"
      style={{
        fontFamily:
          '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        .num { font-variant-numeric: tabular-nums; }
        .mono { font-family: "Geist Mono", ui-monospace, monospace; font-variant-numeric: tabular-nums; }
      `}</style>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-8">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
            <img src="/favicon.svg" alt="" aria-hidden="true" className="h-3.5 w-3.5" />
            Sister Day
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            The mirror date across winter&rsquo;s coldest point
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">
            Every date has a <span className="font-medium text-zinc-900">sister day</span> &mdash; a partner date on
            the other side of winter that shares the same distance from the coldest day of the year. Pick a chilly November
            afternoon and its sister might be a cool day in early March. They&rsquo;re mirror images in the year&rsquo;s
            temperature arc, one on the way down and one on the way back up.
          </p>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Your date">
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none"
            />
          </Field>
          <Field
            label="Location"
            hint={`Coldest avg day: ${shortMonth(new Date(2026, location.cold[0] - 1, location.cold[1]))}`}
          >
            <select
              value={locationIndex}
              onChange={(e) => setLocationIndex(parseInt(e.target.value, 10))}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none"
            >
              {locations.map((loc, i) => (
                <option key={loc.name} value={i}>{loc.name}</option>
              ))}
            </select>
          </Field>
        </section>

        {result && (
          <>
            <ResultCard result={result} />
            <LagCard result={result} cityName={location.name} />
          </>
        )}

        <DefinitionCard />

        <footer className="mt-10 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500">
          <span>A concept by Erik Kalviainen · Built with Claude · </span>
          <a href="https://github.com/ekalvi/sister-day" className="underline-offset-2 hover:text-zinc-900 hover:underline">GitHub</a>
          <span> · </span>
          <a href={shortShaHref} className="mono underline-offset-2 hover:text-zinc-900 hover:underline">v{shortSha}</a>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      {children}
      {hint && <span className="min-h-[1.2em] text-xs font-medium text-sky-600">{hint}</span>}
    </label>
  );
}

function ResultCard({ result }) {
  const { warmDate, coolDate, n, C } = result;
  return (
    <article className="mb-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <DayBadge tone="warming" label="warming" date={warmDate} />
        <span className="text-zinc-300" aria-hidden="true">⟷</span>
        <DayBadge tone="cooling" label="cooling" date={coolDate} />
      </div>
      <p className="mt-6 text-center text-sm text-zinc-600">
        Both <span className="font-medium text-sky-700 num">{n} days</span> from the coldest day ({shortMonth(C)})
      </p>
      <div className="mx-auto mt-6 aspect-square w-full max-w-[420px]">
        <OrbitalSvg result={result} />
      </div>
      <Legend />
    </article>
  );
}

const TONE_STYLES = {
  warming: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cooling: "border-rose-200 bg-rose-50 text-rose-700",
};

function DayBadge({ tone, label, date }) {
  return (
    <div className={`flex min-w-[140px] flex-col items-center rounded-xl border px-5 py-3 ${TONE_STYLES[tone]}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      <span className="mt-1 text-xl font-semibold tracking-tight num">{shortMonth(date)}</span>
    </div>
  );
}

function Legend() {
  const items = [
    { label: "Warming side", color: POINT_COLORS.warming },
    { label: "Cooling side", color: POINT_COLORS.cooling },
    { label: "Coldest day", color: POINT_COLORS.cold },
    { label: "Warmest day", color: POINT_COLORS.hot },
    { label: "Winter solstice", color: POINT_COLORS.solstice },
    { label: "Summer solstice", color: POINT_COLORS.hot, opacity: 0.45 },
  ];
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-zinc-500">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: it.color, opacity: it.opacity ?? 1 }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function LagCard({ result, cityName }) {
  const { wSolDate, C, lag } = result;
  return (
    <article className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-lg font-semibold text-violet-700">Why not the solstice?</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        The winter solstice marks the day the sun sits lowest in the sky &mdash; the most oblique angle of incidence and
        the least solar energy per square metre of ground. Yet the coldest day arrives weeks later. This is{" "}
        <span className="font-medium text-zinc-900">thermal lag</span>: the earth and atmosphere keep radiating stored heat
        even after the sun begins its climb back. It&rsquo;s the same reason late afternoon is hotter than solar noon,
        scaled to an entire hemisphere.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <LagStat
          value={shortMonth(wSolDate)}
          label="Winter solstice (min sun angle)"
          color={POINT_COLORS.solstice}
        />
        <LagStat
          value={shortMonth(C)}
          label="Coldest day (min temperature)"
          color={POINT_COLORS.cold}
        />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600">
        For <span className="font-medium text-zinc-900">{cityName}</span>, this thermal lag is{" "}
        <span className="font-medium text-zinc-900 num">{lag} days</span> &mdash; the atmosphere needs that long to exhaust
        its stored warmth after the solstice turns the corner.
      </p>
    </article>
  );
}

function LagStat({ value, label, color }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-center">
      <div className="text-xl font-semibold tracking-tight num" style={{ color }}>{value}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</div>
    </div>
  );
}

function DefinitionCard() {
  return (
    <aside className="mb-2 rounded-xl border border-zinc-200 border-l-2 border-l-sky-500 bg-sky-50/40 px-5 py-4 text-sm leading-relaxed text-zinc-600">
      <span className="font-medium text-zinc-900">Formal definition</span> &mdash; For a given location, let{" "}
      <em className="not-italic font-medium text-zinc-900">C</em> denote the calendar date with the lowest long-term average
      daily temperature. The <em className="not-italic">sister day</em> of a date{" "}
      <em className="not-italic font-medium text-zinc-900">D</em> is the unique date{" "}
      <em className="not-italic font-medium text-zinc-900">D&prime;</em> equidistant from{" "}
      <em className="not-italic font-medium text-zinc-900">C</em> on the opposite side of the annual temperature cycle
      &mdash; if <em className="not-italic font-medium text-zinc-900">D</em> falls{" "}
      <em className="not-italic">n</em> days after{" "}
      <em className="not-italic font-medium text-zinc-900">C</em>, then{" "}
      <em className="not-italic font-medium text-zinc-900">D&prime;</em> falls{" "}
      <em className="not-italic">n</em> days before{" "}
      <em className="not-italic font-medium text-zinc-900">C</em>, and vice versa.
    </aside>
  );
}

// ---- Orbital SVG ---------------------------------------------------------

function polar(deg, cx, cy, r) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

const doyToAng = (doy) => (doy / 365) * 360 - 90;

function svgArcPath(cx, cy, r, a1, a2) {
  let sweep = a2 - a1;
  if (sweep < 0) sweep += 360;
  if (sweep <= 0.1) return "";
  const large = sweep > 180 ? 1 : 0;
  const [x1, y1] = polar(a1, cx, cy, r);
  const [x2, y2] = polar(a2, cx, cy, r);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

function OrbitalSvg({ result }) {
  const { C, H, warmDate, coolDate, wSolDoy, sSolDoy, lag, yr } = result;
  const CX = 220;
  const CY = 220;
  const R = 155;

  const cA = doyToAng(dayOfYear(C));
  const wA = doyToAng(dayOfYear(warmDate));
  const fA = doyToAng(dayOfYear(coolDate));
  const hA = doyToAng(dayOfYear(H));
  const wSolA = doyToAng(wSolDoy);
  const sSolA = doyToAng(sSolDoy);

  const arcW = svgArcPath(CX, CY, R, cA, wA);
  const arcF = svgArcPath(CX, CY, R, fA, cA);
  const lagArc = svgArcPath(CX, CY, R + 14, wSolA, cA);

  let lagSweep = cA - wSolA;
  if (lagSweep < 0) lagSweep += 360;
  const lagMidA = lagSweep > 180 ? wSolA + (lagSweep - 360) / 2 : wSolA + lagSweep / 2;
  const [llx, lly] = polar(lagMidA, CX, CY, R + 28);

  const ticks = [];
  for (let m = 0; m < 12; m++) {
    const mStart = new Date(yr, m, 1);
    const a = doyToAng(dayOfYear(mStart));
    const [t1x, t1y] = polar(a, CX, CY, R - 6);
    const [t2x, t2y] = polar(a, CX, CY, R + 6);
    const mid = new Date(yr, m, 16);
    const la = doyToAng(dayOfYear(mid));
    const [tlx, tly] = polar(la, CX, CY, R - 26);
    ticks.push(
      <g key={m}>
        <line x1={t1x} y1={t1y} x2={t2x} y2={t2y} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
        <text
          x={tlx}
          y={tly + 4}
          textAnchor="middle"
          fontSize="11"
          fill="rgba(0,0,0,0.45)"
          fontWeight="500"
        >
          {MONTH_NAMES[m]}
        </text>
      </g>,
    );
  }

  const rays = [];
  for (let i = -2; i <= 2; i++) {
    const rA = sSolA + i * 4;
    const [rx1, ry1] = polar(rA, CX, CY, R + 5);
    const [rx2, ry2] = polar(rA, CX, CY, R + 16 + (i === 0 ? 5 : 0));
    rays.push(
      <line
        key={i}
        x1={rx1}
        y1={ry1}
        x2={rx2}
        y2={ry2}
        stroke={POINT_COLORS.hot}
        strokeWidth={i === 0 ? 2 : 1}
        opacity={i === 0 ? 0.5 : 0.3}
        strokeLinecap="round"
      />,
    );
  }

  const pts = {
    c: { xy: polar(cA, CX, CY, R), lbl: polar(cA, CX, CY, R + 30) },
    h: { xy: polar(hA, CX, CY, R), lbl: polar(hA, CX, CY, R + 30) },
    w: { xy: polar(wA, CX, CY, R), lbl: polar(wA, CX, CY, R + 30) },
    f: { xy: polar(fA, CX, CY, R), lbl: polar(fA, CX, CY, R + 30) },
    ws: { xy: polar(wSolA, CX, CY, R), lbl: polar(wSolA, CX, CY, R + 30) },
    ss: { xy: polar(sSolA, CX, CY, R), lbl: polar(sSolA, CX, CY, R + 30) },
  };

  const [sa1x, sa1y] = polar(wSolA, CX, CY, R - 10);
  const [sa2x, sa2y] = polar(sSolA, CX, CY, R - 10);

  const winterLabel = wSolDoy === 355 ? "Dec solstice" : "Jun solstice";
  const summerLabel = sSolDoy === 172 ? "Jun solstice" : "Dec solstice";

  return (
    <svg viewBox="0 0 440 440" className="h-full w-full">
      {ticks}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />

      <line
        x1={sa1x}
        y1={sa1y}
        x2={sa2x}
        y2={sa2y}
        stroke="rgba(124,58,237,0.3)"
        strokeWidth="1"
        strokeDasharray="4 8"
      />

      <line
        x1={pts.c.xy[0]}
        y1={pts.c.xy[1]}
        x2={CX}
        y2={CY}
        stroke="rgba(2,132,199,0.25)"
        strokeWidth="1"
        strokeDasharray="4 6"
      />
      <line
        x1={pts.h.xy[0]}
        y1={pts.h.xy[1]}
        x2={CX}
        y2={CY}
        stroke="rgba(217,119,6,0.25)"
        strokeWidth="1"
        strokeDasharray="4 6"
      />

      <path
        d={lagArc}
        fill="none"
        stroke="rgba(124,58,237,0.4)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      <text
        x={llx}
        y={lly + 4}
        textAnchor="middle"
        fontSize="11"
        fill="rgba(124,58,237,0.75)"
        fontWeight="500"
      >
        {lag}d lag
      </text>

      <path d={arcW} fill="none" stroke={POINT_COLORS.warming} strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
      <path d={arcF} fill="none" stroke={POINT_COLORS.cooling} strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />

      {rays}

      <circle cx={pts.ss.xy[0]} cy={pts.ss.xy[1]} r="5.5" fill={POINT_COLORS.hot} opacity="0.45" />
      <text
        x={pts.ss.lbl[0]}
        y={pts.ss.lbl[1] + 5}
        textAnchor="middle"
        fontSize="11"
        fill={POINT_COLORS.hot}
        opacity="0.6"
        fontWeight="500"
      >
        {summerLabel}
      </text>

      <circle cx={pts.ws.xy[0]} cy={pts.ws.xy[1]} r="5.5" fill={POINT_COLORS.solstice} opacity="0.7" />
      <text
        x={pts.ws.lbl[0]}
        y={pts.ws.lbl[1] + 5}
        textAnchor="middle"
        fontSize="11"
        fill={POINT_COLORS.solstice}
        fontWeight="500"
        opacity="0.85"
      >
        {winterLabel}
      </text>

      <circle cx={pts.h.xy[0]} cy={pts.h.xy[1]} r="6" fill={POINT_COLORS.hot} opacity="0.75" />
      <text
        x={pts.h.lbl[0]}
        y={pts.h.lbl[1] + 5}
        textAnchor="middle"
        fontSize="12"
        fill={POINT_COLORS.hot}
        fontWeight="600"
      >
        {shortMonth(H)}
      </text>

      <circle cx={pts.c.xy[0]} cy={pts.c.xy[1]} r="6.5" fill={POINT_COLORS.cold} />
      <text
        x={pts.c.lbl[0]}
        y={pts.c.lbl[1] + 5}
        textAnchor="middle"
        fontSize="12"
        fill={POINT_COLORS.cold}
        fontWeight="600"
      >
        {shortMonth(C)}
      </text>

      <circle cx={pts.w.xy[0]} cy={pts.w.xy[1]} r="7" fill={POINT_COLORS.warming} />
      <text
        x={pts.w.lbl[0]}
        y={pts.w.lbl[1] + 5}
        textAnchor="middle"
        fontSize="12.5"
        fill={POINT_COLORS.warming}
        fontWeight="600"
      >
        {shortMonth(warmDate)}
      </text>

      <circle cx={pts.f.xy[0]} cy={pts.f.xy[1]} r="7" fill={POINT_COLORS.cooling} />
      <text
        x={pts.f.lbl[0]}
        y={pts.f.lbl[1] + 5}
        textAnchor="middle"
        fontSize="12.5"
        fill={POINT_COLORS.cooling}
        fontWeight="600"
      >
        {shortMonth(coolDate)}
      </text>
    </svg>
  );
}
