import { readLines } from "../../2015/util";

const turns = readLines("input.txt")[0]
  .split(", ")
  .map((instruction) => /(L|R)(\d+)/.exec(instruction))
  .map(([match, turn, distance]) => ({ turn, od: turn === "L" ? -1 : 1, distance: parseInt(distance, 10) }));

type Coord = [number, number];
let coord: Coord = [0, 0];
let orientations = {
  n: (coord: Coord, distance: number): Coord => [coord[0] - distance, coord[1]],
  e: (coord: Coord, distance: number): Coord => [coord[0], coord[1] + distance],
  s: (coord: Coord, distance: number): Coord => [coord[0] + distance, coord[1]],
  w: (coord: Coord, distance: number): Coord => [coord[0], coord[1] - distance],
};

let O = [orientations.n, orientations.e, orientations.s, orientations.w];
let orientation = 0;

turns.forEach(({ distance, od }) => {
  orientation = (orientation + od + O.length) % O.length;
  coord = O[orientation](coord, distance);
});
console.log(coord);
console.log(Math.abs(coord[0]) + Math.abs(coord[1]));
