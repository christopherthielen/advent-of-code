import { readLines } from "../util";

const lines = readLines("input.txt");
const nice = lines
  .filter((line) => {
    for (let i = 0; i < line.length - 1; i++) {
      const pair = line.substring(i, i + 2);
      const next = line.indexOf(pair, i + 2);
      if (next !== -1) {
        // console.log({ line, i, pair, next });
        return true;
      }
    }
  })
  // .filter((line) => {
  //   for (let i = 0; i < line.length - 1; i++) {
  //     const pair = line.substring(i, i + 1);
  //     const next = line.indexOf(pair, i + 2);
  //     if (next !== -1) {
  //       return true;
  //     }
  //   }
  // })
  .filter((line) => line.split("").some((c, i) => line[i + 2] === c));

console.log(nice.length);
