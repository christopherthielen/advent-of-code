import { range, readLines, splitArray, toInt } from "../util";

const lines = readLines("input.txt", false);
const [cratelines, movelines] = splitArray(lines, (line) => line === "");
const crates = cratelines.map(parseCrateLine);
const stacks = makeStacks(crates);
const moves = movelines.map(parseMoveLine);

function parseCrateLine(crateLine: string): string[] {
  const result = [];
  for (let i = 1; i < crateLine.length; i += 4) {
    result.push(crateLine[i]);
  }
  return result;
}

function parseMoveLine(line: string) {
  const [_all, count, from, to] = /move (\d+) from (\d+) to (\d+)/.exec(line);
  return {
    count: toInt(count),
    from: toInt(from),
    to: toInt(to),
  };
}

function makeStacks(crates: string[][]): string[][] {
  const legend = crates.pop();
  return legend.map((stack, i) => {
    return crates
      .map((crate) => crate[i])
      .filter((x) => !!x?.trim())
      .reverse();
  });
}

moves.forEach(({ count, from, to }) => {
  range(1, count).forEach(() => stacks[to - 1].push(stacks[from - 1].pop()));
});
console.log(stacks.map((s) => s[s.length - 1]));
