type Player = { hp: number; damage: number; armor: number; mana: number };
const BOSS: Player = { hp: 71, damage: 10, armor: 0, mana: 0 };
const PLAYER: Player = { hp: 50, damage: 0, armor: 0, mana: 500 };
// const BOSS: Player = { hp: 14, damage: 8, armor: 0, mana: 0 };
// const PLAYER: Player = { hp: 10, damage: 0, armor: 0, mana: 250 };

const costs = { Missile: 53, Drain: 73, Shield: 113, Poison: 173, Recharge: 229 };
type Spell = keyof typeof costs;

const initialState = {
  spellsCast: [] as Spell[],
  bossHp: BOSS.hp,
  playerHp: PLAYER.hp,
  playerArmor: PLAYER.armor,
  playerMana: PLAYER.mana,
  playerManaSpend: 0,
  effectShield: 0,
  effectPoison: 0,
  effectRecharge: 0,
};

type GS = typeof initialState;

function checkLoser(gameState: GS) {
  if (gameState.bossHp <= 0) {
    return gameState;
  } else if (gameState.playerHp <= 0) {
    return gameState;
  }
}

function runEffects(gameState: GS) {
  gameState.playerArmor = gameState.effectShield ? 7 : 0;
  gameState.bossHp += gameState.effectPoison ? -3 : 0;
  gameState.playerMana += gameState.effectRecharge ? 101 : 0;
  gameState.effectShield = Math.max(0, gameState.effectShield - 1);
  gameState.effectPoison = Math.max(0, gameState.effectPoison - 1);
  gameState.effectRecharge = Math.max(0, gameState.effectRecharge - 1);
}

const availableSpells = (gameState: GS) => {
  const spells: Spell[] = ["Missile", "Drain", "Shield", "Poison", "Recharge"];
  return spells.filter((key) => {
    return !gameState["effect" + key] && gameState.playerMana >= costs[key];
  });
};

function cast(gameState: GS, spell: Spell) {
  gameState.spellsCast.push(spell);
  gameState.playerManaSpend += costs[spell];
  gameState.playerMana -= costs[spell];
  if (gameState.playerMana < 0) {
    throw new Error("Whoops, out of mana");
  }
  switch (spell) {
    case "Missile":
      gameState.bossHp -= 4;
      break;
    case "Drain":
      gameState.bossHp -= 2;
      gameState.playerHp += 2;
      break;
    case "Shield":
      gameState.effectShield = 6;
      break;
    case "Poison":
      gameState.effectPoison = 6;
      break;
    case "Recharge":
      gameState.effectRecharge = 5;
      break;
  }
}

const stack = [] as Array<{ gameState: GS; spell: Spell }>;

function queueNext(gameState: GS) {
  const spells = availableSpells(gameState);
  spells.forEach((spell) => {
    stack.push({ gameState: cloneGs(gameState), spell });
  });
}

function turn(gameState: GS, spell: Spell): GS {
  // player casts spell
  cast(gameState, spell);
  if (checkLoser(gameState)) {
    return gameState;
  }

  // run effects before boss move
  runEffects(gameState);
  if (checkLoser(gameState)) {
    return gameState;
  }
  // boss move
  gameState.playerHp -= BOSS.damage - gameState.playerArmor;
  if (checkLoser(gameState)) {
    return gameState;
  }
  // run effects before next player move
  runEffects(gameState);
  if (checkLoser(gameState)) {
    return gameState;
  }
  queueNext(gameState);
}

const cloneGs = (gs: GS): GS => ({ ...gs, spellsCast: gs.spellsCast.slice() });
queueNext(initialState);
const games: GS[] = [];
while (stack.length) {
  const { gameState, spell } = stack.pop();
  const result = turn(gameState, spell);
  if (result) {
    games.push(result);
  }
}
const playerWins = games.filter((gs) => gs.playerHp > 0);
const bossWins = games.filter((gs) => gs.bossHp > 0);
if (playerWins.length + bossWins.length !== games.length) {
  throw new Error("Huh...");
}

playerWins.sort((a, b) => a.playerManaSpend - b.playerManaSpend);
console.log({ player: playerWins.length, boss: bossWins.length });
console.log(playerWins[0]);
console.log(playerWins[playerWins.length - 1]);
