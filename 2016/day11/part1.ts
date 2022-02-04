import { perf, showPerf } from "../perf";
import { combine2, toInt, without } from "../util";

type Type = "G" | "M";
type Element = "Th" | "Pl" | "St" | "Pr" | "Ru" | "H" | "Li";
type Obj = { element: Element; type: Type };
type Floor = Obj[];
type FloorID = "f1" | "f2" | "f3" | "f4";
type State = { elevator: FloorID; f1: Floor; f2: Floor; f3: Floor; f4: Floor };
type ObjString = `${Element}.${Type}`;

const toObjString = ({ element, type }: Obj): ObjString => `${element}.${type}`;

const fromObjString = (objString: ObjString): Obj => {
  const [element, type] = objString.split(".");
  return { element: element as Element, type: type as Type };
};

const toFloorString = (floor: Floor): string =>
  floor
    .map(toObjString)
    .sort((a, b) => a.localeCompare(b))
    .join("+");

const fromFloorString = (floorString: string): Floor =>
  floorString
    .split("+")
    .filter((x) => x)
    .map((x: ObjString) => fromObjString(x));

const toStateString = perf(function toStateString(s: State): string {
  const floorStrings = [s.f1, s.f2, s.f3, s.f4].map(toFloorString);
  return [s.elevator, ...floorStrings].join("/");
});

const fromStateString = (state: string): State => {
  const [elevator, ...floors] = state.split("/");
  const [f1, f2, f3, f4] = floors.map(fromFloorString);
  return { elevator: elevator as FloorID, f1, f2, f3, f4 };
};

// The first floor contains a thulium generator, a thulium-compatible microchip, a plutonium generator, and a strontium generator.
// The second floor contains a plutonium-compatible microchip and a strontium-compatible microchip.
// The third floor contains a promethium generator, a promethium-compatible microchip, a ruthenium generator, and a ruthenium-compatible microchip.
// The fourth floor contains nothing relevant.

// prettier-ignore
const part1: string = toStateString({
  elevator: "f1",
  f1: ["Th.G", "Th.M", "Pl.G", "St.G"].map(fromObjString),
  f2: ["Pl.M", "St.M"].map(fromObjString),
  f3: ["Pr.G", "Pr.M", "Ru.G", "Ru.M"].map(fromObjString),
  f4: [].map(fromObjString)
});

const part2: string = toStateString({
  elevator: "f1",
  f1: ["Th.G", "Th.M", "Pl.G", "St.G", "El.G", "El.M", "Di.G", "Di.M"].map(fromObjString),
  f2: ["Pl.M", "St.M"].map(fromObjString),
  f3: ["Pr.G", "Pr.M", "Ru.G", "Ru.M"].map(fromObjString),
  f4: [].map(fromObjString),
});

// prettier-ignore
const example: string = toStateString({
  elevator: "f1",
  f1: ["H.M", "Li.M"].map(fromObjString),
  f2: ["H.G"].map(fromObjString),
  f3: ["Li.G"].map(fromObjString),
  f4: [].map(fromObjString)
});

type Move = {
  state: State;
  toFloor: FloorID;
  obj1: Obj;
  obj2?: Obj;
};

const isSafe = perf(function isSafe(objects: Obj[]) {
  objects = objects.filter((x) => x);
  return objects.every((o1) => {
    const hasGoodGenerator = objects.some((o2) => o1.type === "M" && o2.type === "G" && o1.element === o2.element);
    const noBadGenerator = objects.every((o2) => !(o1.type === "M" && o2.type === "G" && o1.element !== o2.element));
    return hasGoodGenerator || noBadGenerator;
  });
});

const isSafe2 = (objects: Obj[]) => {
  return objects.every((o1) => {
    if (o1 === null || o1.type !== "M") {
      return true;
    }

    const hasMatchingGenerator = objects.some((o2) => o2 && o2.type === "G" && o1.element === o2.element);
    if (!hasMatchingGenerator) {
      return false;
    }

    const hasNonmatchingGenerator = objects.some((o2) => o2 && o2.type === "G");
    return !hasNonmatchingGenerator;
  });
};

const neighbors: { [key: string]: FloorID[] } = {
  f1: ["f2"],
  f2: ["f1", "f3"],
  f3: ["f2", "f4"],
  f4: ["f3"],
};

const validMoves = perf(function validMoves(state: State): Move[] {
  const destFloors = neighbors[state.elevator];
  const fromFloor = state[state.elevator];
  const objCombinations = combine2([...fromFloor, null])
    .filter((objectsToMove) => objectsToMove[1] === null || isSafe(objectsToMove))
    .filter((objectsToMove) => isSafe(without(fromFloor, ...objectsToMove)));

  return destFloors.flatMap((toFloor): Move[] => {
    return objCombinations
      .map(([obj1, obj2]): Move => ({ state, obj1, obj2, toFloor }))
      .filter((move) => isSafe(state[move.toFloor].concat(move.obj1, move.obj2)));
  });
});

const isDone = perf(function isDone(state: State) {
  return state.f1.length === 0 && state.f2.length === 0 && state.f3.length === 0 && state.f4.length > 0;
});

const getNextState = perf(function getNextState(move: Move): State {
  const newFloorObjects = (floor: FloorID): Floor => {
    const src = move.state[floor];
    if (floor === move.toFloor) {
      return src.concat(move.obj1, move.obj2).filter((x) => x);
    } else if (floor === move.state.elevator) {
      return without(src, move.obj1, move.obj2);
    }
    return src;
  };

  return {
    elevator: move.toFloor,
    f1: newFloorObjects("f1"),
    f2: newFloorObjects("f2"),
    f3: newFloorObjects("f3"),
    f4: newFloorObjects("f4"),
  };
});

type PendingMove = { previousStates: State[]; move: Move };
const initialState = fromStateString(part2);
const initialMoves: Move[] = validMoves(initialState);

const pendingMoves: PendingMove[] = initialMoves.map((move) => ({ previousStates: [initialState], move }));
let pmidx = 0;
const nextMove = perf(function nextMove() {
  if (pmidx > 1000) {
    pendingMoves.splice(0, pmidx);
    pmidx = 0;
  }
  return pendingMoves[pmidx++];
});
const winners: Move[][] = [];

let count = 0;
let start = Date.now();
let ticks = start;
const seen = {};
while (pendingMoves.length !== 0 && winners.length === 0) {
  const testMove = nextMove();
  count++;
  if (Date.now() - ticks > 2000) {
    ticks = Date.now();
    console.log(`tested ${count} moves (${(count / (ticks - start)) * 1000}/sec), current depth ${testMove.previousStates.length}`);
    showPerf();
  }

  const nextState = getNextState(testMove.move);
  const nextStateString = toStateString(nextState);
  if (!seen[nextStateString]) {
    seen[nextStateString] = true;
    if (isDone(nextState)) {
      testMove.previousStates.forEach((s, idx) => console.log(idx + ": " + toStateString(s)));
      console.log(testMove.previousStates.length + ": " + toStateString(nextState));
      process.exit(1);
    } else {
      const nextMoves = validMoves(nextState);
      nextMoves.forEach((move) => {
        pendingMoves.push({ previousStates: [...testMove.previousStates, nextState], move });
      });
    }
  }
}
