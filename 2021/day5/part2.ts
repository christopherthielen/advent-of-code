import * as fs from "fs";
import * as path from "path";
import { countBy } from "lodash";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const lines = input.split(/[\r\n]/);

function range(n1: number, n2: number) {
  const step = n1 < n2 ? 1 : -1;
  const nums = [];
  for (let i = n1; step === 1 ? i <= n2 : i >= n2; i += step) {
    nums.push(i);
  }
  return nums;
}

class Vent {
  private start: [number, number];
  private end: [number, number];

  constructor(line: string) {
    const [start, end] = line.split(" -> ");
    this.start = start.split(",").map((num) => parseInt(num, 10)) as [number, number];
    this.end = end.split(",").map((num) => parseInt(num, 10)) as [number, number];
  }

  toString = () => `${this.start.join()} -> ${this.end.join()} ${this.orientation()} ${this.coveredCoords().join(" ")}`;

  orientation(): "horizontal" | "vertical" | "diagonal" | "invalid" {
    if (this.start[0] === this.end[0]) {
      return "vertical";
    } else if (this.start[1] === this.end[1]) {
      return "horizontal";
    } else if (Math.abs(this.start[0] - this.end[0]) === Math.abs(this.start[1] - this.end[1])) {
      return "diagonal";
    }
    return "invalid";
  }

  coveredCoords(): string[] {
    if (this.orientation() === "vertical") {
      const x = this.start[0];
      return range(this.start[1], this.end[1]).map((y) => `${x}x${y}`);
    } else if (this.orientation() === "horizontal") {
      const y = this.start[1];
      return range(this.start[0], this.end[0]).map((x) => `${x}x${y}`);
    } else if (this.orientation() === "diagonal") {
      const xrange = range(this.start[0], this.end[0]);
      const yrange = range(this.start[1], this.end[1]);
      return xrange.map((x, idx) => `${x}x${yrange[idx]}`);
    }
    return [];
  }
}

const vents = lines.filter((line) => !!line).map((line) => new Vent(line));
const coveredCoords = vents.map((v) => v.coveredCoords()).flat();
const counted = countBy(coveredCoords, (value) => value);
const total = Object.entries(counted).filter(([_key, count]) => count > 1);
// console.log(vents.filter((v) => v.orientation() !== "horizontal" && v.orientation() !== "vertical").map((v) => v.toString()));
console.log({ count: total.length });
