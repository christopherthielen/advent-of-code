import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const lines = fs.readFileSync(inputPath, "utf-8").split(/[\r\n]/);
type Coord = [number, number];

let coordinates = lines
  .filter((line) => line.includes(","))
  .map((line) => {
    return line.split(",").map((num) => parseInt(num, 10)) as Coord;
  });

const folds: Array<[string, number]> = lines
  .filter((line) => line.includes("fold along"))
  .map((line) => line.replace(/fold along /, ""))
  .map((fold) => fold.split("="))
  .map(([axis, val]) => [axis, parseInt(val, 10)]);

// prettier-ignore
const shiftX = (count: number) => ([x, y]: Coord) => [x + count, y] as Coord,
  shiftY = (count: number) => ([x, y]: Coord) => [x, y + count] as Coord;
const abs = ([x, y]) => [Math.abs(x), Math.abs(y)] as Coord;

for (let [axis, count] of folds) {
  if (axis === "x") {
    coordinates = coordinates.map(shiftX(0 - count)).map(abs);
    // .map(shiftX(count));
  } else if (axis === "y") {
    coordinates = coordinates.map(shiftY(0 - count)).map(abs);
    // .map(shiftY(count));
  }
}

function print(coords: Array<[number, number]>) {
  const minX = Math.min(...coords.map((coord) => coord[0]));
  const minY = Math.min(...coords.map((coord) => coord[1]));
  const shifted = coords.map(shiftX(0 - minX)).map(shiftY(0 - minY));
  const maxX = Math.max(...shifted.map((coord) => coord[0]));
  const maxY = Math.max(...shifted.map((coord) => coord[1]));

  const buffer = new Array(maxY + 1).fill(0).map((line) => new Array(maxX + 1).fill(" "));
  shifted.forEach(([x, y]) => (buffer[y][x] = "X"));
  console.log(buffer.map((line) => line.join("")).join("\n"));
}

console.log({ coordinates });
const uniq = coordinates.map(([x, y]) => `${x}x${y}`).reduce((acc, x) => (acc.includes(x) ? acc : acc.concat(x)), []);
console.log(uniq.length);
print(coordinates);
