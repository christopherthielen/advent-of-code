import { readLines } from "../util";

const lines = readLines("input.txt").map((line) => line.split(" ")[0]);

const containsAbba = (str: string): boolean => {
  for (let i = 0; i < str.length - 3; i++) {
    const [a, b, c, d] = str.substring(i);
    if (a !== b && a === d && b === c) {
      return true;
    }
  }
  return false;
};

const tls = lines.filter((line) => {
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

  const supportstls =
    segments.some(({ bracket, value }) => !bracket && containsAbba(value)) &&
    !segments.some(({ bracket, value }) => bracket && containsAbba(value));

  return supportstls;
});
console.log(tls.length);
