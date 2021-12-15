import * as fs from "fs";
import { countBy, range } from "lodash";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");

const grid = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x)
  .map((line) => line.split("").map((num) => parseInt(num, 10)));
const GRID_SIZE = grid.length;

type Coord = [number, number];
type Path = Coord[];

const idToCoord = (id: number): Coord => [Math.floor(id / GRID_SIZE), id % GRID_SIZE];
const coordToId = ([y, x]: Coord) => y * GRID_SIZE + x;

const naivePath: Path = [[0, 0]];
for (let i = 1; i < GRID_SIZE; i++) {
  naivePath.push([i - 1, i]);
  naivePath.push([i, i]);
}

const risk = ([y, x]: Coord) => grid[y][x];

function cost(path: Path): number {
  return path.reduce((acc, [y, x]) => acc + grid[y][x], 0);
}

function neighbors([y, x]: Coord) {
  const coords = [];
  if (x > 0) coords.push([y, x - 1]);
  if (y > 0) coords.push([y - 1, x]);
  if (x < GRID_SIZE - 1) coords.push([y, x + 1]);
  if (y < GRID_SIZE - 1) coords.push([y + 1, x]);
  return coords;
}

interface Node {
  coord: Coord;
  id: number;
  neighbors: number[];
  risk: number;
}

function node(coord: Coord): Node {
  return {
    coord: coord,
    id: coordToId(coord),
    neighbors: neighbors(coord).map(coordToId),
    risk: risk(coord),
  };
}

const nodes: Node[] = [];
for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
  nodes.push(node(idToCoord(i)));
}

let bestPath = naivePath.map(coordToId);
let leastRisk = cost(naivePath);
let END = coordToId([GRID_SIZE - 1, GRID_SIZE - 1]);

let tested = 0;
let lastLog = Date.now();

function recordTested() {
  tested++;
  const now = Date.now();
  if (now - lastLog > 1000) {
    lastLog = now;
    console.log(`Tested ${tested} paths. Least risk: ${leastRisk}`, bestPath);
  }
}

function brute(id: number, path: number[], cost: number) {
  if (cost > leastRisk) {
    recordTested();
    return;
  }

  if (id === END) {
    recordTested();
    if (cost < leastRisk) {
      console.log(`New best path cost: ${cost}`, path);
      bestPath = path;
      leastRisk = cost;
    } else {
      console.log(`Nope.  ${cost} > ${leastRisk}`);
    }
    return;
  }

  nodes[id].neighbors.forEach((nid) => {
    if (!path.includes(nid)) {
      const neighbor = nodes[nid];
      brute(nid, path.concat(nid), cost + neighbor.risk);
    }
  });
}

brute(0, [0], 0);

console.log(cost(bestPath.map(idToCoord)));
