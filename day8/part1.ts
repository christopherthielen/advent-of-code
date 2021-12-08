import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const lines = input.split(/[\r\n]/).filter((line) => !!line);

class LedDisplay {
  constructor(line: string) {
    const [signalStr, digitStr] = line.split(" | ");
    // this.signals =
  }
}

type X = 0 | 1 | 2 | 3 | 4 | 5;
type Y = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Coord = [X, Y];

const knownDigits = ["abcefg", "cf", "acdeg", "acdfg", "bcdf", "abdfg", "abdefg", "acf", "abcdefg", "abcdfg"];

class Digit {
  private segments: string[];

  constructor(segments: string) {
    this.segments = segments.split("").sort();
  }

  toString() {
    // prettier-ignore
    const segmentCoords: { [key: string]: Coord[] } = {
      a: [[1, 0], [2, 0], [3, 0], [4, 0]],
      b: [[0, 1], [0, 2]],
      c: [[5, 1], [5, 2]],
      d: [[1, 3], [2, 3], [3, 3], [4, 3]],
      e: [[0, 4], [0, 5]],
      f: [[5, 4], [5, 5]],
      g: [[1, 6], [2, 6], [3, 6], [4, 6]]
    };

    const output = new Array(7).fill("").map(() => "      ".split(""));
    this.segments.forEach((s) => {
      segmentCoords[s].forEach(([x, y]) => {
        output[y][x] = s;
      });
    });

    return output.map((line) => line.join("")).join("\n");
  }
}

for (let i = 0; i < 10; i++) {
  console.log(new Digit(knownDigits[i]).toString());
}
