import { readLines } from "../util";

const lines = readLines("input.txt");
const dequoted = lines.map((raw) => {
  return raw.substring(1, raw.length - 1).replace(/\\(\\|"|x[a-f0-9][a-f0-9])/g, (match, cap) => {
    if (cap === "\\") return "\\";
    if (cap === '"') return '"';
    return String.fromCharCode(parseInt(cap.substring(1), 16));
  });
});

const srcLen = lines.reduce((acc, line) => acc + line.length, 0);
const dequotedLen = dequoted.reduce((acc, line) => acc + line.length, 0);
console.log({ srcLen, dequotedLen });
console.log(srcLen - dequotedLen);
