import { perf } from "../perf";
import { readLines, toInt } from "../util";

const MIN = 0;
const TUNINGFACTOR = 4000000;

// const INPUT = "example.txt";
// const MAX = 20;
const INPUT = "input.txt";
const MAX = TUNINGFACTOR;

type Coord = { x: number; y: number };
type RawSensorData = ReturnType<typeof parseLine>;
type Sensor = RawSensorData & { distance: number; borders: Coord[]; inrange: (x: number, y: number) => boolean };

const parseLine = (line: string) => {
  const regExp = /Sensor at x=([\d\-]+), y=([\d\-]+): closest beacon is at x=([\d\-]+), y=([\d\-]+)/;
  const [_, sensorx, sensory, beaconx, beacony] = regExp.exec(line).map(toInt);
  return { sensorx, sensory, beaconx, beacony };
};

const mDistance = (x1: number, y1: number, x2: number, y2: number) => Math.abs(x1 - x2) + Math.abs(y1 - y2);
const tuningFrequency = (x: number, y: number) => x * TUNINGFACTOR + y;
const lines = readLines(INPUT);

const sensors: Sensor[] = lines.map((line) => {
  const data = parseLine(line);
  const distance = mDistance(data.sensorx, data.sensory, data.beaconx, data.beacony);
  const { sensorx, sensory } = data;
  const borders: Coord[] = [];
  for (var i = 0; i <= distance + 1; i++) {
    const delta = distance - i + 1;
    borders.push({ x: sensorx + i, y: sensory - delta });
    borders.push({ x: sensorx + i, y: sensory + delta });
    borders.push({ x: sensorx - i, y: sensory - delta });
    borders.push({ x: sensorx - i, y: sensory + delta });
  }
  console.log({ borders: borders.length });
  const inrange = (x: number, y: number) => {
    return mDistance(data.sensorx, data.sensory, x, y) <= distance;
  };
  return { ...data, distance, inrange, borders };
});

let check = (x: number, y: number) => {
  const impossible = sensors.some((sensor) => sensor.inrange(x, y));
  if (!impossible) {
    console.log({ x, y, freq: tuningFrequency(x, y) });
  }
};

check = perf(check);

const coords = sensors
  .flatMap((sensors) => sensors.borders)
  .filter((coord) => coord.x > MIN && coord.x < MAX && coord.y > MIN && coord.y < MAX);

coords.forEach((coord) => {
  check(coord.x, coord.y);
});
