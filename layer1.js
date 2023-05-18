import { decode } from "./lib/ascii85.js";

const rotateByteRight = (byte) => {
  const oldLeastSignificantBit = byte & 0b00000001;
  const newMostSignificantBit = oldLeastSignificantBit << 7;
  const shiftedByte = byte >>> 1;
  return newMostSignificantBit | shiftedByte;
};

const binaryOperation = (byte) => {
  const xored = byte ^ 0b01010101;
  return rotateByteRight(xored);
};

export const solve = (input) => {
  const ascii85Decoded = decode(input);
  const bytes = ascii85Decoded.split("").map((x) => x.charCodeAt(0));
  return bytes
    .map(binaryOperation)
    .map((byte) => String.fromCharCode(byte))
    .join("");
};
