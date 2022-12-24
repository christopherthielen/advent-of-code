import { range } from "./util";
import { binarySearch } from "./virtualgrid";

describe("binarySearch", () => {
  it("finds indexes of known values", () => {
    const items = range(0, 99);
    const idxOf = (val: number) => binarySearch(items, (other) => val - other);
    expect(idxOf(50)).toBe(50);
    expect(idxOf(25)).toBe(25);
    expect(idxOf(99)).toBe(99);
    expect(idxOf(0)).toBe(0);
    expect(idxOf(1)).toBe(1);
  });

  it("finds insertion indexes of unknown values", () => {
    const items = range(0, 99);
    const idxOf = (val: number) => binarySearch(items, (other) => val - other);
    expect(idxOf(50.1)).toBe(51);
    expect(idxOf(25.1)).toBe(26);
    expect(idxOf(99.1)).toBe(100);
    expect(idxOf(-1)).toBe(0);
    expect(idxOf(0.1)).toBe(1);
    expect(idxOf(0.9)).toBe(1);
    expect(idxOf(1.1)).toBe(2);
    expect(idxOf(100)).toBe(100);
    expect(idxOf(10000000000000)).toBe(100);
  });
});
