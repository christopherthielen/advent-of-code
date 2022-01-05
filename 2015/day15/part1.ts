import { range, readLines, toInt } from "../util";

type Ingredient = ReturnType<typeof parse>;
const parse = (line: string) => {
  const regExp = /(\w+): capacity (-?\d+), durability (-?\d+), flavor (-?\d+), texture (-?\d+), calories (-?\d+)/;
  const match = regExp.exec(line);
  const [capacity, durability, flavor, texture, calories] = match.slice(2).map(toInt);
  return { ingredient: match[1], score: [capacity, durability, flavor, texture], calories };
};
const ingredients: Ingredient[] = readLines("input.txt").map(parse);

function score(ingredients: Ingredient[], mult: number[]) {
  const scores = ingredients.map((ing, idx) => product(ing.score, new Array(ing.score.length).fill(mult[idx])));
  const added = scores.reduce((acc, score) => add(acc, score));
  return added.map((x) => Math.max(0, x)).reduce((acc, x) => acc * x);
}

const product = (values: number[], mult: number[]) => values.map((v, i) => v * mult[i]);
const add = (values: number[], add: number[]) => values.map((v, i) => v + add[i]);

function combinationsForTotal(variables: number, total: number): number[][] {
  if (variables === 1) return [[total]];
  return range(0, total)
    .map((x) => combinationsForTotal(variables - 1, total - x).map((nested) => [x, ...nested]))
    .flat();
}

const combinations = combinationsForTotal(ingredients.length, 100);
const scores = combinations.map((c) => score(ingredients, c));
const best = scores.reduce((acc, x) => (acc > x ? acc : x), 0);
console.log(best);
