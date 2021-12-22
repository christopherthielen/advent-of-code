import * as fs from "fs";
import { isEqual, intersection, intersectionWith, uniqWith, uniq } from "lodash";
import * as path from "path";
import assert = require("node:assert");

type Threeple = [number, number, number];
type RawCoord = Threeple;
type Distances = Threeple;
type Coord = { x: number; y: number; z: number };
type Axis = "x" | "y" | "z";

type Scanner = {
  name: string;
  rawCoords: RawCoord[];
  orientation?: string;
  normalizedCoords?: Coord[];
  normalizedKeys?: string[];
  distances: { [key: string]: Distances[] };
  keys: { [key: string]: string[] };
};

const switchCase = (str: string) => (str.toLowerCase() === str ? str.toUpperCase() : str.toLowerCase());
const rotate = (o: string) => [o.charAt(0), o.charAt(2), switchCase(o.charAt(1))].join("");
const rotate3x = (o1: string) => [o1, rotate(o1), rotate(rotate(o1)), rotate(rotate(rotate(o1)))];
const ORIENTATIONS: string[] = ["xyz", "Yxz", "XYz", "yXz", "zXY", "ZYX"].map(rotate3x).flat();
const AXES: Axis[] = ["x", "y", "z"];
const BEACON_THRESHOLD = 12;
const scanners: Scanner[] = [];

const inputPath = path.resolve(__dirname, "input.txt");
const lines = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x);

lines.forEach((line) => {
  if (line.startsWith("--- scanner ")) {
    const [_match, name] = /--- scanner (.*) ---/.exec(line);
    scanners.push({ name: "s" + name, rawCoords: [], distances: {}, keys: {} });
  } else {
    scanners[scanners.length - 1].rawCoords.push(line.split(",").map((x) => parseInt(x, 10)) as RawCoord);
  }
});

const uniqR = <T>(acc: T[], x: T) => (acc.includes(x) ? acc : acc.concat(x));
const product = <T, T2>(array1: T[], array2: T2[]) => array1.map((val1) => array2.map((val2) => [val1, val2])).flat(1) as [T, T2][];
const offsetCoord = (c: Coord, deltas: Threeple) => ({ x: c.x + deltas[0], y: c.y + deltas[1], z: c.z + deltas[2] });
const rawDistance = (c1: RawCoord, c2: RawCoord) => c1.map((a, idx) => Math.abs(a - c2[idx])) as Distances;
const computeDistances = ({ rawCoords }: Scanner): Distances[] => product(rawCoords, rawCoords).map(([c1, c2]) => rawDistance(c1, c2));
const distance2Str = (order: string, distance: Distances) => AXES.map((k) => distance[order.indexOf(k)]).join("-");

scanners.forEach((s) => {
  const distances = computeDistances(s);
  ORIENTATIONS.map((x) => x.toLowerCase())
    .reduce(uniqR, [])
    .forEach((order) => {
      s.keys[order] = distances.map((d) => distance2Str(order, d)).reduce(uniqR, []);
    });
});

scanners[0].orientation = "xyz";
scanners[0].normalizedKeys = scanners[0].keys["xyz"];
scanners[0].normalizedCoords = scanners[0].rawCoords.map((rc) => normalizeOrientation(rc, "xyz"));

function normalizeOrientation(rawCoord: RawCoord, orientation: string): Coord {
  const val = (axis: Axis) => {
    const kIdx = orientation.toLowerCase().indexOf(axis);
    const multiplier = orientation[kIdx] === axis.toUpperCase() ? -1 : 1;
    return rawCoord[kIdx] * multiplier;
  };
  return { x: val("x"), y: val("y"), z: val("z") };
}

// based on common distances between beacons from 2 scanner datasets
function possibleOrientations(known: Scanner, unknown: Scanner): string[] {
  const matches = Object.entries(unknown.keys)
    .filter(([order, keys]) => intersection(known.normalizedKeys, keys).length > BEACON_THRESHOLD)
    .map(([order]) => order as string);
  return ORIENTATIONS.filter((o) => matches.includes(o.toLowerCase()));
}

function matchingDeltas(axis: Axis, staticCoords: Coord[], testCoords: Coord[]): number[] {
  const staticVals = staticCoords.map((c) => c[axis]);
  const testVals = testCoords.map((c) => c[axis]);
  const cartesianProduct = product(staticVals, testVals);
  const deltas = uniq(cartesianProduct.map(([staticVal, testVal]) => staticVal - testVal));

  return deltas.filter((delta) => {
    const shifted = testVals.map((x) => x + delta);
    const matches = intersection(shifted, staticVals);
    return staticVals.filter((x) => matches.includes(x)).length >= BEACON_THRESHOLD;
  });
}

// best guess, then check ; rotate and shift
function findOrientation(
  knownCoords: Coord[],
  unknownCoords: RawCoord[],
  orientations: string[]
): { orientation: string; deltas: Threeple } {
  for (const orientation of orientations) {
    const reorientedCoords = unknownCoords.map((rawCoord) => normalizeOrientation(rawCoord, orientation));
    const possibleDeltasByAxis = AXES.map((axis) => matchingDeltas(axis, knownCoords, reorientedCoords));
    if (possibleDeltasByAxis.every((d) => d.length)) {
      const [pdx, pdy, pdz] = possibleDeltasByAxis;
      const possibleDeltas = product(product(pdx, pdy), pdz).map(([xy, z]) => xy.concat(z)) as Threeple[];
      const deltas = possibleDeltas.filter((deltas) => {
        const testCoords = reorientedCoords.map((c) => offsetCoord(c, deltas));
        const matches = intersectionWith(knownCoords, testCoords, isEqual);
        return matches.length >= BEACON_THRESHOLD;
      }) as Threeple[];

      if (deltas.length) {
        assert(deltas.length === 1);
        return { orientation, deltas: deltas[0] };
      }
    }
  }
}

function normalizeScanner(scanner: Scanner, orientation: string, deltas: Threeple) {
  scanner.orientation = orientation;
  scanner.normalizedKeys = scanner.keys[orientation.toLowerCase()];
  scanner.normalizedCoords = scanner.rawCoords.map((rc) => normalizeOrientation(rc, orientation)).map((c) => offsetCoord(c, deltas));
}

const queue = scanners.slice(1);
let iterations = 0;
let missCount = 0;
while (queue.length > missCount && iterations++ < 1000) {
  const knownScanners = scanners.filter((s) => s.normalizedCoords);
  const knownBeacons = uniqWith(knownScanners.map((s) => s.normalizedCoords).flat(), isEqual);
  const unknownScanner = queue.shift();
  const match = knownScanners
    .map((knownScanner) => {
      // best guess based on distances
      const orientations = possibleOrientations(knownScanner, unknownScanner);
      return findOrientation(knownScanner.normalizedCoords, unknownScanner.rawCoords, orientations);
    })
    .find((x) => x);

  if (match) {
    missCount = 0;
    normalizeScanner(unknownScanner, match.orientation, match.deltas);
    assert(intersectionWith(knownBeacons, unknownScanner.normalizedCoords, isEqual).length >= BEACON_THRESHOLD);
  } else {
    missCount++;
    queue.push(unknownScanner);
  }
}
scanners.forEach((s) => {
  console.log(`${s.name} ${s.normalizedCoords ? "OK" : ""}`);
});

const beacons = scanners
  .map((s) => s.normalizedCoords)
  .flat()
  .map((coord) => `${coord.x}-${coord.y}-${coord.z}`)
  .reduce(uniqR, [] as string[]);

console.log("beacons: " + beacons.length);
