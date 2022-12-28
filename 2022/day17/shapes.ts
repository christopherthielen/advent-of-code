import { Coord } from "../grid";

export type Shape = { name: string; height: number; width: number; coords: Coord[] };
const getCoords = (name: string, shape: string): Shape => {
  const coords = shape
    .split("\n")
    .reverse()
    .map((line) => line.split(""))
    .filter((chars) => chars.length)
    .flatMap((line, y) => line.map((char, x) => (char === "#" ? { x, y } : null)))
    .filter((coord) => Boolean(coord));
  const height = coords.reduce((acc, coord) => Math.max(acc, coord.y), 0) + 1;
  const width = coords.reduce((acc, coord) => Math.max(acc, coord.x), 0) + 1;

  return { name, height, width, coords };
};

const DASH = getCoords("dash", `####`);
const PLUS = getCoords(
  "plus",
  `
.#.
###
.#.`
);
const ELL = getCoords(
  "ell",
  `
..#
..#
###`
);
const PIPE = getCoords(
  "pipe",
  `
#
#
#
#`
);
const SQUARE = getCoords(
  "square",
  `
##
##`
);
export const shapes: Shape[] = [DASH, PLUS, ELL, PIPE, SQUARE];
