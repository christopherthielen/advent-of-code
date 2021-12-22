import * as fs from "fs";
import * as path from "path";
import { range, cloneDeep, clone, uniq } from "lodash";
import assert = require("node:assert");

const product = <T, T2>(array1: T[], array2: T2[]) => array1.map((val1) => array2.map((val2) => [val1, val2])).flat(1) as [T, T2][];
const inputPath = path.resolve(__dirname, "input.txt");
// const inputPath = path.resolve(__dirname, "example1.txt");
const [algorithm, ...imageLines] = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x);

const LIT = "#";
const DIM = ".";
type Bit = typeof LIT | typeof DIM;

class Image {
  lines: Bit[][] = [];

  constructor(lines: string[]) {
    lines.forEach((line) => this.lines.push(line.split("") as Bit[]));
    this.expand(".");
  }

  nextPixel(y: number, x: number): Bit {
    if (y < 0 || y >= this.h) {
      throw new Error(`line ${y} out of range 0..${this.h - 1}`);
    }
    if (x < 0 || x >= this.w) {
      throw new Error(`char ${x} out of range 0..${this.w - 1}`);
    }

    const hneighbors = (line: Bit[]): [Bit, Bit, Bit] => {
      const left = x === 0 ? this.getInfinity() : line[x - 1];
      const right = x === line.length - 1 ? this.getInfinity() : line[x + 1];
      return [left, line[x], right];
    };

    const vneighbors: Bit[] = [
      y === 0 ? new Array(3).fill(this.getInfinity()) : hneighbors(this.lines[y - 1]),
      hneighbors(this.lines[y]),
      y === this.h - 1 ? new Array(3).fill(this.getInfinity()) : hneighbors(this.lines[y + 1]),
    ].flat();

    const idx = parseInt(vneighbors.map((x) => (x === LIT ? 1 : 0)).join(""), 2);
    return algorithm[idx] as Bit;
  }

  border(edge?: "top" | "bottom" | "left" | "right") {
    switch (edge) {
      case "top":
        return this.lines[0];
      case "bottom":
        return this.lines[this.lines.length - 1];
      case "left":
        return this.lines.map((bits) => bits[0]);
      case "right":
        return this.lines.map((bits) => bits[bits.length - 1]);
      default:
        return [].concat(this.border("top"), this.border("bottom"), this.border("left"), this.border("right"));
    }
  }

  getInfinity() {
    const edges = ["top", "bottom", "left", "right"] as const;
    const borders = edges.map((edge) => this.border(edge));
    const borderBits: Bit[] = uniq(borders.flat());
    if (borderBits.length > 1) {
      debugger;
    }
    assert(borderBits.length === 1);
    const currentBorder = borderBits[0];
    return currentBorder;
    // const infinity = (currentBorder === "." ? algorithm[0] : algorithm[511]) as Bit;
    // return infinity;
  }

  expand(infinity: Bit = this.getInfinity()) {
    this.lines.forEach((line) => line.unshift(infinity));
    this.lines.forEach((line) => line.push(infinity));
    this.lines.unshift(new Array(this.w).fill(infinity));
    this.lines.push(new Array(this.w).fill(infinity));
  }

  get h() {
    return this.lines.length;
  }

  get w() {
    return this.lines[0].length;
  }

  step() {
    this.expand();
    const copy: Bit[][] = cloneDeep(this.lines);
    const coords = product(range(0, this.h), range(0, this.w));
    coords.forEach(([y, x]) => {
      return (copy[y][x] = this.nextPixel(y, x));
    });
    this.lines = copy;
  }

  toString() {
    return this.lines.map((bits) => bits.join("")).join("\n");
  }
}

const image = new Image(imageLines);

console.log({ lit: image.lines.flat().filter((x) => x === LIT).length });
for (let i = 0; i < 50; i++) {
  image.step();
}
console.log({ lit: image.lines.flat().filter((x) => x === LIT).length });
