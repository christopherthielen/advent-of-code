import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const [template, ...rulesStrs] = fs.readFileSync(inputPath, "utf-8").split(/[\r\n]/);

const rules = rulesStrs
  .filter((x) => x)
  .map((rule) => rule.split(" -> "))
  .reduce((acc, [pair, insert]) => {
    acc[pair] = insert;
    return acc;
  }, {});

const counts = (left: string, right: string, iterations: number, accumulator: { [key: string]: number }, twentymore) => {
  if (iterations === 0) {
    if (twentymore) {
      Object.entries(twenty[left + right]).forEach(([char, count]) => {
        accumulator[char] = accumulator[char] ?? 0;
        accumulator[char] += count;
      });
    }
    return;
  }
  // console.log(totalIterations++);

  const insert = rules[left + right];
  accumulator[insert] = (accumulator[insert] ?? 0) + 1;
  counts(left, insert, iterations - 1, accumulator, twentymore);
  counts(insert, right, iterations - 1, accumulator, twentymore);
};

// cache the stats for each pair after 20 rounds
const twenty: { [key: string]: { [key: string]: number } } = {};
Object.keys(rules).forEach((pair) => {
  const stats = {};
  counts(pair.charAt(0), pair.charAt(1), 20, stats, false);
  twenty[pair] = stats;
});

const processTemplate = (template: string): { [key: string]: number } => {
  const stats = {};
  template.split("").forEach((char, idx) => (stats[char] = 1));
  for (let i = 0; i < template.length - 1; i++) {
    counts(template.charAt(i), template.charAt(i + 1), 20, stats, true);
  }
  return stats;
};

const results = processTemplate(template);

console.log({ results });
const max = Object.entries(results).reduce((acc, x) => (acc[1] > x[1] ? acc : x));
const min = Object.entries(results).reduce((acc, x) => (acc[1] < x[1] ? acc : x));
console.log(max[1] - min[1]);
