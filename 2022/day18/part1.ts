import * as yargs from "yargs";
import { perf } from "../perf";
import { readLines, toInt } from "../util";

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

const exists = (c: Coord) => coordinates.find(isCoord(c));
const result = coordinates.reduce((acc, c) => acc + neighbors(c).filter((n) => !exists(n)).length, 0);
console.log(result);
