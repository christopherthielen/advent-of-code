import { readLines, splitArray, toInt } from "../util";

const isDigit = (char: string) => !!/[0-9]+/.exec(char);
const lines = readLines("input.txt", false);
const pairs = splitArray(lines, (line) => line.length === 0).filter(([left, right]) => left?.length && right?.length);
const tokenize = (line: string) => {
  return line
    .split("")
    .reduce((acc, char) => {
      if (isDigit(char) && isDigit(acc[acc.length - 1])) {
        acc[acc.length - 1] = acc[acc.length - 1] + char;
      } else {
        acc.push(char);
      }
      return acc;
    }, [] as string[])
    .filter((token) => token !== ",")
    .map((token) => (isDigit(token) ? toInt(token) : token));
};

type Data = (number | Data)[];
const parse = (tokens: (string | number)[]): Data => {
  let current = [];
  const stack = [current];
  while (tokens.length) {
    const item = tokens.shift();
    if (item === "[") {
      const next = [];
      current.push(next);
      stack.push(next);
      current = next;
    } else if (item === "]") {
      stack.pop();
      current = stack[stack.length - 1];
    } else {
      current.push(item);
    }
  }
  return stack[0][0];
};

type ISOK = "good" | "bad" | "unsure";
const isok = (leftdata: Data, rightdata: Data): ISOK => {
  // console.log("comparing", { leftdata: JSON.stringify(leftdata), rightdata: JSON.stringify(rightdata) });

  const isgood = (hint?: string): ISOK => {
    // hint && console.log("true: " + hint);
    return "good";
  };

  const isbad = (hint?: string): ISOK => {
    // hint && console.log("false: " + hint);
    return "bad";
  };

  for (let idx = 0; idx < leftdata.length && idx < rightdata.length; idx++) {
    const left = leftdata[idx];
    const right = rightdata[idx];
    // console.log({ left, right });
    if (typeof left === "number" && typeof right === "number") {
      if (left < right) {
        return isgood("left < right");
      } else if (right < left) {
        return isbad("right < left ");
      }
    } else if (Array.isArray(left) || Array.isArray(right)) {
      const l = typeof left === "number" ? [left] : left;
      const r = typeof right === "number" ? [right] : right;
      const result = isok(l, r);
      if (result === "good") {
        return isgood("[array] [array]");
      } else if (result === "bad") {
        return isbad("[array] [array]");
      } else if (l.length < r.length) {
        return isgood("[left list].length < [right list].length");
      } else if (r.length < l.length) {
        return isbad("[right list].length < [left list].length");
      }
    }
  }

  return "unsure";
};

const ok = (pair: string[]) => {
  const data1 = parse(tokenize(pair[0]));
  const data2 = parse(tokenize(pair[1]));
  return isok([data1], [data2]);
};

const total = pairs.slice(0).reduce((acc, pair, idx) => {
  if (ok(pair) === "unsure") {
    console.log(pair);
  }
  // console.log(idx + 1, ok(pair));
  return ok(pair) === "good" ? acc + (idx + 1) : acc;
}, 0);

console.log(total);
