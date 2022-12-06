import { countBy } from "lodash";
import { readLines } from "../util";

const input = readLines("input.txt")[0];
for (let i = 0; i < input.length - 4; i++) {
  const counts = countBy(input.slice(i, i + 4).split(""));
  if (Object.values(counts).every((c) => c === 1)) {
    console.log("found it at ", i + 4);
    break;
  }
}
