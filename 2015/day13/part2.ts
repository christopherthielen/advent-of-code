import { permutations, readLines, uniqR } from "../util";

const lines = readLines("input.txt");

const happinessData = lines.map((line) => {
  // Alice would gain 54 happiness units by sitting next to Bob.
  const [_, person1, plusminus, value, person2] = /(\w+) would (gain|lose) (\d+) happiness units by sitting next to (\w+)./.exec(line);
  const delta = parseInt(value, 10) * (plusminus === "gain" ? 1 : -1);
  return { person1, person2, delta };
});

const people = happinessData
  .map((hd) => [hd.person1, hd.person2])
  .flat()
  .reduce(uniqR, []);

people.forEach((person) => {
  happinessData.push({ person1: "me", person2: person, delta: 0 });
  happinessData.push({ person2: "me", person1: person, delta: 0 });
});
people.push("me");

const arrangements = permutations(people);
const best = [null, 0];
arrangements.forEach((arrangement) => {
  const totalHappiness = arrangement.reduce((acc, person, i) => {
    const neighbor1 = i === arrangement.length - 1 ? 0 : i + 1;
    const neighbor2 = i === 0 ? arrangement.length - 1 : i - 1;
    const happiness1 = happinessData.find((h) => h.person1 === person && h.person2 === arrangement[neighbor1]).delta;
    const happiness2 = happinessData.find((h) => h.person1 === person && h.person2 === arrangement[neighbor2]).delta;
    return acc + happiness1 + happiness2;
  }, 0);
  if (totalHappiness > best[1]) {
    best[0] = arrangement as any;
    best[1] = totalHappiness;
  }
});

console.log(best);
