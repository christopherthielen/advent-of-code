import * as fs from "fs";
import { isEqual } from "lodash";

export const toInt = (str: string) => parseInt(str, 10);
export const without = <T>(items: T[], ...withoutItems: T[]) => items.filter((x) => !withoutItems.includes(x));
export const uniqR = <T>(acc: T[], item: T): T[] => (acc.includes(item) ? acc : acc.concat(item));
export const uniqUsingIsEqualR = <T>(acc: T[], item: T): T[] => {
  if (!acc.some((x) => isEqual(x, item))) {
    acc.push(item);
  }
  return acc;
};
export const product = <T, T2>(array1: T[], array2: T2[]) => array1.map((val1) => array2.map((val2) => [val1, val2])).flat(1) as [T, T2][];
// export const combine2 = <T>(items: T[]) => combine(items, 2) as Array<[T, T]>;
// export const combine3 = <T>(items: T[]) => combine(items, 3) as Array<[T, T, T]>;
// export const combine = <T>(items: T[], count: number): Array<T[]> => {
//   if (count === 1) return items.map((x) => [x]);
//   if (items.length < count) return [];
//   return items.reduce((acc, item, idx) => {
//     const rest = combine(items.slice(idx + 1), count - 1);
//     return acc.concat(rest.map((x) => [items[idx], ...x]));
//   }, []);
// };

export const lpad = (count: number, str: string) => new Array(Math.max(0, count - str.length)).fill(" ").join("") + str;
export const rpad = (count: number, str: string) => str + new Array(Math.max(0, count - str.length)).fill(" ").join("");

export const permutations = <T>(items: T[]): Array<T[]> => {
  if (items.length === 2) return [items.slice(), items.reverse()];
  return items.map((item) => permutations(without(items, item)).map((sublist) => [item, ...sublist])).flat();
};

export const range = (start: number, end: number): number[] => {
  const low = Math.min(start, end);
  const high = Math.max(start, end);
  const result = [];
  for (let i = low; i <= high; i++) {
    result.push(i);
  }
  return start < end ? result : result.reverse();
};

// export function groupBy<T, T2 = T>(array: T[], key: string | ((val: T) => string), value: (val: T) => T2): { [key: string]: any } {
//   return array.reduce((acc, item) => {
//     const group = typeof key === "string" ? key : key(item);
//     acc[group] = acc[group] ?? [];
//     acc[group].push(value(item));
//     return acc;
//   }, {});
// }

export class Counter extends Map {
  constructor() {
    super();
  }

  count(key: string, delta = 1) {
    if (!this.has(key)) {
      this.set(key, delta);
    } else {
      this.set(key, this.get(key) + delta);
    }
  }
}

export class CounterTimer extends Counter {
  constructor(public reportIntervalMs: number = 10000) {
    super();
  }

  private lastReportTime = Date.now();

  count(key: string, delta = 1) {
    super.count(key, delta);
    if (Date.now() - this.lastReportTime > this.reportIntervalMs) {
      this.report();
    }
  }

  report() {
    this.lastReportTime = Date.now();
    [...this.keys()].sort().forEach((key) => {
      console.log(`Count ${key}: ${this.get(key)}`);
    });
  }
}

export function readLines(filename: string, filterBlankLines = true): string[] {
  return readFile(filename)
    .split(/[\r\n]/)
    .filter((x) => !filterBlankLines || !!x);
}

export function readFile(filename: string) {
  return fs.readFileSync(filename, "utf-8");
}

export function splitArray<T>(array: T[], splitFn: (item: T) => boolean): T[][] {
  return array.reduce(
    (acc, item) => {
      const matches = splitFn(item);
      if (matches) {
        acc.push([]);
      } else {
        acc[acc.length - 1].push(item);
      }
      return acc;
    },
    [[]]
  );
}
