import { readLines, toInt } from "../util";

// const file = "example.txt";
const file = "input.txt";

const lines = readLines(file);
lines.map((line) => {
  const marker = /\((\d+)x(\d+)\)/;
  let result = 0;
  let str = line;
  let match = marker.exec(str);
  while (match) {
    result += str.substring(0, match.index).length;
    const matched = match[0];
    const charCount = toInt(match[1]);
    const repeatCount = toInt(match[2]);
    const matchEnd = match.index + matched.length;
    const chars = str.substring(matchEnd, matchEnd + charCount);
    let repeatStr = "";
    for (let i = 0; i < repeatCount; i++) {
      repeatStr += chars;
    }
    str = repeatStr + str.substring(matchEnd + charCount);
    // str = str.substring(matchEnd + charCount);
    // console.log({ str, match, matched, charCount, repeatCount, matchEnd, chars });
    match = marker.exec(str);
  }
  result += str.length;
  console.log(result);
});
