import { permutations, readLines, uniqR } from "../util";

const lines = readLines("input.txt");
const sues = lines.map((line) => {
  // Sue 4: perfumes: 2, vizslas: 0, cars: 6
  const [_, sue, rest] = /Sue (\d+): (.*)/.exec(line);
  const clues = Object.fromEntries(
    rest.split(", ").map((clue) => {
      const [key, value] = clue.split(": ");
      return [key, parseInt(value, 10)];
    })
  );
  return { sue: parseInt(sue, 10), clues };
});

const facts = {
  children: 3,
  cats: 7,
  samoyeds: 2,
  pomeranians: 3,
  akitas: 0,
  vizslas: 0,
  goldfish: 5,
  trees: 3,
  cars: 2,
  perfumes: 1,
};

const matches = sues.filter((sue) => {
  return Object.entries(facts).every(([key, value]) => {
    return !sue.clues.hasOwnProperty(key) || sue.clues[key] === value;
  });
});

console.log(matches);
