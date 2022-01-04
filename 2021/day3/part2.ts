import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");
const binaryNumbers = input.split(/[\r\n]/g).map((line) => {
  return line.split(new RegExp("")).map((bit) => parseInt(bit, 10));
});

const filterNumbersByMostCommonDigit = (numbers: number[][], digitIdx: number) => {
  const digits = numbers.map((num) => num[digitIdx]);
  const zeroCount = digits.filter((digit) => digit === 0).length;
  const mostCommon = zeroCount * 2 === numbers.length ? 1 : zeroCount * 2 > numbers.length ? 0 : 1;
  return numbers.filter((digits) => digits[digitIdx] === mostCommon);
};

const filterNumbersByLeastCommonDigit = (numbers: number[][], digitIdx: number) => {
  const digits = numbers.map((num) => num[digitIdx]);
  const zeroCount = digits.filter((digit) => digit === 0).length;
  const leastCommon = zeroCount * 2 === numbers.length ? 0 : zeroCount * 2 > numbers.length ? 1 : 0;
  return numbers.filter((digits) => digits[digitIdx] === leastCommon);
};

const digitCount = binaryNumbers[0].length;

let oxygen = binaryNumbers;
for (let i = 0; i < digitCount; i++) {
  oxygen = oxygen.length === 1 ? oxygen : filterNumbersByMostCommonDigit(oxygen, i);
}

let carbondioxide = binaryNumbers;
for (let i = 0; i < digitCount; i++) {
  carbondioxide = carbondioxide.length === 1 ? carbondioxide : filterNumbersByLeastCommonDigit(carbondioxide, i);
}

const o2 = parseInt(oxygen[0].join(""), 2);
const co2 = parseInt(carbondioxide[0].join(""), 2);
console.log({ o2, co2 });
console.log(o2 * co2);
