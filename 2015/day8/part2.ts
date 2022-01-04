import { readLines } from "../util";

const lines = readLines("input.txt");
const doubleQuoted = lines.map((raw) => {
  return raw.replace(/([\\"])/g, "\\$1");
});

const srcLen = lines.reduce((acc, line) => acc + line.length, 0);
const dequotedLen = doubleQuoted.reduce((acc, line) => acc + line.length + 2, 0);
console.log({ srcLen, dequotedLen });
console.log(dequotedLen - srcLen);
