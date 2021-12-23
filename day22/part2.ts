import * as fs from "fs";
import * as path from "path";
import { range } from "lodash";

// const inputPath = path.resolve(__dirname, "example1.txt");
// const inputPath = path.resolve(__dirname, "example2.txt");
// const inputPath = path.resolve(__dirname, "input.txt");
const inputPath = path.resolve(__dirname, "reboot.txt");

const commands = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x)
  .map((line) => /(on|off) x=([-\d]+)\.\.([-\d]+),y=([-\d]+)\.\.([-\d]+),z=([-\d]+)\.\.([-\d]+)/.exec(line).slice(1))
  .map(([onoff, ...nums]) => [onoff === "on" ? 1 : 0, ...nums.map((num) => parseInt(num, 10))])
  .map(([onoff, x1, x2, y1, y2, z1, z2]) => ({ onoff, x1, x2, y1, y2, z1, z2 } as Command));

type Command = { onoff: Bit; x1: number; x2: number; y1: number; y2: number; z1: number; z2: number };
const allocate = (x: number, y: number, z: number) =>
  new Array(x).fill(0).map((xs) => new Array(y).fill(0).map((ys) => new Array(z).fill(0)));
const product = <T, T2, T3>(array1: T[], array2: T2[], array3: T3[]) => {
  return array1.map((val1) => array2.map((val2) => array3.map((val3) => [val1, val2, val3] as [T, T2, T3]))).flat(2);
};
type Bit = 0 | 1;

class Grid {
  data: Bit[][][] = allocate(101, 101, 101);

  setValue(val: Bit, x: number, y: number, z: number) {
    if ([x, y, z].some((val) => val < -50 || val > 50)) {
      return false;
    }
    this.data[x + 50][y + 50][z + 50] = val;
  }
}

const grid = new Grid();
const boundedrange = (v1: number, v2: number) => {
  return range(Math.min(Math.max(v1, -51), 51), Math.min(Math.max(v2, -51), 51));
};

commands.forEach(({ onoff, x1, x2, y1, y2, z1, z2 }) => {
  console.log(`getting range product ${x1}..${x2} ${y1}..${y2} ${z1}..${z2}`);
  let product1 = product(boundedrange(x1, x2 + 1), boundedrange(y1, y2 + 1), boundedrange(z1, z2 + 1));
  console.log(`got it `);
  product1.forEach(([x, y, z]) => {
    grid.setValue(onoff, x, y, z);
  });
});

console.log(
  grid.data
    .map((a) => a.map((b) => b.map((c) => c)))
    .flat(3)
    .reduce((acc, x) => acc + x, 0)
);

console.log("done");
