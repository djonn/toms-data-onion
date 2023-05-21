import * as crypto from "node:crypto";

let ciphers = crypto
  .getCiphers()
  .map((cipherName) => crypto.getCipherInfo(cipherName))
  .filter(({ name }) => name.includes("aes") && name.includes("256"));

console.table(ciphers);
