import { groupBy, range, readLines, uniqR } from "../util";

// const lines = readLines("example1.txt");
const lines = readLines("input.txt");

const replacements = groupBy(
  lines.filter((x) => x.includes(" => ")).map((line) => line.split(" => ")),
  ([srcMolo, replaceMolo]) => replaceMolo,
  ([srcMolo, replaceMolo]) => srcMolo
);

const molocule = lines.filter((x) => !x.includes(" => "))[0];
const atoms = molocule.split("").reduce((acc, x) => {
  if (x.toLowerCase() === x) {
    acc[acc.length - 1] += x;
  } else {
    acc.push(x);
  }
  return acc;
}, []);

const replaceStrings = Object.keys(replacements).sort((a, b) => b.length - a.length);
// console.log(replacements);

let string = molocule;
let done = false;
let count = 0;
console.log(string);
while (!done) {
  const found = replaceStrings.find((str) => string.indexOf(str) !== -1);
  if (found) {
    count++;
    string = string.replace(found, replacements[found]);
  } else {
    done = true;
  }
}
console.log(string, count);
