import * as fs from "fs";
import { countBy, range } from "lodash";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const [template, ...rulesStrs] = fs.readFileSync(inputPath, "utf-8").split(/[\r\n]/);

const rules = rulesStrs
  .filter((x) => x)
  .map((rule) => rule.split(" -> "))
  .reduce((acc, [pair, insert]) => {
    acc[pair] = pair.replace(/^(.).*/, "$1" + insert);
    return acc;
  }, {});

rulesStrs
  .join("")
  .replace(/[^A-Z]/, "")
  .split("")
  .forEach((char) => {
    rules[char + undefined] = char;
  });

const insert = (template: string) => {
  const chars = template.split("");
  const pairs = chars.map((char, idx) => char + template[idx + 1]);
  return pairs.map((pair) => rules[pair]).join("");
};

const result = range(0, 10).reduce((acc) => insert(acc), template);

const results = countBy(result.split(""));
console.log({ results });
const max = Object.entries(results).reduce((acc, x) => (acc[1] > x[1] ? acc : x));
const min = Object.entries(results).reduce((acc, x) => (acc[1] < x[1] ? acc : x));
console.log(max[1] - min[1]);
