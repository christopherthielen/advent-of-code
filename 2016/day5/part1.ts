import { createHash } from "crypto";

const md5 = (str: string) => createHash("md5").update(str).digest("hex");

const input = "wtnhxymk";
const example = "abc";

[example, input].forEach((prefix) => {
  let idx = -1;
  const pw = [];
  while (pw.length < 8) {
    let hash = md5(prefix + ++idx);
    while (!hash.startsWith("00000")) hash = md5(prefix + ++idx);
    pw.push(hash.charAt(5));
    console.log(hash, idx, pw.join(""));
  }
});
