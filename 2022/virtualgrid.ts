import { Coord, Direction, IItem } from "./grid";
import { Perf } from "./perf";
import { range } from "./util";

const minVal = (numbers: number[]) => numbers.reduce((acc, x) => Math.min(acc, x));
const maxVal = (numbers: number[]) => numbers.reduce((acc, x) => Math.max(acc, x));

// Finds the index matching the number
// [0, 1, 2, 3, 4, 5, 6, 7, 8]
/** @param cmp comparison function with 'other' parameter
 * - if 'other' is the desired value return 0
 * - if 'desiredValue' is greater than 'other' return > 0 (i.e. return desiredval - other)
 * - if 'desiredValue' is less than 'other', return < 0 (i.e., return desiredval - other)
 * @return the index of the matching item, or the index where the matching item would be.
 *    Always check if the item is actually found at the returned index.
 * */
export const binarySearch = <T>(items: T[], cmp: (other: T) => number): number => {
  let low = 0;
  let high = items.length;
  while (high !== low) {
    let idx = low + Math.floor((high - low) / 2);
    const comparison = cmp(items[idx]);
    if (comparison === 0) {
      return idx;
    } else if (comparison > 0) {
      if (low === idx) return high;
      low = idx;
    } else if (comparison < 0) {
      if (high === idx) return low;
      high = idx;
    }
  }
  return high;
};

const xySort = (a: Coord, b: Coord) => {
  const dx = a.x - b.x;
  return dx !== 0 ? dx : a.y - b.y;
};

// Backed by a real Grid, automatically expands if a coordinate outside the current bounds is requested
export class VirtualGrid<T = any> {
  constructor(public factory: () => T, bucketCount = 1) {
    this.rebucket(bucketCount);
  }

  public buckets: VItem<T>[][] = [];
  private itemCount = 0;

  minX: number = null;
  minY: number = null;
  maxX: number = null;
  maxY: number = null;

  private bucket = (x: number, y: number) => this.buckets[Math.abs(x + y) % this.buckets.length];

  @Perf()
  private rebucket(bucketCount: number) {
    const itemsCopy = this.buckets;
    this.buckets = new Array(bucketCount).fill(0).map(() => []);
    itemsCopy.flat().forEach((item) => this.bucket(item.x, item.y).push(item));
    this.buckets.forEach((bucket) => bucket.sort(xySort));
  }

  @Perf()
  public clone(): VirtualGrid<T> {
    const clone = new VirtualGrid(this.factory);
    clone.buckets = this.buckets.map((bucket) => bucket.map((item) => new VItem(clone, item.x, item.y, item.val)));
    clone.minX = this.minX;
    clone.minY = this.minY;
    clone.maxX = this.maxX;
    clone.maxY = this.maxY;
    return clone;
  }

  @Perf()
  set(x: number, y: number, val: T): void {
    const item = this.getItem(x, y) ?? this.addItem(x, y);
    item.val = val;
  }

  has(x: number, y: number): boolean {
    return Boolean(this.getItem(x, y));
  }

  @Perf()
  getItem(x: number, y: number): VItem<T> {
    const desiredCoordinate = { x, y };
    const bucket = this.bucket(x, y);
    const idx = binarySearch(bucket, (other) => xySort(desiredCoordinate, other));
    const maybeItem = bucket[idx];
    return maybeItem && xySort(desiredCoordinate, maybeItem) === 0 ? maybeItem : undefined;
  }

  @Perf()
  addItem(x: number, y: number): VItem<T> {
    const desiredCoordinate = { x, y };
    const newItem = new VItem<T>(this, x, y, this.factory());
    const bucket = this.bucket(x, y);
    const insertionIdx = binarySearch(bucket, (other) => xySort(desiredCoordinate, other));
    bucket.splice(insertionIdx, 0, newItem);
    this.onItemAdded(newItem);
    return newItem;
  }

  @Perf()
  get(x: number, y: number): T {
    const item = this.getItem(x, y);
    return item ? item.val : this.factory();
  }

  @Perf()
  row(y: number, minx?: number, maxx?: number) {
    const items = this.buckets.flat().filter((r) => r.y === y && r.x >= minx && r.x <= maxx);
    const get = (x: number) => items.find((i) => i.x === x);
    const min = minx ?? minVal(items.map((i) => i.x));
    const max = maxx ?? maxVal(items.map((i) => i.x));
    return range(min, max).map((x) => get(x) ?? new VItem<T>(this, x, y, this.factory()));
  }

  @Perf()
  col(x: number, miny?: number, maxy?: number) {
    const items = this.buckets.flat().filter((r) => r.x === x);
    const get = (y: number) => items.find((i) => i.y === y);
    const min = miny ?? minVal(items.map((i) => i.y));
    const max = maxy ?? maxVal(items.map((i) => i.y));
    return range(min, max).map((y) => get(y) ?? new VItem<T>(this, x, y, this.factory()));
  }

  private onItemAdded(newItem: VItem<T>) {
    const first = this.itemCount++ === 0;
    this.minX = first ? newItem.x : Math.min(this.minX, newItem.x);
    this.maxX = first ? newItem.x : Math.max(this.maxX, newItem.x);
    this.minY = first ? newItem.y : Math.min(this.minY, newItem.y);
    this.maxY = first ? newItem.y : Math.max(this.maxY, newItem.y);
    if (this.itemCount / this.buckets.length > 1024 * 1024) {
      this.rebucket(this.buckets.length * 2);
    }
  }

  @Perf()
  toString(itemToString: (item: VItem<T>) => string = (i) => i.val as any) {
    return range(this.minY, this.maxY)
      .map((y) => {
        return this.row(y, this.minX, this.maxX)
          .map((item) => itemToString(item))
          .join("");
      })
      .join("\n");
  }
}

class VItem<T> implements IItem<T> {
  constructor(private grid: VirtualGrid, public x, public y, public val: T) {}

  private neighbor(dx: -1 | 0 | 1, dy: -1 | 0 | 1): IItem<T> {
    return this.grid.getItem(this.x + dx, this.y + dy) ?? new VItem(this.grid, this.x + dx, this.y + dy, this.grid.factory());
  }

  get nw(): IItem<T> {
    return this.neighbor(-1, -1);
  }

  get n(): IItem<T> {
    return this.neighbor(0, -1);
  }

  get ne(): IItem<T> {
    return this.neighbor(1, -1);
  }

  get w(): IItem<T> {
    return this.neighbor(-1, 0);
  }

  get e(): IItem<T> {
    return this.neighbor(1, 0);
  }

  get sw(): IItem<T> {
    return this.neighbor(-1, 1);
  }

  get s(): IItem<T> {
    return this.neighbor(0, 1);
  }

  get se(): IItem<T> {
    return this.neighbor(1, 1);
  }

  neighbors(directions?: Direction[]): IItem<T>[] {
    return directions.map((d) => this[d]);
  }
}
