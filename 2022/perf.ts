import { Counter, lpad } from "./util";

export function perf<ARG extends Function>(fn: ARG, interval = 1000): ARG {
  const micros = () => {
    const hrTime = process.hrtime();
    return hrTime[0] * 1000000 + hrTime[1] / 1000;
  };
  const counter = new Counter();
  const name = fn.name;
  const COUNT = name + ".count";
  const ELAPSED = name + ".elapsed";

  let lastReport = Date.now();

  function report() {
    if (Date.now() - lastReport > interval) {
      const count = counter.get(COUNT);
      const elapsed = counter.get(ELAPSED);

      const c = lpad(20, "" + count);
      const e = lpad(20, "" + elapsed.toFixed(3));
      const avg = lpad(20, "" + (elapsed / count).toFixed(3));
      const persec = lpad(20, "" + (1000000 / (elapsed / count)).toFixed(3));
      console.log(`${lpad(12, name)} count: ${c} elapsed: ${e} µs avg: ${avg} µs ${persec}/sec`);
      lastReport = Date.now();
    }
  }

  return function () {
    const tick = micros();
    const result = fn.apply(this, arguments);
    const delta = micros() - tick;
    counter.count(name + ".count");
    counter.count(name + ".elapsed", delta);
    report();
    return result;
  } as unknown as ARG;
}
