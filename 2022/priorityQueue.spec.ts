import "jest";
import { PQ } from "./priorityQueue";
import { range } from "./util";

const numberPQ = () => new PQ<number>((a, b) => a - b);

describe("pq.peek()", () => {
  const pq = numberPQ();
  it("returns 5 (highest value) when values 1..5 are inserted in ascending order", () => {
    range(1, 5).forEach((x) => pq.push(x));
    expect(pq.peek()).toBe(5);
  });

  it("when values 5..1 are inserted in descending order", () => {
    const pq = numberPQ();
    range(5, 1).forEach((x) => pq.push(x));
    expect(pq.peek()).toBe(5);
  });

  it("when values -5..5 are inserted in ascending order", () => {
    const pq = numberPQ();
    range(-5, 5).forEach((x) => pq.push(x));
    expect(pq.peek()).toBe(5);
  });

  it("doesn't remove any values", () => {
    const pq = numberPQ();
    range(1, 5).forEach((x) => pq.push(x));
    expect(pq.length).toBe(5);
    expect(pq.peek()).toBe(5);
    expect(pq.peek()).toBe(5);
    expect(pq.peek()).toBe(5);
    expect(pq.length).toBe(5);
  });
});

describe("pq.pop()", () => {
  it("returns 5 (highest value) when values 1..5 are inserted in ascending order", () => {
    const pq = numberPQ();
    range(1, 5).forEach((x) => pq.push(x));
    expect(pq.pop()).toBe(5);
  });

  it("when values 5..1 are inserted in descending order", () => {
    const pq = numberPQ();
    range(5, 1).forEach((x) => pq.push(x));
    expect(pq.pop()).toBe(5);
  });

  it("returns 100 (highest value) when values 100..1 are inserted in descending order", () => {
    const pq = numberPQ();
    range(100, 1).forEach((x) => pq.push(x));
    expect(pq.pop()).toBe(100);
  });

  it("when values -5..5 are inserted in ascending order", () => {
    const pq = numberPQ();
    range(-5, 5).forEach((x) => pq.push(x));
    expect(pq.pop()).toBe(5);
  });

  it("removes and returns 5 (highest value) when 1..5 are inserted", () => {
    const pq = numberPQ();
    range(1, 5).forEach((x) => pq.push(x));
    expect(pq.length).toBe(5);
    expect(pq.pop()).toBe(5);
    expect(pq.length).toBe(4);
  });

  it("removes the highest value", () => {
    const pq = numberPQ();
    range(1, 5).forEach((x) => pq.push(x));
    expect(pq.length).toBe(5);
    expect(pq.pop()).toBe(5);
    expect(pq.length).toBe(4);
  });

  it("removes the [2] highest values", () => {
    const pq = numberPQ();
    range(1, 5).forEach((x) => pq.push(x));
    expect(pq.length).toBe(5);
    expect(pq.pop()).toBe(5);
    expect(pq.length).toBe(4);
    expect(pq.pop()).toBe(4);
    expect(pq.length).toBe(3);
  });
});
describe("pq", () => {
  it("handles values that sort the same", () => {
    const pq = numberPQ();
    [1, 1, 2, 2, 3, 3].forEach((x) => pq.push(x));
    expect(pq.pop()).toBe(3);
    expect(pq.pop()).toBe(3);
    expect(pq.pop()).toBe(2);
    expect(pq.pop()).toBe(2);
    expect(pq.pop()).toBe(1);
    expect(pq.pop()).toBe(1);
  });

  it("works as a min-tree when passed a function that sorts in reverse", () => {
    const pq = new PQ<number>((a, b) => b - a);
    [1, 2, 3, 9, 8, 7, 6, 5, 4].forEach((x) => pq.push(x));
    expect(pq.pop()).toBe(1);
    expect(pq.pop()).toBe(2);
    expect(pq.pop()).toBe(3);
    expect(pq.pop()).toBe(4);
    expect(pq.pop()).toBe(5);
    expect(pq.pop()).toBe(6);
    expect(pq.pop()).toBe(7);
    expect(pq.pop()).toBe(8);
    expect(pq.pop()).toBe(9);
  });

  it("can handle object based comparators", () => {
    type Wrapper = { val: number };
    const pq = new PQ<Wrapper>((a, b) => a.val - b.val);
    range(1, 10).forEach((val) => pq.push({ val }));
    expect(pq.pop().val).toBe(10);
  });
});
