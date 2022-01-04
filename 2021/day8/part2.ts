import * as fs from "fs";
import * as path from "path";
import { countBy, intersection, difference } from "lodash";
import assert = require("node:assert");

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const lines = input.split(/[\r\n]/).filter((line) => !!line);

type Letter = typeof LETTERS[number];
const LETTERS = ["a", "b", "c", "d", "e", "f", "g"] as const;
const DIGIT_LETTERS = ["abcefg", "cf", "acdeg", "acdfg", "bcdf", "abdfg", "abdefg", "acf", "abcdefg", "abcdfg"];

class Mapping {
  constructor() {
    this.mapping = {} as any;
    LETTERS.forEach((letter) => (this.mapping[letter] = LETTERS.slice()));
  }

  mapping: { [key in Letter]: Letter[] };

  hasToBe(signalLetter: Letter, actualLetter: Letter) {
    this.mapping[signalLetter] = [actualLetter];
    const otherLetters = LETTERS.filter((l) => l !== signalLetter);
    otherLetters.forEach((l) => this.cantBe(l, actualLetter));
  }

  hasToBeOneOf(signalLetter: Letter, actualLetters: Letter[]) {
    const beforeCount = this.mapping[signalLetter].length;
    this.mapping[signalLetter] = intersection(this.mapping[signalLetter], actualLetters);
    if (this.mapping[signalLetter].length === 1 && beforeCount > 1) {
      this.hasToBe(signalLetter, this.mapping[signalLetter][0]);
    }
  }

  cantBe(signalLetter: Letter, actualLetter: Letter) {
    const beforeCount = this.mapping[signalLetter].length;
    this.mapping[signalLetter] = difference(this.mapping[signalLetter], [actualLetter]);
    if (this.mapping[signalLetter].length === 1 && beforeCount > 1) {
      this.hasToBe(signalLetter, this.mapping[signalLetter][0]);
    }
  }
}

let total = 0;

lines.forEach((line) => {
  const [signals, digits] = line.split(" | ").map((data) => data.split(/ +/));
  const inputSignalLetterCounts = countBy(signals.map((s) => s.split("")).flat());
  const mapping = new Mapping();

  const signal1 = signals.find((s) => s.length === 2).split("") as Letter[]; // maps to -> cf
  const signal7 = signals.find((s) => s.length === 3).split("") as Letter[]; // maps to -> acf

  // This is like Sudoku

  // 7 is 'acf' and 1 is 'cf', signal difference maps to 'a'
  const signalForA = difference(signal7, signal1);
  assert(signalForA.length === 1, "signalForA.length !== 1");
  mapping.hasToBe(signalForA[0], "a");

  // 'c' and 'f' must map from signal1; all other signal letters cannot map to 'c' or 'f'
  difference(LETTERS, signal1).forEach((letter) => {
    mapping.cantBe(letter, "c");
    mapping.cantBe(letter, "f");
  });

  // signal for 4
  const signal4 = signals.find((s) => s.length === 4).split("") as Letter[]; // maps to -> bcdf
  signal4.forEach((letter) => mapping.hasToBeOneOf(letter, ["b", "c", "d", "f"]));

  // 'b' is used by 0, 4, 5, 6, 8, and 9, so it should appear 6 times in the input signals
  const [signalForB] = Object.entries(inputSignalLetterCounts).find(([key, value]) => value === 6);
  mapping.hasToBe(signalForB as Letter, "b");

  // 'e' is used by 0, 2, 6, and 8, so it should appear 4 times in the input signals
  const [signalForE] = Object.entries(inputSignalLetterCounts).find(([key, value]) => value === 4);
  mapping.hasToBe(signalForE as Letter, "e");

  // 2 is the only digit without an 'f'; all other digits have a letter that maps to 'f'
  // The letter will appear 9 times in the input.
  const [signalForF, _count] = Object.entries(inputSignalLetterCounts).find(([key, value]) => value === 9);
  mapping.hasToBe(signalForF as Letter, "f");

  // Narrow down mapping possibilities by using signal length -> possible digits
  // Note: this part works, but is unnecessary; we already know the answer!
  signals.forEach((signal) => {
    const letters = signal.split("").sort() as Letter[];
    const count = letters.length;
    const possibilities = DIGIT_LETTERS.map((str) => str.split(""))
      .filter((digitLetters) => digitLetters.length === count)
      .flat()
      .reduce((acc, item) => (acc.includes(item) ? acc : acc.concat(item)), []);
    letters.forEach((letter) => mapping.hasToBeOneOf(letter, possibilities));
  });

  const transformedDigits = digits
    .map((digit) => {
      const letters: string = digit
        .split("")
        .map((letter) => mapping.mapping[letter][0])
        .sort()
        .join("");
      return DIGIT_LETTERS.indexOf(letters);
    })
    .join("");

  total += parseInt(transformedDigits, 10);
});

console.log({ total });
