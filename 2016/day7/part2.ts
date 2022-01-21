import { readLines } from "../util";

const lines = readLines("input.txt").map((line) => line.split(" ")[0]);

const containsAba = (str: string): string[] => {
  const bab = [];
  for (let i = 0; i < str.length - 2; i++) {
    const [a, b, a2] = str.substring(i);
    if (a !== b && a === a2) {
      bab.push([b, a, b].join(""));
    }
  }
  return bab;
};

const ssl = lines.filter((line) => {
  const segments = line
    .split("")
    .reduce(
      (acc, c) => {
        if (c === "[") {
          acc.push([true]);
        } else if (c === "]") {
          acc.push([false]);
        } else {
          acc[acc.length - 1].push(c);
        }
        return acc;
      },
      [[false]] as (string | boolean)[][]
    )
    .map(([bracket, ...rest]) => ({ bracket, value: rest.join("") }));

  const bab = segments.filter((s) => !s.bracket).flatMap((s) => containsAba(s.value));
  return segments.filter((s) => s.bracket).some((s) => bab.some((bab) => s.value.includes(bab)));
});
console.log(ssl.length);
