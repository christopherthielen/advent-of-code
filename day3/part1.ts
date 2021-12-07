import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");
const binaryNumbers = input.split(/[\r\n]/g).map((line) => {
  return line.split(new RegExp("")).map((bit) => parseInt(bit, 10));
});

const bitCounts = binaryNumbers[0].slice().fill(0);
binaryNumbers.forEach((bits) => bits.forEach((bit, idx) => (bitCounts[idx] += bit)));

const gamma = bitCounts.map((count) => (count * 2 > binaryNumbers.length ? 1 : 0));
const epsilon = bitCounts.map((count) => (count * 2 > binaryNumbers.length ? 0 : 1));
const gammaDecimal = parseInt(gamma.join(""), 2);
const epsilonDecimal = parseInt(epsilon.join(""), 2);
console.log({ epsilonDecimal, gammaDecimal });
console.log(epsilonDecimal * gammaDecimal);
