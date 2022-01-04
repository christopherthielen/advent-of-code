import * as fs from "fs";
import * as path from "path";
import { isEqual } from "lodash";

// const inputPath = path.resolve(__dirname, "example1.txt");
// const inputPath = path.resolve(__dirname, "example2.txt");
const inputPath = path.resolve(__dirname, "input.txt");
// const inputPath = path.resolve(__dirname, "reboot.txt");

type Bit = 0 | 1;
type Command = { onoff: Bit; cube: Cube };
type Range = [number, number];
type Cube = { x: Range; y: Range; z: Range };

const product = <T, T2, T3>(array1: T[], array2: T2[], array3: T3[]) => {
  return array1.map((val1) => array2.map((val2) => array3.map((val3) => [val1, val2, val3] as [T, T2, T3]))).flat(2);
};
const sorted = (range: Range) => range.sort((a, b) => a - b);
const cube = (x: Range, y: Range, z: Range) => ({ x: sorted(x), y: sorted(y), z: sorted(z) });
const isEmptyCube = (cube: Cube) => [cube.x, cube.y, cube.z].some((range) => range[0] === range[1]);
const volume = (cube: Cube) => Math.abs((cube.x[1] - cube.x[0]) * (cube.y[1] - cube.y[0]) * (cube.z[1] - cube.z[0]));
const rangeStr = (r: Range) => `${r[0]}..${r[1]}`;
const cubeStr = (c: Cube) => `[x: ${rangeStr(c.x)} y: ${rangeStr(c.y)} z: ${rangeStr(c.z)} vol: ${volume(c)}]`;

const intersect = (r1: Range, r2: Range): Range => {
  const none = r2[1] < r1[0] || r2[0] > r1[1];
  return none ? null : [Math.max(r1[0], r2[0]), Math.min(r1[1], r2[1])];
};

function subtractAll(srcCube: Cube, minusCubes: Cube[]): Cube[] {
  return minusCubes.reduce((cubes, minusCube) => cubes.map((cube) => subtract(cube, minusCube)).flat(), [srcCube]);
}

function subtract(srcCube: Cube, minusCube: Cube): Cube[] {
  const boundRange = (input: Range, bounds: Range): Range => [Math.max(input[0], bounds[0]), Math.min(input[1], bounds[1])];
  const ranges = (src: Range, other: Range): [Range, Range, Range] => {
    if (!intersect(src, other)) return null;
    const points = src.concat(other).sort((a, b) => a - b);
    return [
      boundRange(points.slice(0, 2) as Range, src),
      boundRange(points.slice(1, 3) as Range, src),
      boundRange(points.slice(2, 4) as Range, src),
    ];
  };

  const xranges = ranges(srcCube.x, minusCube.x);
  const yranges = ranges(srcCube.y, minusCube.y);
  const zranges = ranges(srcCube.z, minusCube.z);

  if ([xranges, yranges, zranges].some((range) => !range)) {
    return [srcCube];
  }

  const twentySevenRanges = product(xranges, yranges, zranges);
  const intersection = cube(xranges[1], yranges[1], zranges[1]);
  let map = twentySevenRanges.map(([xrange, yrange, zrange]) => cube(xrange, yrange, zrange));
  let filter = map.filter((cube) => !isEmptyCube(cube));
  return filter.filter((cube) => !isEqual(cube, intersection));
}

const commands = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x)
  .map((line) => /(on|off) x=([-\d]+)\.\.([-\d]+),y=([-\d]+)\.\.([-\d]+),z=([-\d]+)\.\.([-\d]+)/.exec(line).slice(1))
  .map(([onoff, ...nums]) => [onoff === "on" ? 1 : 0, ...nums.map((num) => parseInt(num, 10))])
  .map(
    ([onoff, x1, x2, y1, y2, z1, z2]) =>
      ({
        onoff,
        cube: cube([x1, x2 + 1], [y1, y2 + 1], [z1, z2 + 1]),
      } as Command)
  );

const onCubes = [];
commands.forEach((cmd, idx) => {
  const { onoff, cube } = cmd;
  // console.log(onoff, cubeStr(cube));
  if (onoff === 0) return;
  const pendingCubes = commands.slice(idx + 1).map((cmd) => cmd.cube);
  // pendingCubes.forEach((pc) => console.log(cubeStr(pc)));
  subtractAll(cube, pendingCubes).forEach((cube) => onCubes.push(cube));
});

const totalVolume = onCubes.reduce((acc, cube) => acc + volume(cube), 0);
console.log({ totalVolume });
