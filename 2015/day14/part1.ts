import { readLines, toInt } from "../util";

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

lines
  .map((line) => [line, distance(line, 2503)] as [Data, number])
  .sort((a, b) => a[1] - b[1])
  .forEach(([line, d]) => console.log(`${line.deer} has traveled ${d} km`));
