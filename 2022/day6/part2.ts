import { countBy } from "lodash";
import { readLines } from "../util";

const input = readLines("input.txt")[0];
const WINDOW = 14;
for (let i = 0; i < input.length - WINDOW; i++) {
  const counts = countBy(input.slice(i, i + WINDOW).split(""));
  if (Object.values(counts).every((c) => c === 1)) {
    console.log("found it at ", i + WINDOW);
    break;
  }
}
