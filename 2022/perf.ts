import { lpad } from "./util";

export const PERF = { enabled: false };
const data: { [key: string]: { count: number; elapsed: number } } = {};

export function perf<ARG extends Function>(fn: ARG, fnname = fn.name): ARG {
  if (!PERF.enabled) return fn;

  function _perf() {
    const ticks = now();
    const result = fn.apply(this, arguments);
    const delta = now() - ticks;
    data[fnname] = data[fnname] ?? { count: 0, elapsed: 0 };
    data[fnname].count++;
    data[fnname].elapsed += delta;
    return result;
  }

  return _perf as any as ARG;
}

let lastShowPerf = Date.now();

const fmt0 = Intl.NumberFormat("default", { useGrouping: true, maximumFractionDigits: 0 });
const fmt3 = Intl.NumberFormat("default", { useGrouping: true, maximumFractionDigits: 6, minimumFractionDigits: 6 });
const boot = Date.now();

export function showPerf(interval = -1, header?: () => string) {
  const now = Date.now();
  if (now - lastShowPerf > interval) {
    const PADDING1 = 15;
    const PADDING2 = 20;
    lastShowPerf = now;

    if (header) {
      console.log(header());
    }
    // Render headings
    console.log(
      lpad(PADDING1, `elapsed: ${fmt0.format(Math.floor((Date.now() - boot) / THOUSAND))}s`) +
        lpad(PADDING2, `Count`) +
        lpad(PADDING2, `Total (sec)`) +
        lpad(PADDING2, `Average (ms)`) +
        lpad(PADDING2, `Rate (count/sec)`)
    );

    // Render data
    Object.keys(data)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        console.log(
          lpad(PADDING1, key) +
            lpad(PADDING2, `${fmt0.format(data[key].count)}`) + // count
            lpad(PADDING2, `${fmt3.format(data[key].elapsed / BILLION)}`) + // total
            lpad(PADDING2, `${fmt3.format(data[key].elapsed / data[key].count / MILLION)}`) + // avg
            lpad(PADDING2, `${fmt0.format((data[key].count / data[key].elapsed) * BILLION)}`) // rate
        );
      });
  }
}

const THOUSAND = 1000;
const MILLION = 1000000;
const BILLION = 1000000000;

export const now = (unit: "milli" | "micro" | "nano" = "nano") => {
  const hrTime = process.hrtime();

  switch (unit) {
    case "milli":
      return hrTime[0] * THOUSAND + hrTime[1] / MILLION;
    case "micro":
      return hrTime[0] * MILLION + hrTime[1] / THOUSAND;
    case "nano":
    default:
      return hrTime[0] * BILLION + hrTime[1];
  }
};
