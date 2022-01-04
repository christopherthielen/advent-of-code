const input = "cqjxjnds";

const ACODE = "a".charCodeAt(0);
const code = (c: string) => (c.charCodeAt(0) - ACODE) as Char;
const toCodes = (str: string) => str.split("").map(code) as PW;
const fromCodes = (pw: PW) => pw.map((c) => String.fromCharCode(c + ACODE)).join("");
type Char = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25;
type PW = [Char, Char, Char, Char, Char, Char, Char, Char];

function increment(pw: PW, digit = pw.length - 1): void {
  pw[digit] = ((pw[digit] + 1) % 26) as Char;
  if (pw[digit] === 0) {
    increment(pw, digit - 1);
  }
}

const BAD = ["i", "o", "l"].map(code);
const hasBadChar = (pw: PW) => BAD.some((bad) => pw.includes(bad));
const hasAscender = (pw: PW) => {
  for (let i = 0; i < pw.length - 2; i++) {
    if (pw[i] === pw[i + 1] - 1 && pw[i] === pw[i + 2] - 2) {
      return true;
    }
  }
  return false;
};

const hasPairs = (pw: PW) => {
  const first = findPair(pw, 0);
  return first !== -1 && findPair(pw, first + 2) !== -1;
};

const findPair = (pw: PW, startIdx: number): number => {
  for (let i = startIdx; i < pw.length - 1; i++) {
    if (pw[i] === pw[i + 1]) {
      return i;
    }
  }
  return -1;
};

const isValid = (pw: PW) => !hasBadChar(pw) && hasAscender(pw) && hasPairs(pw);

const nextValid = (pw: PW) => {
  while (!isValid(pw)) {
    increment(pw);
  }
  return pw;
};

console.log(fromCodes(nextValid(toCodes(input))));
