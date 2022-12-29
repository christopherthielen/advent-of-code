import * as yargs from "yargs";
import { perf } from "../perf";
import { max, readLines, toInt } from "../util";

yargs.option("perf", { boolean: true });
yargs.option("example", { boolean: true });
const INPUT = yargs.argv["example"] ? "example.txt" : "input.txt";
const lines = readLines(INPUT);

type Coord = { x: number; y: number; z: number };
const coordinates = lines.map((line) => line.split(",").map(toInt)).map(([x, y, z]) => ({ x, y, z } as Coord));

const isCoord = (c: Coord) => (other: Coord) => c.x === other.x && c.y === other.y && c.z === other.z;
const neighbors = ({ x, y, z }: Coord): Coord[] => {
  return [
    { x: x + 1, y, z },
    { x: x - 1, y, z },
    { x, y: y + 1, z },
    { x, y: y - 1, z },
    { x, y, z: z + 1 },
    { x, y, z: z - 1 },
  ];
};

const ORIGIN = { x: -1, y: -1, z: -1 };
const MINX = -1;
const MINY = -1;
const MINZ = -1;
const MAXX = max(coordinates.map((c) => c.x)) + 1;
const MAXY = max(coordinates.map((c) => c.y)) + 1;
const MAXZ = max(coordinates.map((c) => c.z)) + 1;
const isRock = (c: Coord) => Boolean(coordinates.find(isCoord(c)));
const isOOB = ({ x, y, z }: Coord) => x < MINX || x > MAXX || y < MINY || y > MAXY || z < MINZ || z > MAXZ;
if (isRock(ORIGIN)) {
  throw new Error("need a better origin");
}
const air = new Set();
// const air = array1d(MAXX + 5, () => array2d(MAXY + 5, MAXZ + 5, () => false));
const airkey = ({ x, y, z }: Coord) => `${x}.${y}.${z}`;
const getAir = (c: Coord) => air.has(airkey(c));
const setAir = (c: Coord) => air.add(airkey(c));
const markVacuum = (coord: Coord) => {
  const visited = [];
  const isVisited = (coord: Coord) => visited.some(isCoord(coord));
  const toVisit = [coord];
  while (toVisit.length) {
    const testCoord = toVisit.pop();
    if (!isRock(testCoord)) setAir(testCoord);
    visited.push(testCoord);
    const nextDoor = neighbors(testCoord);
    const needsVisit = nextDoor.filter((c) => !isOOB(c) && !isRock(c) && !isVisited(c));
    needsVisit.forEach((coord) => toVisit.push(coord));
  }
};

markVacuum({ x: -1, y: -1, z: -1 });

const surfaces = coordinates.flatMap((c) => neighbors(c).filter((n) => !isRock(n)));
const exterior = surfaces.filter((coord) => getAir(coord));
console.log("surfaces: " + surfaces.length);
console.log("exterior: " + exterior.length);
