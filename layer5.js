import { decode } from "./lib/ascii85.js";
import {
  bytesToString,
  bytesToHexString,
  hexStringToBytes,
} from "./lib/utils.js";
import { createDecipheriv } from "node:crypto";

const ALGORITHM_WRAP = "id-aes256-wrap";
const ALGORITHM_CTR = "aes-256-ctr";

const decipher = (algorithm, key, iv, encrypted) => {
  const decipher = createDecipheriv(
    algorithm,
    Buffer.from(key),
    Buffer.from(iv)
  );
  let decrypted = decipher.update(bytesToHexString(encrypted), "hex", "hex");
  decrypted += decipher.final("hex");

  return hexStringToBytes(decrypted);
};

export const solve = (input) => {
  const ascii85Decoded = decode(input);

  const kek = ascii85Decoded.slice(0, 32);
  const kekIv = ascii85Decoded.slice(32, 40);
  const encryptedKey = ascii85Decoded.slice(40, 80);

  const key = decipher(ALGORITHM_WRAP, kek, kekIv, encryptedKey);
  const payloadIv = ascii85Decoded.slice(80, 96);
  const payload = ascii85Decoded.slice(96);

  const decrypted = decipher(ALGORITHM_CTR, key, payloadIv, payload);
  return bytesToString(decrypted);
};
