import { isEqual, tail } from "lodash";
import { range, readLines } from "../util";

const turns = readLines("input.txt")[0]
  .split(", ")
  .map((instruction) => /(L|R)(\d+)/.exec(instruction))
  .map(([match, turn, distance]) => ({ turn, od: turn === "L" ? -1 : 1, distance: parseInt(distance, 10) }));

type Coord = [number, number];
let coord: Coord = [0, 0];
let orientations = {
  n: (coord: Coord, distance: number): Coord[] => range(coord[0], coord[0] - distance).map((c0) => [c0, coord[1]]),
  e: (coord: Coord, distance: number): Coord[] => range(coord[1], coord[1] + distance).map((c1) => [coord[0], c1]),
  s: (coord: Coord, distance: number): Coord[] => range(coord[0], coord[0] + distance).map((c0) => [c0, coord[1]]),
  w: (coord: Coord, distance: number): Coord[] => range(coord[1], coord[1] - distance).map((c1) => [coord[0], c1]),
};

let O = [orientations.n, orientations.e, orientations.s, orientations.w];
let orientation = 0;

let visited: Coord[] = [];
for (const { turn, distance, od } of turns) {
  orientation = (orientation + od + O.length) % O.length;
  const path = O[orientation](coord, distance).filter((x) => !isEqual(x, coord));
  coord = path[path.length - 1];
  const repeated = path.find((c) => visited.some((v) => isEqual(v, c)));

  if (repeated) {
    console.log(path);
    console.log(visited);
    console.log(repeated);
    console.log(Math.abs(repeated[0]) + Math.abs(repeated[1]));
    break;
  }
  visited.push(...path);
}

console.log("don");
