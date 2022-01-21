import { createHash } from "crypto";

const md5 = (str: string) => createHash("md5").update(str).digest("hex");

const input = "wtnhxymk";
const example = "abc";

[example, input].forEach((prefix) => {
  let idx = -1;
  const pw = new Array(8).fill(null);
  while (pw.some((c) => c === null)) {
    let hash = md5(prefix + ++idx);
    while (!hash.startsWith("00000")) hash = md5(prefix + ++idx);
    const pos = parseInt(hash.charAt(5));
    const char = hash.charAt(6);
    if (!isNaN(pos) && pos < pw.length && !pw[pos]) {
      pw[pos] = char;
      console.log(hash, idx, pw.join(""));
    }
  }
});
