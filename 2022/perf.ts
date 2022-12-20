// [ count, totalTicks ]
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

export function showPerf(interval = -1) {
  const now = Date.now();
  if (now - lastShowPerf > interval) {
    lastShowPerf = now;
    Object.keys(data)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        console.log(
          lpad(40, `${key} count: ${data[key].count}`) +
            lpad(40, `tot: ${data[key].elapsed}`) +
            lpad(40, `avg: ${(data[key].elapsed / data[key].count).toFixed(3)}`) +
            lpad(40, `persec: ${((data[key].count / data[key].elapsed) * 1000000000).toFixed(3)}`)
        );
      });
  }
}

export const now = (unit?: "milli" | "micro" | "nano") => {
  const hrTime = process.hrtime();

  switch (unit) {
    case "milli":
      return hrTime[0] * 1000 + hrTime[1] / 1000000;
    case "micro":
      return hrTime[0] * 1000000 + hrTime[1] / 1000;
    case "nano":
    default:
      return hrTime[0] * 1000000000 + hrTime[1];
  }
};
