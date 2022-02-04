// [ count, totalTicks ]
import { lpad } from "./util";

export const PERF = { enabled: false };
const data: { [key: string]: { count: number; elapsed: number } } = {};

export function perf<ARG extends Function>(fn: ARG): ARG {
  if (!PERF.enabled) return fn;

  const name = fn.name;

  function _perf() {
    const ticks = now();
    const result = fn.apply(this, arguments);
    const delta = now() - ticks;
    data[name] = data[name] ?? { count: 0, elapsed: 0 };
    data[name].count++;
    data[name].elapsed += delta;
    return result;
  }

  return _perf as any as ARG;
}

export function showPerf() {
  Object.keys(data)
    .sort((a, b) => a.localeCompare(b))
    .forEach((key) => {
      console.log(
        lpad(40, `${key} count: ${data[key].count}`) +
          lpad(40, `tot: ${data[key].elapsed}`) +
          lpad(40, `avg: ${(data[key].elapsed / data[key].count).toFixed(3)}`)
      );
    });
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
