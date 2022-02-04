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

const toStateString = (s: State): string => {
  const floorStrings = [s.f1, s.f2, s.f3, s.f4].map(toFloorString);
  return [s.elevator, ...floorStrings].join("/");
};

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
const state: string = toStateString({
  elevator: "f1",
  f1: ["Th.G", "Th.M", "Pl.G", "St.G"].map(fromObjString),
  f2: ["Pl.M", "St.M"].map(fromObjString),
  f3: ["Pr.G", "Pr.M", "Ru.G", "Ru.M"].map(fromObjString),
  f4: [].map(fromObjString)
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

const isSafe = (objects: Obj[]) => {
  objects = objects.filter((x) => x);
  return objects.every((o1) => {
    const hasGoodGenerator = objects.some((o2) => o1.type === "M" && o2.type === "G" && o1.element === o2.element);
    const noBadGenerator = objects.every((o2) => !(o1.type === "M" && o2.type === "G" && o1.element !== o2.element));
    return hasGoodGenerator || noBadGenerator;
  });
};

const neighbors = (floor: FloorID): FloorID[] => {
  if (floor === "f1") {
    return ["f2"];
  } else if (floor === "f2") {
    return ["f1", "f3"];
  } else if (floor === "f3") {
    return ["f2", "f4"];
  } else if (floor === "f4") {
    return ["f3"];
  }
};

const validMoves = (state: State): Move[] => {
  const destFloors = neighbors(state.elevator);
  const fromFloor = state[state.elevator];
  const objCombinations = combine2([...fromFloor, null]).filter((objectsToMove) => {
    const remaining = without(fromFloor, ...objectsToMove);
    return isSafe(objectsToMove) && isSafe(remaining);
  });

  return destFloors.flatMap((toFloor): Move[] => {
    return objCombinations
      .map(([obj1, obj2]): Move => ({ state, obj1, obj2, toFloor }))
      .filter((move) => isSafe(state[move.toFloor].concat(move.obj1, move.obj2)));
  });
};

const isDone = (state: State) => {
  const { f1, f2, f3, f4 } = state;
  return f1.length === 0 && f2.length === 0 && f3.length === 0 && f4.length > 0;
};

const move2String = (move: PendingMove) => {
  const { state, obj1, obj2, toFloor } = move.move;
  if (obj2) {
    return `${toObjString(obj1)}+${toObjString(obj2)} from ${state?.elevator} to ${toFloor}`;
  } else if (obj1) {
    return `${toObjString(obj1)} from ${state?.elevator} to ${toFloor}`;
  }
  return `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUGH from ${state?.elevator} to ${toFloor}`;
};

const getNextState = (move: Move): State => {
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
};

type PendingMove = { previousStates: State[]; move: Move };
const initialState = fromStateString(state);
const initialMoves: Move[] = validMoves(initialState);

const pendingMoves: PendingMove[] = initialMoves.map((move) => ({ previousStates: [initialState], move }));
const winners: Move[][] = [];

const seen: string[] = [];
while (pendingMoves.length !== 0 && winners.length === 0) {
  const testMove = pendingMoves.shift();
  const nextState = getNextState(testMove.move);
  const nextStateString = toStateString(nextState);
  if (!seen.includes(nextStateString)) {
    seen.push(nextStateString);
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
