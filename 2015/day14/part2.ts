import { Counter, readLines, toInt } from "../util";

type Data = ReturnType<typeof parse>;
const parse = (line: string) => {
  const regExp = /(\w+) can fly (\d+) km\/s for (\d+) seconds, but then must rest for (\d+) seconds./;
  const [_, deer, speed, duration, rest] = regExp.exec(line);
  return { deer, speed: toInt(speed), duration: toInt(duration), rest: toInt(rest) };
};

const lines: Data[] = readLines("input.txt").map(parse);

const distance = (line: Data, seconds: number) => {
  const cycle = line.duration + line.rest;
  const fullCycles = Math.floor(seconds / cycle);
  const partial = Math.min(seconds % cycle, line.duration);
  return fullCycles * line.speed * line.duration + partial * line.speed;
};

const winners = (lines: Data[], seconds: number) => {
  const distances = lines.map((line) => [line.deer, distance(line, seconds)] as [string, number]);
  const max = Math.max(...distances.map((d) => d[1]));
  return distances.filter((d) => d[1] === max).map((d) => d[0]);
};

const c = new Counter();
const SECONDS = 2503;
// const SECONDS = 1000;
for (let i = 1; i <= SECONDS; i++) {
  winners(lines, i).forEach((w) => c.count(w));
}

console.log(c);
