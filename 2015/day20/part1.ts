const MIN_PRESENTS = 34000000;

function presentsForHouse(house: number) {
  const factors = [];
  let max = house;
  for (let i = 1; i <= max; i++) {
    if (house % i === 0) {
      factors.push(i, house / i);
      max = house / i;
    }
  }
  return factors.reduce((acc, x) => acc + x) * 10;
}

let ticks = Date.now();
let house = 1;
let max = 0;
while (true) {
  let number = presentsForHouse(house++);
  max = Math.max(number, max);
  if (number >= MIN_PRESENTS) {
    break;
  }
  if (Date.now() - ticks > 1000) {
    console.log(`[max: ${max}] House ${house++} got ${number} presents.`);
    ticks = Date.now();
  }
}

console.log(`House ${--house} got ${presentsForHouse(house)} presents.`);
