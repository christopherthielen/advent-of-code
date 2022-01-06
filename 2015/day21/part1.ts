import { combine, product } from "../util";

type Stat = { name: string; cost: number; damage: number; armor: number };
const WEAPONS: Stat[] = [
  { name: "dagger", cost: 8, damage: 4, armor: 0 },
  { name: "Shortsword", cost: 10, damage: 5, armor: 0 },
  { name: "Warhammer", cost: 25, damage: 6, armor: 0 },
  { name: "Longsword", cost: 40, damage: 7, armor: 0 },
  { name: "Greataxe", cost: 74, damage: 8, armor: 0 },
];

const ARMOR: Stat[] = [
  { name: "Armor: None", cost: 0, damage: 0, armor: 0 },
  { name: "Leather", cost: 13, damage: 0, armor: 1 },
  { name: "Chainmail", cost: 31, damage: 0, armor: 2 },
  { name: "Splintmail", cost: 53, damage: 0, armor: 3 },
  { name: "Bandedmail", cost: 75, damage: 0, armor: 4 },
  { name: "Platemail", cost: 102, damage: 0, armor: 5 },
];

const RINGS: Stat[] = [
  { name: "Ring: None 1", cost: 0, damage: 0, armor: 0 },
  { name: "Ring: None 2", cost: 0, damage: 0, armor: 0 },
  { name: "Damage +1", cost: 25, damage: 1, armor: 0 },
  { name: "Damage +2", cost: 50, damage: 2, armor: 0 },
  { name: "Damage +3", cost: 100, damage: 3, armor: 0 },
  { name: "Defense +1", cost: 20, damage: 0, armor: 1 },
  { name: "Defense +2", cost: 40, damage: 0, armor: 2 },
  { name: "Defense +3", cost: 80, damage: 0, armor: 3 },
];

const weapons = WEAPONS.map((x) => x.name);
const armor = ARMOR.map((x) => x.name);
const rings = RINGS.map((x) => x.name);

type Player = { hp: number; damage: number; armor: number };
const BOSS: Player = { hp: 104, damage: 8, armor: 1 };
const player: Player = { hp: 100, damage: 0, armor: 0 };

function turnsRequired(attacker: Player, defender: Player): number {
  const damagePerTurn = Math.max(1, attacker.damage - defender.armor);
  return Math.ceil(defender.hp / damagePerTurn);
}

const ringCombos = combine(RINGS, 2);
const all = product(product(WEAPONS, ARMOR), ringCombos).map((x) => x.flat());
const winners = all.filter((stats) => {
  const damage = stats.reduce((acc, x) => acc + x.damage, 0);
  const armor = stats.reduce((acc, x) => acc + x.armor, 0);
  const p = { hp: player.hp, damage, armor };
  return turnsRequired(p, BOSS) <= turnsRequired(BOSS, p);
});

const minCost = winners.reduce((acc, x) => {
  const cost = x.reduce((acc, x) => acc + x.cost, 0);
  return Math.min(acc, cost);
}, Number.MAX_SAFE_INTEGER);

console.log(winners.length);
console.log(minCost);
