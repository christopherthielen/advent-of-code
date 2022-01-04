import md5 from "md5";

const secret = "iwrupvqb";
for (let i = 0; true; i++) {
  if (md5(secret + i).startsWith("00000")) {
    console.log(secret, i, md5(secret + i));
    break;
  }
}
