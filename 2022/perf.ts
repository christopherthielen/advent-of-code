import { lpad, max, rpad } from "./util";
import * as yargs from "yargs";

export const PERF = { enabled: yargs.argv["perf"] === true };
if (PERF.enabled) process.on("beforeExit", showPerf);
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

// Class Method Decorator
export function Perf(fnname?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const getName = () => {
      const className = target?.constructor?.name;
      const methodName = fn.name;
      return `${className}.${methodName}`;
    };
    const fn = descriptor.value;
    descriptor.value = perf(fn, fnname ?? getName());
    return descriptor;
  };
}

let lastShowPerf = Date.now();

const fmt0 = Intl.NumberFormat("default", { useGrouping: true, maximumFractionDigits: 0 });
const fmt2 = Intl.NumberFormat("default", { useGrouping: true, maximumFractionDigits: 2, minimumFractionDigits: 2 });
const fmt6 = Intl.NumberFormat("default", { useGrouping: true, maximumFractionDigits: 6, minimumFractionDigits: 6 });
const boot = Date.now();

const PADDING1 = 15;
const PADDING2 = 20;

export function showPerf(interval = -1, header?: () => string) {
  if (!PERF.enabled) return;
  const padding1 = Math.max(PADDING1, max(Object.keys(data).map((str) => str.length)) ?? 0);
  const now = Date.now();
  if (now - lastShowPerf > interval) {
    lastShowPerf = now;

    if (header) {
      console.log(header());
    }
    // Render headings
    console.log(
      lpad(padding1, `elapsed: ${fmt0.format(Math.floor((Date.now() - boot) / THOUSAND))}s`) +
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
          rpad(padding1, key) +
            lpad(PADDING2, `${fmt0.format(data[key].count)}`) + // count
            lpad(PADDING2, `${fmt6.format(data[key].elapsed / BILLION)}`) + // total
            lpad(PADDING2, `${fmt6.format(data[key].elapsed / data[key].count / MILLION)}`) + // avg
            lpad(PADDING2, `${fmt2.format((data[key].count / data[key].elapsed) * BILLION)}`) // rate
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
