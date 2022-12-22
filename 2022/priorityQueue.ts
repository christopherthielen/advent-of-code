/*
 a tree backed by a 0 based array, the tree indexes look like:
                        0
                  1           2
              3      4     5     6
            7  8   9 10  11 12 13 14

 left child   = idx * 2 + 1
 right child  = idx * 2 + 2
 parent       = Math.floor((idx - 1) / 2)
 */

export class PQ<T> {
  constructor(private compareFn: (a: T, b: T) => number) {}

  private heap: T[] = [];

  private swap(idx1: number, idx2: number) {
    const temp = this.heap[idx1];
    this.heap[idx1] = this.heap[idx2];
    this.heap[idx2] = temp;
  }

  peek(): T {
    return this.heap[0];
  }

  pop(): T {
    const compareToIdx = (idx: number): number | null => {
      const lChildIdx = idx * 2 + 1;
      const rChildIdx = lChildIdx + 1;
      if (lChildIdx >= this.heap.length) {
        return null;
      } else if (rChildIdx >= this.heap.length) {
        return lChildIdx;
      }
      return this.compareIdx(lChildIdx, rChildIdx) > 0 ? lChildIdx : rChildIdx;
    };

    this.swap(0, this.heap.length - 1);
    const result = this.heap.pop();
    let idx = 0;
    while (idx < this.heap.length) {
      // find the bigger [l, r] child in the tree
      const biggerChildIdx = compareToIdx(idx);
      if (!biggerChildIdx || this.compareIdx(idx, biggerChildIdx) >= 0) break;
      // current item is bigger than the child; swap items and continue checking
      this.swap(idx, biggerChildIdx);
      idx = biggerChildIdx;
    }

    return result;
  }

  push(item: T) {
    const parentIdxOf = (i: number) => Math.max(0, Math.floor((i - 1) / 2));
    let idx = this.heap.push(item) - 1;
    let parentIdx = parentIdxOf(idx);
    while (this.compareIdx(idx, parentIdx) > 0) {
      this.swap(idx, parentIdx);
      idx = parentIdx;
      parentIdx = parentIdxOf(idx);
    }
  }

  get length() {
    return this.heap.length;
  }

  private compareIdx(idx1: number, idx2: number): number {
    return this.compareFn(this.heap[idx1], this.heap[idx2]);
  }

  toString() {
    const lines = [];
    for (let line = 0; line < this.heap.length; line++) {
      const count = Math.pow(2, line);
      const items = this.heap.slice(count - 1, count + count - 1);
      lines.push(items);
    }
    console.log(lines.join("\n"));
  }
}
