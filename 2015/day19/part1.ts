import { groupBy, range, readLines, uniqR } from "../util";

const lines = readLines("input.txt");
const replacements = groupBy(
  lines.filter((x) => x.includes(" => ")).map((line) => line.split(" => ")),
  ([srcMolo, replaceMolo]) => srcMolo,
  ([srcMolo, replaceMolo]) => replaceMolo
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

const result = range(0, atoms.length - 1)
  .flatMap((idx) => {
    const replace = replacements[atoms[idx]] ?? [];
    return replace.map((r) => {
      return atoms
        .slice(0, idx)
        .concat(r)
        .concat(atoms.slice(idx + 1))
        .join("");
    });
  })
  .reduce(uniqR, []);

console.log(result.length);

// 1) guessed 208 (too low)
// 2) guessed 536 (too high)

// const path = atoms.map((char) => replacements[char] ?? [char]);
// const result = path
//   .flatMap((repls, idx) => {
//     return repls.map((repl) => {
//       const chars = atoms.slice();
//       chars[idx] = repl;
//       return chars.join("");
//     });
//   })
//   .reduce(uniqR, []);
//
// function expand(path: string[][]): string[] {
//   if (path.length === 1) {
//     return path[0];
//   }
//   const first = path[0];
//   const rest = expand(path.slice(1));
//   return first.flatMap((repl) => {
//     return rest.map((r) => repl + r);
//   });
// }
// const all = expand(result);
