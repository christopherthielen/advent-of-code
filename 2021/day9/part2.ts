import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const lines = input.split(/[\r\n]/).filter((line) => !!line);
const lineLen = lines[0].length;

interface Coord {
  x: number;
  y: number;
}

const lineAsNumberArray = (line: string) => line.split("").map((x) => parseInt(x, 10));
const grid = lines.map((line) => lineAsNumberArray(line));

const coord = (y: number, x: number) => ({ x, y } as Coord);
const neighborsCoords = (y: number, x: number) => {
  const coords = [coord(y, x - 1), coord(y, x + 1), coord(y - 1, x), coord(y + 1, x)];
  return coords.filter(({ x, y }) => x >= 0 && x < grid[0].length && y >= 0 && y < lines.length);
};

const neighborVals = (y: number, x: number) => neighborsCoords(y, x).map(({ y, x }) => grid[y][x]);

const lowPoints: Coord[] = [];

for (let x = 0; x < lineLen; x++) {
  for (let y = 0; y < lines.length; y++) {
    if (neighborVals(y, x).every((n) => grid[y][x] < n)) {
      lowPoints.push({ x, y });
    }
  }
}

// 5428236, 1327976
const findBasin = (y: number, x: number, basin: Coord[]): Coord[] => {
  basin.push(coord(y, x));

  neighborsCoords(y, x)
    .filter((c) => grid[c.y][c.x] < 9 && grid[c.y][c.x] > grid[y][x])
    .forEach((c) => {
      if (!basin.some((b) => b.x === c.x && b.y === c.y)) {
        findBasin(c.y, c.x, basin);
      }
    });

  return basin;
};

const basins = lowPoints.map((c) => findBasin(c.y, c.x, [])).sort((a, b) => b.length - a.length);
console.log(basins[0].length * basins[1].length * basins[2].length);

function drawGrid(coords: Coord[]) {
  const minx = Math.min(...coords.map((c) => c.x));
  const maxx = Math.max(...coords.map((c) => c.x));
  const miny = Math.min(...coords.map((c) => c.y));
  const maxy = Math.max(...coords.map((c) => c.y));
  const width = maxx - minx + 1;
  const height = maxy - miny + 1;

  const output = new Array(height).fill(0).map((line) => new Array(width).fill(" "));
  coords.forEach((coord) => {
    output[coord.y - miny][coord.x - minx] = grid[coord.y][coord.x];
  });

  const string = output.map((line) => line.map((x) => (x === "9" ? "X" : x)).join("")).join("\n");
  console.log(string + "\n");
}

// basins.forEach((b) => drawGrid(b));
// drawGrid(basins.flat());
