import { md5 } from "../md5";
import { range, uniqR } from "../util";

const salt = "ihaygndm";
// const salt = "abc";

const sequencesOfLength = (str: string, len: number) => {
  return range(0, str.length - len)
    .map((idx) => str.substring(idx, idx + len))
    .filter((str) => str.split("").every((char) => char === str.charAt(0)))
    .map((str) => str.charAt(0))
    .reduce(uniqR, []);
};

const hashit = (i: number) => {
  const key = salt + i;
  const hash = md5(key);
  const triples = sequencesOfLength(hash, 3);
  const pents = sequencesOfLength(hash, 5);
  return { key, hash, triples, pents };
};

const COUNT = 1000;
const window = range(0, COUNT - 1).map(hashit);

var i = 0;
const pads: any[] = [];
while (pads.length < 64) {
  const hash = window[i % COUNT];
  window[i % COUNT] = hashit(i + COUNT);
  const pents = window.flatMap((w) => w.pents);
  if (hash.triples.length && pents.includes(hash.triples[0])) {
    pads.push(hash);
  }
  i++;
}

console.log(window.length, pads.length, pads.slice().pop());
