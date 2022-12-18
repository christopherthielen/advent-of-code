import { range, readLines, toInt } from "../util";

// const INPUT = "example.txt";
// const Y = 10;
const INPUT = "input.txt";
const Y = 2000000;
type SensorData = ReturnType<typeof parseLine>;

const parseLine = (line: string) => {
  const regExp = /Sensor at x=([\d\-]+), y=([\d\-]+): closest beacon is at x=([\d\-]+), y=([\d\-]+)/;
  const [_, sensorx, sensory, beaconx, beacony] = regExp.exec(line).map(toInt);
  return { sensorx, sensory, beaconx, beacony };
};

const lines = readLines(INPUT);
const data: SensorData[] = lines.map((line) => parseLine(line));
const mDistance = (x1: number, y1: number, x2: number, y2: number) => Math.abs(x1 - x2) + Math.abs(y1 - y2);

const noSensorPossible = (sensorData: SensorData, x: number, y: number) => {
  const { beaconx, sensorx, beacony, sensory } = sensorData;
  const distanceToSensor = mDistance(sensorx, sensory, beaconx, beacony);
  const dist = mDistance(sensorx, sensory, x, y);
  return dist <= distanceToSensor;
};

const minx = data
  .map(({ beaconx, beacony, sensorx, sensory }) => {
    const distanceToSensor = mDistance(sensorx, sensory, beaconx, beacony);
    return sensorx - distanceToSensor;
  })
  .reduce((acc, x) => Math.min(acc, x));

const maxx = data
  .map(({ beaconx, beacony, sensorx, sensory }) => {
    const distanceToSensor = mDistance(sensorx, sensory, beaconx, beacony);
    return sensorx + distanceToSensor;
  })
  .reduce((acc, x) => Math.max(acc, x));

const total = range(minx, maxx).reduce((acc, x) => {
  const beaconExists = data.some((datum) => datum.beaconx === x && datum.beacony === Y);
  const impossible = data.some((datum) => noSensorPossible(datum, x, Y));
  return !beaconExists && impossible ? acc + 1 : acc;
}, 0);

console.log(total);
