import { lpad, rpad } from "./util";
import { DateTime, Duration } from "luxon";

const start = Date.now();
let ticks = start;

export const progress = (intervalms: number, count: number, total: number) => {
  if (Date.now() - ticks > intervalms) {
    ticks = Date.now();
    const percent = count / total;
    const elapsed = DateTime.fromMillis(start).toRelative();
    const remaining = DateTime.fromMillis(start + (Date.now() - start) / percent).toRelative();
    const countStr = lpad(30, "" + count);
    const totalStr = rpad(30, "" + total);
    const percentStr = (percent * 100).toFixed(2);
    console.log(`${percentStr}% ${countStr}/${totalStr} started ${elapsed} completion ${remaining}`);
  }
};
