import { array2d, Grid, Item } from "../grid";
import { readLines, toInt } from "../util";

// const file = "example.txt";
const file = "input.txt";

const lines = readLines(file);
lines.map((line) => {
  const marker = /\((\d+)x(\d+)\)/;
  let result = "";
  let str = line;
  let match = marker.exec(str);
  while (match) {
    result += str.substring(0, match.index);
    const matched = match[0];
    const charCount = toInt(match[1]);
    const repeatCount = toInt(match[2]);
    const matchEnd = match.index + matched.length;
    const chars = str.substring(matchEnd, matchEnd + charCount);
    for (let i = 0; i < repeatCount; i++) {
      result += chars;
    }
    str = str.substring(matchEnd + charCount);
    match = marker.exec(str);
  }
  result += str;
  console.log(result.length);
});
